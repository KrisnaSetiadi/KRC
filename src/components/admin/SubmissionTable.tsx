
"use client";

import React, { useState, useEffect, useMemo } from "react";
import type { Submission } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Download, Search, ArrowUpDown, ChevronDown, Calendar as CalendarIcon, FileDown, MoreHorizontal, Trash2, Edit, FileText, FileType } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { format, subDays, startOfMonth, endOfMonth, startOfYesterday, endOfYesterday } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Document, Packer, Paragraph, TextRun, ImageRun } from 'docx';
import { saveAs } from 'file-saver';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Separator } from "../ui/separator";

type SortKey = keyof Omit<Submission, 'images'> | "";
type SortDirection = "asc" | "desc";

const editSubmissionSchema = z.object({
  userName: z.string().min(2, "Nama harus memiliki setidaknya 2 karakter."),
  description: z.string().min(10, "Deskripsi harus memiliki setidaknya 10 karakter."),
});


export function SubmissionTable() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filter, setFilter] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [sortKey, setSortKey] = useState<SortKey>("timestamp");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
      images: true,
      userName: true,
      userDivision: true,
      description: true,
      timestamp: true,
  });
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const { toast } = useToast();

  const editForm = useForm<z.infer<typeof editSubmissionSchema>>({
    resolver: zodResolver(editSubmissionSchema),
  });

  const fetchSubmissions = () => {
    const storedSubmissions: Submission[] = JSON.parse(localStorage.getItem("submissions") || "[]");
    setSubmissions(storedSubmissions);
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleSort = (key: SortKey) => {
    if(!key) return;
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const downloadImages = (submission: Submission) => {
    submission.images.forEach((imageDataUrl, index) => {
        const link = document.createElement("a");
        link.href = imageDataUrl;
        const fileExtension = imageDataUrl.split(';')[0].split('/')[1];
        link.download = `submission-${submission.userName.replace(/\s+/g, '_')}-${submission.id.substring(0,8)}-image-${index + 1}.${fileExtension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
  };

  const filteredAndSortedSubmissions = useMemo(() => {
    let result = [...submissions];

    if (filter) {
      result = result.filter(
        (s) =>
          (s.userName || "").toLowerCase().includes(filter.toLowerCase()) ||
          (s.userDivision || "").toLowerCase().includes(filter.toLowerCase()) ||
          (s.description || "").toLowerCase().includes(filter.toLowerCase())
      );
    }

    if (dateRange?.from) {
        result = result.filter(s => {
            const submissionDate = new Date(s.timestamp);
            const fromDate = new Date(dateRange.from!);
            fromDate.setHours(0, 0, 0, 0);
            
            if(dateRange.to) {
                const toDate = new Date(dateRange.to);
                toDate.setHours(23, 59, 59, 999);
                return submissionDate >= fromDate && submissionDate <= toDate;
            }
            const toDate = new Date(dateRange.from!);
            toDate.setHours(23, 59, 59, 999);
            return submissionDate >= fromDate && submissionDate <= toDate;
        });
    }

    if (sortKey) {
      result.sort((a, b) => {
        const valA = a[sortKey as keyof Submission] || "";
        const valB = b[sortKey as keyof Submission] || "";
        if (valA < valB) return sortDirection === "asc" ? -1 : 1;
        if (valA > valB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [submissions, filter, dateRange, sortKey, sortDirection]);

  useEffect(() => {
    setSelectedSubmissions([]);
  }, [filter, dateRange]);

  const downloadFilteredDataAsCSV = () => {
    if (filteredAndSortedSubmissions.length === 0) return;

    const headers = ["ID", "Name", "Division", "Description", "Timestamp"];
    const csvRows = [headers.join(",")];

    for (const submission of filteredAndSortedSubmissions) {
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

  const downloadFilteredDataAsWord = async () => {
    if (filteredAndSortedSubmissions.length === 0) return;

    const sections = await Promise.all(filteredAndSortedSubmissions.map(async (submission, index) => {
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
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSubmissions(filteredAndSortedSubmissions.map(s => s.id));
    } else {
      setSelectedSubmissions([]);
    }
  };

  const handleSelectSingle = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedSubmissions(prev => [...prev, id]);
    } else {
      setSelectedSubmissions(prev => prev.filter(subId => subId !== id));
    }
  };

  const deleteSubmissions = (ids: string[]) => {
    try {
      const updatedSubmissions = submissions.filter(s => !ids.includes(s.id));
      localStorage.setItem("submissions", JSON.stringify(updatedSubmissions));
      setSubmissions(updatedSubmissions);
      setSelectedSubmissions([]);
      toast({
        title: "Sukses",
        description: `${ids.length} data upload berhasil dihapus.`,
      });
    } catch (error) {
      toast({
        title: "Kesalahan",
        description: "Gagal menghapus data upload.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (submission: Submission) => {
    setSelectedSubmission(submission);
    editForm.reset({
      userName: submission.userName,
      description: submission.description,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateSubmission = (values: z.infer<typeof editSubmissionSchema>) => {
    if (!selectedSubmission) return;
    try {
      const updatedSubmissions = submissions.map(s => {
        if (s.id === selectedSubmission.id) {
          return { ...s, userName: values.userName, description: values.description, timestamp: new Date().toISOString() };
        }
        return s;
      });
      localStorage.setItem("submissions", JSON.stringify(updatedSubmissions));
      setSubmissions(updatedSubmissions);
      setIsEditDialogOpen(false);
      toast({
        title: "Sukses",
        description: "Data upload berhasil diperbarui.",
      });
    } catch (error) {
      toast({
        title: "Kesalahan",
        description: "Gagal memperbarui data upload.",
        variant: "destructive",
      });
    }
  };

  const handleDatePreset = (preset: string) => {
    const now = new Date();
    switch (preset) {
        case 'today':
            setDateRange({ from: now, to: now });
            break;
        case 'yesterday':
            const yesterday = subDays(now, 1);
            setDateRange({ from: yesterday, to: yesterday });
            break;
        case 'last7':
            setDateRange({ from: subDays(now, 6), to: now });
            break;
        case 'last30':
            setDateRange({ from: subDays(now, 29), to: now });
            break;
        case 'thisMonth':
            setDateRange({ from: startOfMonth(now), to: endOfMonth(now) });
            break;
        case 'lastMonth':
            const lastMonthStart = startOfMonth(subDays(startOfMonth(now), 1));
            const lastMonthEnd = endOfMonth(lastMonthStart);
            setDateRange({ from: lastMonthStart, to: lastMonthEnd });
            break;
        default:
            setDateRange(undefined);
    }
  };


  const TableHeaderContent = [
    { key: "checkbox", label: "", sortable: false },
    { key: "images", label: "Gambar", sortable: false },
    { key: "userName", label: "Nama", sortable: true },
    { key: "userDivision", label: "Divisi", sortable: true },
    { key: "description", label: "Deskripsi", sortable: true },
    { key: "timestamp", label: "Waktu", sortable: true },
  ];

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Data upload</CardTitle>
        <CardDescription>Daftar semua data upload dari pengguna.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-4">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Filter data upload..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-8 sm:w-[300px] w-full"
            />
          </div>
          <div className="flex gap-2 items-center w-full sm:w-auto">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className="w-full sm:w-[300px] justify-start text-left font-normal"
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                        dateRange.to ? (
                            <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                            </>
                        ) : (
                            format(dateRange.from, "LLL dd, y")
                        )
                        ) : (
                        <span>Pilih tanggal</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="flex w-auto flex-row p-2" align="start">
                    <div className="flex flex-col space-y-2 pr-4 border-r">
                         <Button variant="ghost" className="justify-start" onClick={() => handleDatePreset('today')}>Hari ini</Button>
                         <Button variant="ghost" className="justify-start" onClick={() => handleDatePreset('yesterday')}>Kemarin</Button>
                         <Button variant="ghost" className="justify-start" onClick={() => handleDatePreset('last7')}>7 hari terakhir</Button>
                         <Button variant="ghost" className="justify-start" onClick={() => handleDatePreset('last30')}>30 hari terakhir</Button>
                         <Button variant="ghost" className="justify-start" onClick={() => handleDatePreset('thisMonth')}>Bulan ini</Button>
                         <Button variant="ghost" className="justify-start" onClick={() => handleDatePreset('lastMonth')}>Bulan lalu</Button>
                    </div>
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={1}
                    />
                </PopoverContent>
            </Popover>
            <Button onClick={() => setDateRange(undefined)} variant="ghost" disabled={!dateRange}>Hapus</Button>
          </div>
          <div className="flex gap-2 ml-auto w-full sm:w-auto flex-wrap">
             {selectedSubmissions.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full sm:w-auto">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Hapus ({selectedSubmissions.length})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tindakan ini akan menghapus {selectedSubmissions.length} data upload yang dipilih secara permanen.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteSubmissions(selectedSubmissions)}>Lanjutkan</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
             )}
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" disabled={filteredAndSortedSubmissions.length === 0} className="w-full sm:w-auto">
                        <FileDown className="mr-2 h-4 w-4" />
                        Download
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={downloadFilteredDataAsCSV}>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Download sebagai .CSV</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={downloadFilteredDataAsWord}>
                        <FileType className="mr-2 h-4 w-4" />
                        <span>Download sebagai .Word</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  Kolom <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Alihkan kolom</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {TableHeaderContent.slice(1).map((col) => (
                    <DropdownMenuCheckboxItem
                      key={col.key}
                      className="capitalize"
                      checked={columnVisibility[col.key]}
                      onCheckedChange={(value) =>
                        setColumnVisibility((prev) => ({ ...prev, [col.key]: !!value }))
                      }
                    >
                      {col.label}
                    </DropdownMenuCheckboxItem>
                  )
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                 <TableHead className="px-4">
                    <Checkbox
                        checked={selectedSubmissions.length > 0 && selectedSubmissions.length === filteredAndSortedSubmissions.length}
                        onCheckedChange={(checked) => handleSelectAll(!!checked)}
                        aria-label="Pilih semua"
                        disabled={filteredAndSortedSubmissions.length === 0}
                    />
                </TableHead>
                {TableHeaderContent.slice(1).map((col) => columnVisibility[col.key] && (
                  <TableHead key={col.key} onClick={() => col.sortable && handleSort(col.key as SortKey)} className={col.sortable ? "cursor-pointer" : ""}>
                    {col.label}
                    {col.sortable && <ArrowUpDown className="ml-2 h-4 w-4 inline opacity-50" />}
                  </TableHead>
                ))}
                <TableHead>Tindakan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedSubmissions.length > 0 ? (
                filteredAndSortedSubmissions.map((submission) => (
                  <TableRow key={submission.id} data-state={selectedSubmissions.includes(submission.id) ? "selected" : undefined}>
                    <TableCell className="px-4">
                        <Checkbox
                            checked={selectedSubmissions.includes(submission.id)}
                            onCheckedChange={(checked) => handleSelectSingle(submission.id, !!checked)}
                            aria-label="Pilih baris"
                        />
                    </TableCell>
                    {columnVisibility.images && <TableCell>
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
                    </TableCell>}
                    {columnVisibility.userName && <TableCell className="font-medium">{submission.userName}</TableCell>}
                    {columnVisibility.userDivision && <TableCell>{submission.userDivision}</TableCell>}
                    {columnVisibility.description && <TableCell className="max-w-[150px] md:max-w-xs truncate">{submission.description}</TableCell>}
                    {columnVisibility.timestamp && <TableCell>{new Date(submission.timestamp).toLocaleString()}</TableCell>}
                    <TableCell>
                       <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Buka menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Tindakan</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => downloadImages(submission)}>
                                    <Download className="mr-2 h-4 w-4" />
                                    <span>Download Gambar</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openEditDialog(submission)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Edit</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            <span>Hapus</span>
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus data upload secara permanen.
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => deleteSubmissions([submission.id])}>Lanjutkan</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={Object.values(columnVisibility).filter(v => v).length + 2} className="h-24 text-center">
                    Tidak ada data upload yang ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Edit Data Upload</DialogTitle>
            </DialogHeader>
            <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(handleUpdateSubmission)} className="space-y-4 py-4">
                    <FormField
                        control={editForm.control}
                        name="userName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nama</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={editForm.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Deskripsi</FormLabel>
                                <FormControl>
                                    <Textarea className="resize-none" rows={5} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">Batal</Button>
                        </DialogClose>
                        <Button type="submit">Simpan Perubahan</Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    </Dialog>
    </>
  );
}

    