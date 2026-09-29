"use client";

import { useGetDevelopmentMe } from "@/app/(hooks)/hooks/Development/useDevelopmentMe";
import { useGetAssignments } from "@/app/(hooks)/hooks/Assignments/useAssignments";
import { DevelopmentCard } from "@/components/development/development-card";
import { PublishedReportView } from "@/components/development/published-report-view";
import { StudentTimeline } from "@/components/development/student-timeline";
import Loading from "@/components/loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { AlertCircle, FileText } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const longDate = (value: string) =>
  format(new Date(value), "d MMMM yyyy", { locale: localeId });

/**
 * Portal siswa: timeline, tugas, dan rapor milik sendiri.
 *
 * Data diri berasal dari `GET /api/development/me` (backend menetapkan siswa
 * dari sesi — tidak ada id yang dikirim klien); daftar tugas memakai endpoint
 * tugas yang sudah memaksa kelas sendiri + hanya tugas terbit.
 */
export default function StudentDevelopmentPage() {
  const { data: summary, isLoading, error } = useGetDevelopmentMe();
  const [assignmentPage, setAssignmentPage] = useState(1);
  const assignmentsQuery = useGetAssignments({
    page: assignmentPage,
    limit: 10,
  });

  const me = summary?.students[0];
  const assignments = assignmentsQuery.data?.data ?? [];
  const pagination = assignmentsQuery.data?.pagination;

  if (isLoading) return <Loading />;

  return (
    <div className="from-muted/40 to-muted/60 min-h-screen bg-linear-to-br">
      <div className="max-w-7xl space-y-6">
        <div>
          <h1 className="text-foreground text-3xl font-bold">
            Perkembangan Saya
          </h1>
          <p className="text-muted-foreground">
            Catatan perkembangan, tugas, dan rapor milik Anda
          </p>
        </div>

        {error ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertCircle className="text-destructive h-4 w-4" />
                Tidak dapat menampilkan data
              </CardTitle>
              <CardDescription>{error.message}</CardDescription>
            </CardHeader>
          </Card>
        ) : !me ? (
          <Card>
            <CardContent className="text-muted-foreground py-10 text-center text-sm">
              Akun Anda belum terhubung ke data siswa.
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Ringkasan</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="assignments">Tugas</TabsTrigger>
              <TabsTrigger value="reports">Rapor</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 pt-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {me.areas.length === 0 ? (
                  <Card>
                    <CardContent className="text-muted-foreground py-8 text-center text-sm">
                      Belum ada penilaian perkembangan yang dipublikasikan.
                    </CardContent>
                  </Card>
                ) : (
                  me.areas.map((area) => (
                    <DevelopmentCard
                      key={area.areaId}
                      areaName={area.areaName}
                      scale={area.latest?.scale ?? null}
                      description={
                        area.latest
                          ? `${area.latest.periodName} • ${area.count} catatan`
                          : `${area.count} catatan`
                      }
                    />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="pt-4">
              <StudentTimeline
                entries={me.timeline}
                emptyMessage="Belum ada catatan perkembangan untuk Anda."
              />
            </TabsContent>

            <TabsContent value="assignments" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tugas</CardTitle>
                  <CardDescription>
                    {pagination ? `${pagination.total} tugas` : "Tugas Anda"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {assignmentsQuery.isLoading ? (
                    <p className="text-muted-foreground text-sm">
                      Memuat tugas...
                    </p>
                  ) : assignments.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      Belum ada tugas yang diterbitkan.
                    </p>
                  ) : (
                    assignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="space-y-1 rounded-lg border p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-medium">{assignment.title}</p>
                          <Badge variant="secondary">
                            Tenggat {longDate(assignment.dueDate)}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">
                          {assignment.subject?.name ?? "Tanpa mata pelajaran"}
                        </p>
                      </div>
                    ))
                  )}

                  {pagination && pagination.pages > 1 && (
                    <div className="flex items-center justify-between pt-2">
                      <p className="text-muted-foreground text-sm">
                        Halaman {pagination.page} dari {pagination.pages} (
                        {pagination.total} tugas)
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={pagination.page <= 1}
                          onClick={() =>
                            setAssignmentPage((page) => Math.max(1, page - 1))
                          }
                        >
                          Sebelumnya
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!pagination.hasMore}
                          onClick={() => setAssignmentPage((page) => page + 1)}
                        >
                          Selanjutnya
                        </Button>
                      </div>
                    </div>
                  )}

                  <Button asChild variant="outline">
                    <Link href="/dashboard/student/development/assignments">
                      <FileText className="h-4 w-4" />
                      Buka halaman tugas
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-4 pt-4">
              {me.reports.length === 0 ? (
                <Card>
                  <CardContent className="text-muted-foreground py-10 text-center text-sm">
                    Belum ada rapor yang diterbitkan.
                  </CardContent>
                </Card>
              ) : (
                me.reports.map((report) => (
                  <PublishedReportView key={report.id} reportId={report.id} />
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
