
"use client";

import type { UserRole, User } from "@/lib/types";
import { useRouter } from "next/navigation";
import React, { createContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  role: UserRole | null;
  login: (credentials: Pick<User, 'email' | 'password'>) => void;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Kredensial admin statis untuk tujuan prototipe
const adminUsers = [
  { email: "admin@appskrc.com", password: "adminpassword" },
  { email: "Krc@gmail.com", password: "@Kebunrayacibodas11" },
];


export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedRole = localStorage.getItem("userRole") as UserRole | null;
      if (storedRole) {
        setRole(storedRole);
      }
    } catch (error) {
      console.error("Gagal mengakses localStorage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (credentials: Pick<User, 'email' | 'password'>) => {
    setLoading(true);

    // Cek kredensial admin
    const isAdmin = adminUsers.some(
        (admin) => admin.email === credentials.email && admin.password === credentials.password
    );

    if (isAdmin) {
      localStorage.setItem("userRole", 'admin');
      setRole('admin');
      router.push(`/dashboard/admin`);
      setLoading(false);
      return;
    }

    // Cek kredensial pengguna
    const storedUsers: User[] = JSON.parse(localStorage.getItem("users") || "[]");
    const foundUser = storedUsers.find(
      (user) => user.email === credentials.email && user.password === credentials.password
    );

    if (foundUser) {
      if (foundUser.status === 'approved') {
        localStorage.setItem("userRole", 'user');
        setRole('user');
        router.push(`/dashboard/user`);
      } else {
         toast({
          title: "Login Gagal",
          description: "Akun Anda sedang menunggu persetujuan dari administrator.",
          variant: "destructive",
        });
      }
    } else {
      // Jika bukan admin dan tidak ditemukan pengguna biasa
      toast({
        title: "Login Gagal",
        description: "Email atau kata sandi tidak valid.",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem("userRole");
    setRole(null);
    router.push("/login");
    setLoading(false);
  };

  const value = { role, login, logout, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
