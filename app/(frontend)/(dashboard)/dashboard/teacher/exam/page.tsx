"use client";

import { ExamList } from "@/components/exam/exam-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function TeacherExamPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Ujian</h1>
          <p className="text-muted-foreground text-sm">
            Kelola ujian, soal, dan hasil pengerjaan siswa.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/teacher/exam/create">
            <Plus className="mr-2 size-4" />
            Buat Ujian
          </Link>
        </Button>
      </div>

      <ExamList />
    </div>
  );
}
