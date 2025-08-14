
"use client";

import React, { useState, useEffect, useContext } from "react";
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
import { AuthContext } from "@/context/AuthContext";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../ui/dropdown-menu";
import { Download, FileText, FileType } from "lucide-react";
import { Document, Packer, Paragraph, TextRun, ImageRun } from 'docx';
import { saveAs } from 'file-saver';

export function UserSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const authContext = useContext(AuthContext);

  useEffect(() => {
    if (!authContext?.currentUser) return;

    const allSubmissions: Submission[] = JSON.parse(
      localStorage.getItem("submissions") || "[]"
    );
    const userSubmissions = allSubmissions.filter(
        sub => sub.userId === authContext.currentUser!.id
    );
    setSubmissions(userSubmissions);

    const handleStorageChange = () => {
        const updatedAllSubmissions: Submission[] = JSON.parse(
            localStorage.getItem("submissions") || "[]"
        );
        const updatedUserSubmissions = updatedAllSubmissions.filter(
            sub => sub.userId === authContext.currentUser!.id
        );
        setSubmissions(updatedUserSubmissions);
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [authContext?.currentUser]);

  const downloadAsCSV = () => {
    if (submissions.length === 0) return;

    const headers = ["ID", "Name", "Division", "Description", "Timestamp"];
    const csvRows = [headers.join(",")];

    for (const submission of submissions) {
      const values = [
        `"${submission.id}"`,
        `"${(submission.userName || "").replace(/"/g, '""')}"`,
        `"${(submission.userDivision || "").replace(/"/g, '""')}"`,
        `"${(submission.description || "").replace(/"/g, '""')}"`,
        `"${new Date(submission.timestamp).toLocaleString()}"`
      ];
      csvRows.push(values.join(","));
    }

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const date = new Date().toISOString().split('T')[0];
    saveAs(blob, `Data Order dan ${date}.csv`);
  };

  const downloadAsWord = async () => {
    if (submissions.length === 0) return;

    const sections = await Promise.all(submissions.map(async (submission, index) => {
        const imageRuns = await Promise.all(submission.images.map(async (imgDataUrl) => {
            const response = await fetch(imgDataUrl);
            const imageBuffer = await response.arrayBuffer();
            return new ImageRun({
                data: imageBuffer,
                transformation: {
                    width: 200,
                    height: 200,
                },
            });
        }));

        return {
            children: [
                new Paragraph({
                    children: [new TextRun({ text: `Laporan #${index + 1}`, bold: true, size: 28 })],
                    spacing: { after: 200 },
                }),
                new Paragraph({ text: `Nama: ${submission.userName || ""}` }),
                new Paragraph({ text: `Divisi: ${submission.userDivision || ""}` }),
                new Paragraph({ text: `Waktu: ${new Date(submission.timestamp).toLocaleString()}` }),
                new Paragraph({ text: `Deskripsi: ${submission.description || ""}` }),
                new Paragraph({ text: `Gambar:`, spacing: { before: 200, after: 200 } }),
                new Paragraph({ children: imageRuns }),
                new Paragraph({ text: "---", spacing: { before: 400, after: 400 } }),
            ],
        };
    }));
    
    const doc = new Document({
        sections: sections
    });

    Packer.toBlob(doc).then(blob => {
        const date = new Date().toISOString().split('T')[0];
        saveAs(blob, `Data Order dan ${date}.docx`);
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
            <CardTitle>Data Upload Saya</CardTitle>
            <CardDescription>
              Berikut adalah data upload yang telah Anda unggah.
            </CardDescription>
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={submissions.length === 0} className="w-full sm:w-auto">
                    <Download className="mr-2 h-4 w-4" />
                    <span>Download</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={downloadAsCSV}>
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Download sebagai .CSV</span>
                </DropdownMenuItem>
                 <DropdownMenuItem onClick={downloadAsWord}>
                    <FileType className="mr-2 h-4 w-4" />
                    <span>Download sebagai .Word</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
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
                            <DialogTitle>Gambar milik {submission.userName}</DialogTitle>
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
                    <TableCell className="font-medium">{submission.userName}</TableCell>
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
