
"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import type { UnsavedSubmission } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { createSubmission } from "@/lib/services";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 5;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  description: z.string().min(10, "Deskripsi harus memiliki setidaknya 10 karakter.").max(500, "Deskripsi harus kurang dari 500 karakter."),
  images: z.custom<FileList>()
    .refine(files => files?.length > 0, "Setidaknya satu gambar diperlukan.")
    .refine(files => files.length <= MAX_FILES, `Anda dapat mengunggah maksimal ${MAX_FILES} gambar.`)
    .refine(files => Array.from(files).every((file) => file.size <= MAX_FILE_SIZE), `Ukuran file maksimal adalah 5MB.`)
    .refine(files => Array.from(files).every((file) => ACCEPTED_IMAGE_TYPES.includes(file.type)), "File .jpg, .jpeg, .png dan .webp diterima."),
});

type FormValues = z.infer<typeof formSchema>;

export function SubmissionForm() {
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
    },
  });

  const fileRef = form.register("images");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
        const currentPreviews = [...imagePreviews];
        const filesArray = Array.from(files);
        
        const remainingSlots = MAX_FILES - currentPreviews.length;
        if (filesArray.length > remainingSlots) {
            toast({
                title: "Terlalu banyak gambar",
                description: `Anda hanya dapat menambahkan ${remainingSlots} gambar lagi.`,
                variant: "destructive"
            });
            return;
        }

        filesArray.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(current => [...current, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    }
  };

  const removeImage = (index: number) => {
    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
    
    const currentFiles = Array.from(form.getValues("images") || []);
    currentFiles.splice(index, 1);
    
    const dataTransfer = new DataTransfer();
    currentFiles.forEach(file => dataTransfer.items.add(file as File));
    form.setValue("images", dataTransfer.files, { shouldValidate: true });
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!currentUser) {
       toast({
        title: "Kesalahan",
        description: "Tidak dapat mengidentifikasi pengguna. Silakan login kembali.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const newSubmission: UnsavedSubmission = {
        userId: currentUser.id,
        userName: currentUser.name,
        userDivision: currentUser.division,
        description: data.description,
        images: imagePreviews, // These are data URLs
      };

      await createSubmission(newSubmission);
      
      toast({
        title: "Berhasil!",
        description: "Formulir Anda telah dikirim.",
      });

      form.reset();
      setImagePreviews([]);
      // Trigger a refresh or state update in the UserSubmissions component
      window.dispatchEvent(new Event('storage'));

    } catch (error) {
       console.error(error);
      toast({
        title: "Kesalahan",
        description: "Terjadi kesalahan. Silakan coba lagi.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Buat Data Upload</CardTitle>
        <CardDescription>Isi formulir di bawah ini untuk mengirimkan entri Anda.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
             <FormItem>
                <FormLabel>Gambar</FormLabel>
                <FormControl>
                    <div className="flex items-center justify-center w-full">
                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted/50 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Klik untuk mengunggah</span> atau seret dan lepas</p>
                                <p className="text-xs text-muted-foreground">PNG, JPG, atau WEBP (MAKS. 5MB per file, hingga 5 gambar)</p>
                            </div>
                            <Input id="dropzone-file" type="file" className="hidden" multiple accept={ACCEPTED_IMAGE_TYPES.join(",")} {...fileRef} onChange={handleImageChange} />
                        </label>
                    </div> 
                </FormControl>
                <FormMessage>{form.formState.errors.images?.message as React.ReactNode}</FormMessage>
            </FormItem>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {imagePreviews.map((src, index) => (
                  <div key={index} className="relative group aspect-square">
                    <Image src={src} alt={`Pratinjau ${index}`} fill sizes="20vw" className="rounded-md object-cover" />
                    <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeImage(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi Gambar</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ceritakan sedikit tentang gambar-gambar itu" className="resize-none" rows={5} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting || !currentUser} className="w-full sm:w-auto">
              {form.formState.isSubmitting ? "Mengirim..." : "Kirim Formulir"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
