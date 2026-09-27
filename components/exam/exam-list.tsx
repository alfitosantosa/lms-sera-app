"use client";

import {
  useChangeExamStatus,
  useDeleteExam,
  useGetExams,
} from "@/app/(hooks)/hooks/Exam/useExam";
import { useGetClasses } from "@/app/(hooks)/hooks/Classes/useClass";
import {
  EXAM_STATUS_LABELS,
  type ExamListItemDTO,
  type ExamStatusTypes,
} from "@/app/(types)/types/exam-types";
import { getErrorMessage } from "@/app/(types)";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart3, Eye, MoreHorizontal, Pencil, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { isExamApiError } from "./exam-shared";

type StatusFilter = "ALL" | ExamStatusTypes;

const STATUS_BADGE_VARIANTS: Record<
  ExamStatusTypes,
  "default" | "secondary" | "outline"
> = {
  DRAFT: "secondary",
  PUBLISHED: "default",
  CLOSED: "outline",
};

type PendingAction = {
  exam: ExamListItemDTO;
  action: "publish" | "close" | "delete";
};

/** Tabel daftar ujian dengan pencarian, filter, dan aksi per baris. */
export function ExamList() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [classId, setClassId] = useState("ALL");
  const [pending, setPending] = useState<PendingAction | null>(null);

  const classesQuery = useGetClasses();
  const classes = Array.isArray(classesQuery.data) ? classesQuery.data : [];
  const examsQuery = useGetExams({
    status: status === "ALL" ? undefined : status,
    classId: classId === "ALL" ? undefined : classId,
  });
  const exams = Array.isArray(examsQuery.data) ? examsQuery.data : [];

  const deleteExam = useDeleteExam();
  const changeStatus = useChangeExamStatus();
  const isMutating = deleteExam.isPending || changeStatus.isPending;

  const keyword = search.trim().toLowerCase();
  const filtered = keyword
    ? exams.filter((exam) => exam.title.toLowerCase().includes(keyword))
    : exams;

  const handleConfirm = async () => {
    if (!pending) return;
    const { exam, action } = pending;

    try {
      if (action === "delete") {
        const result = await deleteExam.mutateAsync(exam.id);
        if (isExamApiError(result))
          throw new Error(result.message);
        toast.success("Ujian berhasil dihapus");
      } else {
        const result = await changeStatus.mutateAsync({ id: exam.id, action });
        if (isExamApiError(result))
          throw new Error(result.message);
        toast.success(
          action === "publish"
            ? "Ujian berhasil dipublikasikan"
            : "Ujian berhasil ditutup",
        );
      }
      setPending(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="exam-search">Cari Ujian</Label>
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              id="exam-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari judul ujian..."
              className="pl-8"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="exam-status-filter">Status</Label>
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as StatusFilter)}
          >
            <SelectTrigger id="exam-status-filter" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua</SelectItem>
              {Object.entries(EXAM_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="exam-class-filter">Kelas</Label>
          <Select value={classId} onValueChange={setClassId}>
            <SelectTrigger id="exam-class-filter" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Kelas</SelectItem>
              {classes.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Judul</TableHead>
              <TableHead>Kelas</TableHead>
              <TableHead>Mata Pelajaran</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Soal</TableHead>
              <TableHead className="text-center">Durasi</TableHead>
              <TableHead className="text-center">Pengerjaan</TableHead>
              <TableHead className="w-16 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {examsQuery.isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 8 }).map((__, cell) => (
                    <TableCell key={cell}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="p-0">
                  <Empty>
                    <EmptyHeader>
                      <EmptyTitle>Belum ada ujian</EmptyTitle>
                      <EmptyDescription>
                        {keyword || status !== "ALL" || classId !== "ALL"
                          ? "Tidak ada ujian yang cocok dengan filter."
                          : "Buat ujian pertama untuk mulai menyusun soal."}
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/dashboard/teacher/exam/${exam.id}`}
                      className="hover:underline"
                    >
                      {exam.title}
                    </Link>
                  </TableCell>
                  <TableCell>{exam.className ?? "-"}</TableCell>
                  <TableCell>{exam.subjectName ?? "-"}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_BADGE_VARIANTS[exam.status]}>
                      {EXAM_STATUS_LABELS[exam.status] ?? exam.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {exam.questionCount}
                  </TableCell>
                  <TableCell className="text-center">
                    {exam.duration ? `${exam.duration} menit` : "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    {exam.attemptCount}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Aksi untuk ${exam.title}`}
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/teacher/exam/${exam.id}`}>
                            <Pencil className="mr-2 size-4" />
                            Detail
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/dashboard/teacher/exam/${exam.id}/preview`}
                          >
                            <Eye className="mr-2 size-4" />
                            Preview
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/dashboard/teacher/exam/${exam.id}/results`}
                          >
                            <BarChart3 className="mr-2 size-4" />
                            Hasil
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {exam.status === "DRAFT" && (
                          <DropdownMenuItem
                            onSelect={() =>
                              setPending({ exam, action: "publish" })
                            }
                          >
                            Publikasikan
                          </DropdownMenuItem>
                        )}
                        {exam.status === "PUBLISHED" && (
                          <DropdownMenuItem
                            onSelect={() =>
                              setPending({ exam, action: "close" })
                            }
                          >
                            Tutup
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={() =>
                            setPending({ exam, action: "delete" })
                          }
                        >
                          <Trash2 className="mr-2 size-4" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pending?.action === "delete"
                ? "Hapus ujian ini?"
                : pending?.action === "publish"
                  ? "Publikasikan ujian ini?"
                  : "Tutup ujian ini?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pending?.action === "delete" &&
                `Ujian "${pending.exam.title}" beserta soal dan hasil pengerjaannya akan dihapus permanen.`}
              {pending?.action === "publish" && (
                <>
                  Ujian &quot;{pending.exam.title}&quot; akan dibuka untuk siswa.
                  Pastikan:
                  <span className="mt-2 block">
                    • Ujian memiliki minimal 1 soal.
                    <br />• Durasi ujian sudah diisi.
                    <br />• Nilai kelulusan sudah diisi.
                  </span>
                  Soal tidak dapat diubah setelah ujian dipublikasikan.
                </>
              )}
              {pending?.action === "close" &&
                `Ujian "${pending.exam.title}" akan ditutup dan siswa tidak dapat lagi mengerjakannya.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void handleConfirm();
              }}
              disabled={isMutating}
            >
              {pending?.action === "delete"
                ? "Hapus"
                : pending?.action === "publish"
                  ? "Publikasikan"
                  : "Tutup"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
