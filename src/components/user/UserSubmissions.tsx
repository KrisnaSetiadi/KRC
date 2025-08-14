
"use client";

import React, { useState, useEffect } from "react";
import type { Submission } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function UserSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    const storedSubmissions: Submission[] = JSON.parse(
      localStorage.getItem("submissions") || "[]"
    );
    setSubmissions(storedSubmissions);

    const handleStorageChange = () => {
        const updatedSubmissions: Submission[] = JSON.parse(
            localStorage.getItem("submissions") || "[]"
        );
        setSubmissions(updatedSubmissions);
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Upload Saya</CardTitle>
        <CardDescription>
          Berikut adalah data upload yang telah Anda unggah.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gambar</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Waktu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.length > 0 ? (
                submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                           <Image
                            src={submission.images[0]}
                            alt="submission thumbnail"
                            width={40}
                            height={40}
                            className="rounded-md object-cover cursor-pointer hover:scale-110 transition-transform"
                           />
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>Gambar milik {submission.name}</DialogTitle>
                          </DialogHeader>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4 max-h-[70vh] overflow-y-auto">
                            {submission.images.map((img, index) => (
                              <div key={index} className="relative aspect-square">
                                <Image src={img} alt={`submission image ${index + 1}`} fill sizes="33vw" className="rounded-lg object-cover" />
                              </div>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                    <TableCell className="font-medium">{submission.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{submission.description}</TableCell>
                    <TableCell>{new Date(submission.timestamp).toLocaleString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center"
                  >
                    Anda belum memiliki data upload.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
