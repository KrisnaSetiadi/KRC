
"use client";

import type { UserRole, User } from "@/lib/types";
import { useRouter } from "next/navigation";
import React, { createContext, useState, useEffect, ReactNode, useContext } from "react";
import { useToast } from "@/hooks/use-toast";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, getUser } from "@/lib/services";
import { auth } from "@/lib/firebase";

interface AuthContextType {
  currentUser: User | null;
  role: UserRole | null;
  loading: boolean;
  login: (credentials: Pick<User, 'email' | 'password'>) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

const adminEmails = [
  "admin@appskrc.com",
  "Krc@gmail.com"
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userData = await getUser(user.uid);
        if (userData) {
          setCurrentUser(userData);
          setRole(userData.role || 'user');
        } else {
          // User exists in Auth but not in Firestore, treat as an error state
          setCurrentUser(null);
          setRole(null);
          await signOut(auth);
        }
      } else {
        setCurrentUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

 const login = async (credentials: Pick<User, 'email' | 'password'>) => {
    setLoading(true);
    try {
      if (!credentials.password) {
        toast({ title: "Login Gagal", description: "Kata sandi diperlukan.", variant: "destructive" });
        setLoading(false);
        return;
      }

      const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
      const user = userCredential.user;
      
      const userData = await getUser(user.uid);

      if (userData) {
        if (userData.status === 'approved') {
          const userRole = adminEmails.includes(userData.email) ? 'admin' : 'user';
          await updateDoc(doc(db, "users", user.uid), { role: userRole });

          setCurrentUser({ ...userData, role: userRole });
          setRole(userRole);
          
          if (userRole === 'admin') {
            router.push('/dashboard/admin');
          } else {
            router.push('/dashboard/user');
          }
        } else {
          await signOut(auth);
          toast({
            title: "Login Gagal",
            description: "Akun Anda sedang menunggu persetujuan dari administrator.",
            variant: "destructive",
          });
        }
      } else {
        // This case should ideally not happen if registration is done correctly
        await signOut(auth);
        toast({
          title: "Login Gagal",
          description: "Data pengguna tidak ditemukan.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Login Gagal",
        description: "Email atau kata sandi tidak valid.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  const logout = async () => {
    setLoading(true);
    await signOut(auth);
    setCurrentUser(null);
    setRole(null);
    router.push("/login");
    setLoading(false);
  };

  const value = { currentUser, role, loading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
