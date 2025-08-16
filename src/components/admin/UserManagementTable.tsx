
"use client";

import React, { useState, useEffect } from "react";
import type { User } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MoreHorizontal, Trash2, Edit } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { getAllUsers, approveUserAccount, deleteUserAccount, updateUserEmail, updateUserPass } from "@/lib/services";
import { auth } from "@/lib/firebase";

const emailSchema = z.object({
    email: z.string().email("Alamat email tidak valid."),
});

const passwordSchema = z.object({
    password: z.string().min(6, "Kata sandi harus memiliki setidaknya 6 karakter."),
});

export function UserManagementTable() {
  const [users, setUsers] = useState<User[]>([]);
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const storedUsers = await getAllUsers();
      setUsers(storedUsers.filter(u => u.id !== auth.currentUser?.uid)); // Filter out current admin
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch users.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const approveUser = async (userId: string) => {
    try {
      await approveUserAccount(userId);
      await fetchUsers();
      toast({
        title: "Pengguna Disetujui",
        description: "Pengguna sekarang dapat masuk ke akun mereka.",
      });
    } catch (error) {
      toast({
        title: "Kesalahan",
        description: "Gagal menyetujui pengguna. Silakan coba lagi.",
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
        await deleteUserAccount(userId);
        await fetchUsers();
        toast({
            title: "Pengguna Dihapus",
            description: "Akun pengguna telah berhasil dihapus.",
        });
    } catch(error) {
         toast({
            title: "Kesalahan",
            description: "Gagal menghapus pengguna. Silakan coba lagi.",
            variant: "destructive",
        });
    }
  };

  const openEditEmailDialog = (user: User) => {
    setSelectedUser(user);
    emailForm.reset({ email: user.email });
    setIsEmailDialogOpen(true);
  };

  const openEditPasswordDialog = (user: User) => {
    setSelectedUser(user);
    passwordForm.reset({ password: "" });
    setIsPasswordDialogOpen(true);
  };

  const handleUpdateEmail = async (values: z.infer<typeof emailSchema>) => {
    if (!selectedUser) return;
    try {
        // This is complex with Firebase Auth, requires re-authentication.
        // For this prototype, we'll just update Firestore.
        // A real app would need a more secure flow.
        await updateUserEmail(selectedUser, values.email);
        await fetchUsers();
        toast({
            title: "Email Diperbarui",
            description: `Email untuk ${selectedUser.name} telah diubah.`,
        });
        setIsEmailDialogOpen(false);
    } catch(error) {
        toast({
            title: "Kesalahan",
            description: "Gagal memperbarui email. Pengguna mungkin perlu masuk kembali.",
            variant: "destructive",
        });
    }
  };

  const handleUpdatePassword = async (values: z.infer<typeof passwordSchema>) => {
    if (!selectedUser) return;
    try {
        await updateUserPass(selectedUser, values.password);
        toast({
            title: "Kata Sandi Diperbarui",
            description: `Kata sandi untuk ${selectedUser.name} telah diubah.`,
        });
        setIsPasswordDialogOpen(false);
    } catch(error) {
         console.error(error);
        toast({
            title: "Kesalahan",
            description: "Gagal memperbarui kata sandi. Pengguna mungkin perlu masuk kembali.",
            variant: "destructive",
        });
    }
  };


  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Manajemen Pengguna</CardTitle>
        <CardDescription>
          Setujui atau kelola pengguna terdaftar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Divisi</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tindakan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Memuat data pengguna...
                  </TableCell>
                </TableRow>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.division}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={user.status === "approved" ? "default" : "secondary"}
                        className="capitalize"
                      >
                        {user.status === "approved" ? "Disetujui" : "Tertunda"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.status === "pending" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => approveUser(user.id)}
                        >
                          Setujui
                        </Button>
                      ) : (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Buka menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Tindakan</DropdownMenuLabel>
                                 <DropdownMenuItem disabled>
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Ganti Email (Segera hadir)</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem disabled>
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Ganti Kata Sandi (Segera hadir)</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                            <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                                            <span className="text-destructive">Hapus Akun</span>
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus akun secara permanen.
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => deleteUser(user.id)}>Lanjutkan</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Belum ada pengguna yang mendaftar.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    {/* Dialogs remain for future implementation if needed */}
    </>
  );
}
