
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

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
  });

  const fetchUsers = () => {
    const storedUsers: User[] = JSON.parse(
      localStorage.getItem("users") || "[]"
    );
    setUsers(storedUsers);
  };

  useEffect(() => {
    fetchUsers();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "users") {
        fetchUsers();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const approveUser = (userId: string) => {
    try {
      const updatedUsers = users.map((user) => {
        if (user.id === userId) {
          return { ...user, status: "approved" };
        }
        return user;
      });
      localStorage.setItem("users", JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
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

  const deleteUser = (userId: string) => {
    try {
        const updatedUsers = users.filter(user => user.id !== userId);
        localStorage.setItem("users", JSON.stringify(updatedUsers));
        setUsers(updatedUsers);
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

  const handleUpdateEmail = (values: z.infer<typeof emailSchema>) => {
    if (!selectedUser) return;
    try {
        const updatedUsers = users.map(user => {
            if (user.id === selectedUser.id) {
                return { ...user, email: values.email };
            }
            return user;
        });
        localStorage.setItem("users", JSON.stringify(updatedUsers));
        setUsers(updatedUsers);
        toast({
            title: "Email Diperbarui",
            description: `Email untuk ${selectedUser.name} telah diubah.`,
        });
        setIsEmailDialogOpen(false);
    } catch(error) {
        toast({
            title: "Kesalahan",
            description: "Gagal memperbarui email.",
            variant: "destructive",
        });
    }
  };

  const handleUpdatePassword = (values: z.infer<typeof passwordSchema>) => {
    if (!selectedUser) return;
    try {
        const updatedUsers = users.map(user => {
            if (user.id === selectedUser.id) {
                return { ...user, password: values.password };
            }
            return user;
        });
        localStorage.setItem("users", JSON.stringify(updatedUsers));
        setUsers(updatedUsers);
        toast({
            title: "Kata Sandi Diperbarui",
            description: `Kata sandi untuk ${selectedUser.name} telah diubah.`,
        });
        setIsPasswordDialogOpen(false);
    } catch(error) {
        toast({
            title: "Kesalahan",
            description: "Gagal memperbarui kata sandi.",
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
              {users.length > 0 ? (
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
                                <DropdownMenuItem onClick={() => openEditEmailDialog(user)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Ganti Email</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openEditPasswordDialog(user)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Ganti Kata Sandi</span>
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

    {/* Dialog for Editing Email */}
    <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
            <DialogTitle>Ganti Email untuk {selectedUser?.name}</DialogTitle>
            </DialogHeader>
            <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(handleUpdateEmail)} className="space-y-4">
                    <FormField
                        control={emailForm.control}
                        name="email"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email Baru</FormLabel>
                            <FormControl>
                            <Input placeholder="nama@contoh.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">Batal</Button>
                        </DialogClose>
                        <Button type="submit">Simpan Perubahan</Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    </Dialog>

    {/* Dialog for Editing Password */}
    <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
            <DialogTitle>Ganti Kata Sandi untuk {selectedUser?.name}</DialogTitle>
            </DialogHeader>
            <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(handleUpdatePassword)} className="space-y-4">
                    <FormField
                        control={passwordForm.control}
                        name="password"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Kata Sandi Baru</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <DialogFooter>
                         <DialogClose asChild>
                            <Button type="button" variant="secondary">Batal</Button>
                        </DialogClose>
                        <Button type="submit">Simpan Perubahan</Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    </Dialog>
    </>
  );
}

    