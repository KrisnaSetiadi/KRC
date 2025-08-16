
"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserAccount, getAllUsers } from "@/lib/services";
import Image from "next/image";

const formSchema = z.object({
  name: z.string().min(2, "Nama harus memiliki setidaknya 2 karakter."),
  division: z.string().min(1, "Divisi diperlukan."),
  email: z.string().email("Alamat email tidak valid."),
  password: z.string().min(6, "Kata sandi harus memiliki setidaknya 6 karakter."),
});

type FormValues = z.infer<typeof formSchema>;

export function RegisterPage() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      division: "",
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      const existingUsers = await getAllUsers();
      const userExists = existingUsers.some(user => user.email === data.email);

      if (userExists) {
        toast({
          title: "Pendaftaran Gagal",
          description: "Akun dengan email ini sudah ada.",
          variant: "destructive",
        });
        return;
      }
      
      await createUserAccount(data);

      toast({
        title: "Pendaftaran Berhasil",
        description: "Akun Anda sekarang menunggu persetujuan dari administrator.",
      });

      router.push("/login");

    } catch (error) {
       console.error(error);
      toast({
        title: "Kesalahan",
        description: "Terjadi kesalahan saat pendaftaran. Silakan coba lagi.",
        variant: "destructive",
      });
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4">
       <Image
          src="https://i.ibb.co/1thY6rpr/Whats-App-Image-2025-08-14-at-11-29-28-fbf0ce79.jpg"
          alt="Background"
          layout="fill"
          objectFit="cover"
          className="absolute inset-0 z-0"
        />
      <div className="w-full max-w-md z-10">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Buat Akun Pengguna</CardTitle>
            <CardDescription>Masukkan detail Anda untuk mendaftar.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="division"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Divisi</FormLabel>
                      <FormControl>
                        <Input placeholder="cth. Pemasaran" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Mendaftar..." : "Daftar"}
                </Button>
              </form>
            </Form>
            <div className="mt-4 text-center text-sm">
              Sudah punya akun?{" "}
              <Link href="/login" className="underline">
                Masuk
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
