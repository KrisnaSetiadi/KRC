
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Download, Search, ArrowUpDown, ChevronDown, Calendar as CalendarIcon, FileDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

type SortKey = keyof Omit<Submission, 'images'> | "";
type SortDirection = "asc" | "desc";

export function SubmissionTable() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filter, setFilter] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [sortKey, setSortKey] = useState<SortKey>("timestamp");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
      images: true,
      name: true,
      description: true,
      timestamp: true,
  });

  useEffect(() => {
    const storedSubmissions: Submission[] = JSON.parse(localStorage.getItem("submissions") || "[]");
    setSubmissions(storedSubmissions);
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
        link.download = `submission-${submission.name.replace(/\s+/g, '_')}-${submission.id.substring(0,8)}-image-${index + 1}.${fileExtension}`;
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
          s.name.toLowerCase().includes(filter.toLowerCase()) ||
          s.description.toLowerCase().includes(filter.toLowerCase())
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
        const valA = a[sortKey];
        const valB = b[sortKey];
        if (valA < valB) return sortDirection === "asc" ? -1 : 1;
        if (valA > valB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [submissions, filter, dateRange, sortKey, sortDirection]);

  const downloadFilteredData = () => {
    const dataStr = JSON.stringify(filteredAndSortedSubmissions, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `filtered_submissions_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const TableHeaderContent = [
    { key: "images", label: "Gambar", sortable: false },
    { key: "name", label: "Nama", sortable: true },
    { key: "description", label: "Deskripsi", sortable: true },
    { key: "timestamp", label: "Waktu", sortable: true },
  ];

  return (
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
                        className="w-[240px] justify-start text-left font-normal sm:w-auto"
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
                <PopoverContent className="w-auto p-0" align="start">
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
          <div className="flex gap-2 ml-auto">
             <Button variant="outline" onClick={downloadFilteredData} disabled={filteredAndSortedSubmissions.length === 0}>
                <FileDown className="mr-2 h-4 w-4" />
                Ekspor
              </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Kolom <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Alihkan kolom</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {TableHeaderContent.map((col) => (
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
                {TableHeaderContent.map((col) => columnVisibility[col.key] && (
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
                  <TableRow key={submission.id}>
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
                    </TableCell>}
                    {columnVisibility.name && <TableCell className="font-medium">{submission.name}</TableCell>}
                    {columnVisibility.description && <TableCell className="max-w-[200px] md:max-w-xs truncate">{submission.description}</TableCell>}
                    {columnVisibility.timestamp && <TableCell>{new Date(submission.timestamp).toLocaleString()}</TableCell>}
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => downloadImages(submission)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={Object.values(columnVisibility).filter(v => v).length + 1} className="h-24 text-center">
                    Tidak ada data upload yang ditemukan.
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
