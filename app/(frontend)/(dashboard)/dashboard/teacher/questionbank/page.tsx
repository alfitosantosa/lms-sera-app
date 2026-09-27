"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

/**
 * Bank soal terpusat belum diimplementasikan. Soal saat ini dikelola
 * langsung dari masing-masing ujian (menu Ujian → detail ujian).
 */
export default function QuestionBankPage() {
  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Bank Soal</CardTitle>
          <CardDescription>
            Bank soal terpusat belum tersedia. Saat ini soal dibuat langsung di
            dalam ujian, sehingga bobot dan urutannya bisa diatur per ujian.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/dashboard/teacher/exam">Buka Daftar Ujian</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
