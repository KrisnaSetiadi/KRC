
"use client";
import React, { useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Users, FileText, Menu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

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
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b border-white/20 bg-background/5 backdrop-blur-lg px-4 md:px-6 z-50 text-white">
      <div className="flex items-center gap-2 text-lg font-semibold md:text-base">
        <Link href="/" className="font-bold font-headline text-white">Apps KRC</Link>
      </div>

      {role === 'admin' && (
        <>
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6 ml-6">
          {navItems.map((item) => (
             <Link
                key={item.href}
                href={item.href}
                className={cn(
                    "transition-colors hover:text-white",
                    pathname.startsWith(item.href) ? "text-white font-semibold" : "text-white/70"
                )}
                >
                {item.label}
            </Link>
          ))}
        </nav>
        <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden bg-transparent border-white/50 hover:bg-white/10"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Alihkan menu navigasi</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-background/80 backdrop-blur-lg text-white border-r-white/20">
              <nav className="grid gap-6 text-lg font-medium">
                <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
                  <span className="font-bold font-headline text-white">Apps KRC</span>
                </Link>
                 {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn("hover:text-white", pathname.startsWith(item.href) ? "text-white" : "text-white/70")}
                    >
                        {item.label}
                    </Link>
                 ))}
              </nav>
            </SheetContent>
          </Sheet>
        </>
      )}

      <div className="flex items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        {role && (
          <Badge variant="outline" className="capitalize text-sm bg-transparent border-white/50 text-white">
            {role === 'admin' ? 'Admin' : 'Pengguna'}
          </Badge>
        )}
        <Button variant="ghost" size="icon" onClick={logout} aria-label="Keluar" className="hover:bg-white/10">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
