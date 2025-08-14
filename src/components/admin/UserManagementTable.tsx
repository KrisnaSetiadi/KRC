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

export function UserManagementTable() {
  const [users, setUsers] = useState<User[]>([]);
  const { toast } = useToast();

  const fetchUsers = () => {
    const storedUsers: User[] = JSON.parse(
      localStorage.getItem("users") || "[]"
    );
    setUsers(storedUsers);
  }

  useEffect(() => {
    fetchUsers();
    
    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'users') {
            fetchUsers();
        }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };

  }, []);

  const approveUser = (userId: string) => {
    try {
        const updatedUsers = users.map(user => {
            if (user.id === userId) {
                return { ...user, status: 'approved' };
            }
            return user;
        });
        localStorage.setItem("users", JSON.stringify(updatedUsers));
        setUsers(updatedUsers);
        toast({
            title: "Pengguna Disetujui",
            description: "Pengguna sekarang dapat masuk ke akun mereka.",
        });
    } catch(error) {
        toast({
            title: "Kesalahan",
            description: "Gagal menyetujui pengguna. Silakan coba lagi.",
            variant: "destructive",
        });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manajemen Pengguna</CardTitle>
        <CardDescription>
          Setujui atau kelola pengguna terdaftar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
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
                      <Badge variant={user.status === 'approved' ? 'default' : 'secondary'} className="capitalize">
                        {user.status === 'approved' ? 'Disetujui' : 'Tertunda'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => approveUser(user.id)}
                        >
                          Setujui
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center"
                  >
                    Belum ada pengguna yang mendaftar.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
