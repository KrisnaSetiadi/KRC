"use client";

import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const router = useRouter();
  const authContext = useContext(AuthContext);

  useEffect(() => {
    if (authContext && !authContext.loading) {
      if (authContext.role) {
        router.push(`/dashboard/${authContext.role}`);
      } else {
        router.push("/login");
      }
    }
  }, [authContext, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-4xl font-bold text-primary">Apps KRC</h1>
        <p className="text-muted-foreground">Memuat...</p>
        <Skeleton className="h-4 w-64 mt-2" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  );
}
