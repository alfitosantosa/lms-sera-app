"use client";

import { ExamForm } from "@/components/exam/exam-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreateExamPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard/teacher/exam">
          <ArrowLeft className="mr-2 size-4" />
          Kembali ke Daftar Ujian
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Buat Ujian</CardTitle>
          <CardDescription>
            Isi informasi dasar ujian. Soal dapat ditambahkan setelah ujian
            dibuat.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExamForm
            mode="create"
            onCreated={(id) => router.push(`/dashboard/teacher/exam/${id}`)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
