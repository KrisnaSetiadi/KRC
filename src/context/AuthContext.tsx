
"use client";

import type { UserRole, User } from "@/lib/types";
import { useRouter } from "next/navigation";
import React, { createContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  role: UserRole | null;
  currentUser: User | null;
  login: (credentials: Pick<User, 'email' | 'password'>) => void;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Kredensial admin statis untuk tujuan prototipe
const adminUsers = [
  { id: 'admin-1', name: 'Admin KRC', division: 'IT', email: "admin@appskrc.com", password: "adminpassword", status: 'approved' as const },
  { id: 'admin-2', name: 'Admin Cibodas', division: 'IT', email: "Krc@gmail.com", password: "@Kebunrayacibodas11", status: 'approved' as const },
];


export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedRole = localStorage.getItem("userRole") as UserRole | null;
      const storedUser = localStorage.getItem("currentUser");
      if (storedRole) {
        setRole(storedRole);
      }
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
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
    const adminUser = adminUsers.find(
        (admin) => admin.email === credentials.email && admin.password === credentials.password
    );

    if (adminUser) {
      const adminData: User = { ...adminUser, role: 'admin' };
      localStorage.setItem("userRole", 'admin');
      localStorage.setItem("currentUser", JSON.stringify(adminData));
      setRole('admin');
      setCurrentUser(adminData);
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
        localStorage.setItem("currentUser", JSON.stringify(foundUser));
        setRole('user');
        setCurrentUser(foundUser);
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
    localStorage.removeItem("currentUser");
    setRole(null);
    setCurrentUser(null);
    router.push("/login");
    setLoading(false);
  };

  const value = { role, currentUser, login, logout, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
