"use client";
import React, { useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Users, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function DashboardHeader() {
  const authContext = useContext(AuthContext);
  const pathname = usePathname();

  if (!authContext) {
    return null;
  }
  const { role, logout } = authContext;

  const navItems = [
    { href: "/dashboard/admin/users", label: "Manajemen Pengguna", icon: Users },
    { href: "/dashboard/admin/submissions", label: "Data upload", icon: FileText },
  ];

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
      <div className="flex items-center gap-2 text-lg font-semibold md:text-base">
        <Link href="/" className="font-bold font-headline text-primary">Apps KRC</Link>
      </div>

      {role === 'admin' && (
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-muted-foreground ml-6">
          {navItems.map((item) => (
             <Link
                key={item.href}
                href={item.href}
                className={cn(
                    "transition-colors hover:text-foreground",
                    pathname.startsWith(item.href) ? "text-foreground font-semibold" : ""
                )}
                >
                {item.label}
            </Link>
          ))}
        </nav>
      )}

      <div className="flex items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        {role && (
          <Badge variant="secondary" className="capitalize text-sm">
            {role === 'admin' ? 'Admin' : 'Pengguna'}
          </Badge>
        )}
        <Button variant="ghost" size="icon" onClick={logout} aria-label="Keluar">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
