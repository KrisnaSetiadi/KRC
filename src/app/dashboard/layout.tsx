
"use client";

import React, { useContext, useEffect } from "react";
import { AuthContext } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const authContext = useContext(AuthContext);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (authContext && !authContext.loading) {
        if(!authContext.role) {
            router.push("/login");
        } else if (!pathname.startsWith(`/dashboard/${authContext.role}`)) {
             router.push(`/dashboard/${authContext.role}`)
        }
    }
  }, [authContext, router, pathname]);

  if (!authContext || authContext.loading || !authContext.role) {
    return (
      <div className="flex h-screen w-full flex-col">
        <header className="flex h-16 items-center justify-between border-b px-6">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </header>
        <main className="flex-1 p-6">
          <Skeleton className="h-full w-full rounded-lg" />
        </main>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col">
       <Image
          src="https://i.ibb.co/h1xnFfHM/Whats-App-Image-2025-08-14-at-11-29-15-8a44bb41.jpg"
          alt="Dashboard Background"
          layout="fill"
          objectFit="cover"
          className="absolute inset-0 z-0"
        />
        <div className="absolute inset-0 z-10 bg-black/50" />
      <div className="relative z-20 flex min-h-screen w-full flex-col bg-transparent">
        <DashboardHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            {children}
        </main>
      </div>
    </div>
  );
}
