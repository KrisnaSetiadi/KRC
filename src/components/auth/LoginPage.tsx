
"use client";

import { useContext, useEffect } from "react";
import { AuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { KeyRound } from "lucide-react";

const formSchema = z.object({
  email: z.string().email("Alamat email tidak valid."),
  password: z.string().min(1, "Kata sandi diperlukan."),
});

type FormValues = z.infer<typeof formSchema>;


export function LoginPage() {
  const authContext = useContext(AuthContext);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (authContext && !authContext.loading && authContext.role) {
      router.push(`/dashboard/${authContext.role}`);
    }
  }, [authContext, router]);

  if (!authContext || authContext.loading || authContext.role) {
     return (
        <div className="flex h-screen w-full items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Skeleton className="h-12 w-48" />
                <Skeleton className="h-8 w-64" />
            </div>
        </div>
    );
  }

  const { login } = authContext;

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    login(data);
  };

  return (
    <main 
      className="flex min-h-screen flex-col items-center justify-center p-4 bg-background"
    >
      <div className="w-full max-w-md">
        <Card>
            <CardHeader className="items-center text-center">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                  <KeyRound className="w-12 h-12 text-primary"/>
              </div>
              <CardTitle className="font-headline text-3xl">Apps KRC</CardTitle>
              <CardDescription>Masuk untuk mengakses dasbor Anda.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="nama@contoh.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kata Sandi</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    Masuk
                  </Button>
                </form>
              </Form>
              <div className="mt-4 text-center text-sm">
                Belum punya akun?{" "}
                <Link href="/register" className="underline">
                  Daftar
                </Link>
              </div>
            </CardContent>
          </Card>
      </div>
    </main>
  );
}
