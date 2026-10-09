"use client";

import { useGetDevelopmentMe } from "@/app/(hooks)/hooks/Development/useDevelopmentMe";
import { useGetStudentsByIds } from "@/app/(hooks)/hooks/Users/useStudentByIds";
import { useGetUserByIdBetterAuth } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import { PublishedReportView } from "@/components/development/published-report-view";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "@/lib/betterauth/authClients";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

/**
 * Rapor anak untuk orang tua — hanya rapor `PUBLISHED`.
 *
 * Daftar rapor datang dari `/api/development/me` (server hanya mengirim yang
 * sudah terbit); detailnya dibaca lewat endpoint rapor yang sama seperti
 * halaman guru, dan backend menolak status lain dengan 404.
 */
export default function ParentReportPage() {
  const { data: session } = useSession();
  const { data: userData } = useGetUserByIdBetterAuth(session?.user?.id ?? "");
  const studentIds = userData?.studentIds ?? [];

  const { data: children = [], isLoading: isLoadingChildren } =
    useGetStudentsByIds(studentIds);
  const { data: summary, isLoading: isLoadingSummary } = useGetDevelopmentMe();

  const [selectedChildId, setSelectedChildId] = useState("");
  const [selectedReportId, setSelectedReportId] = useState("");

  const students = summary?.students ?? [];
  const activeChildId = selectedChildId || children[0]?.id || "";
  const child = students.find((item) => item.student.id === activeChildId);
  const reports = child?.reports ?? [];
  const activeReportId =
    reports.find((report) => report.id === selectedReportId)?.id ??
    reports[0]?.id ??
    "";

  if (isLoadingSummary || isLoadingChildren) return <Loading />;

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-foreground text-3xl font-semibold tracking-tight">Rapor Anak</h1>
            <p className="text-muted-foreground">
              Rapor yang sudah diterbitkan sekolah
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard/parent/development">
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pilih Anak</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Select value={activeChildId} onValueChange={setSelectedChildId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih anak" />
              </SelectTrigger>
              <SelectContent>
                {children.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {reports.length > 0 && (
              <Select
                value={activeReportId}
                onValueChange={setSelectedReportId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih periode" />
                </SelectTrigger>
                <SelectContent>
                  {reports.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.periodName}
                      {item.publishedAt
                        ? ` • ${format(new Date(item.publishedAt), "d MMM yyyy", { locale: localeId })}`
                        : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>

        {reports.length === 0 ? (
          <Card>
            <CardContent className="text-muted-foreground py-10 text-center text-sm">
              Belum ada rapor yang diterbitkan untuk anak ini.
            </CardContent>
          </Card>
        ) : (
          <PublishedReportView reportId={activeReportId} />
        )}
      </div>
    </div>
  );
}
