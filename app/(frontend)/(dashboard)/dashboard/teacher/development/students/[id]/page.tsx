"use client";

import { type TimelineEntryDTO } from "@/app/(types)/types/development-types";
import {
  useGetDailyLogs,
  useGetStudentTimeline,
} from "@/app/(hooks)/hooks/Development/useDailyLogs";
import { DailyLogTable } from "@/components/development/daily-log-table";
import { DevelopmentCard } from "@/components/development/development-card";
import { StudentProgressChart } from "@/components/development/student-progress-chart";
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
import { AlertCircle, ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

type AreaSnapshot = {
  area: string;
  scale: { label: string; color: string | null } | null;
  lastDate: string | null;
};

/** Skala terakhir per area pengembangan, dari timeline siswa. */
function latestScaleByArea(entries: TimelineEntryDTO[]): AreaSnapshot[] {
  const chronological = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const byArea = new Map<string, AreaSnapshot>();

  for (const entry of chronological) {
    for (const observation of entry.observations) {
      const area = observation.area ?? "Umum";
      const previous = byArea.get(area);
      byArea.set(area, {
        area,
        scale: observation.scale
          ? { label: observation.scale.label, color: observation.scale.color }
          : (previous?.scale ?? null),
        lastDate: entry.date,
      });
    }
  }

  return [...byArea.values()];
}

export default function StudentDevelopmentProfilePage() {
  const params = useParams<{ id: string }>();
  const studentId = params?.id ?? "";

  const {
    data: entries = [],
    isLoading: isLoadingTimeline,
    error: timelineError,
  } = useGetStudentTimeline(studentId);
  const [logPage, setLogPage] = useState(1);
  const { data: logs, isLoading: isLoadingLogs } = useGetDailyLogs({
    studentId,
    page: logPage,
    limit: 20,
    enabled: studentId !== "" && !timelineError,
  });

  const snapshots = useMemo(() => latestScaleByArea(entries), [entries]);
  const evidences = useMemo(
    () => entries.flatMap((entry) => entry.evidences),
    [entries],
  );
  const studentName = (logs?.data ?? [])[0]?.student?.name;

  if (isLoadingTimeline) {
    return <Loading />;
  }

  return (
    <div className="from-muted/40 to-muted/60 min-h-screen bg-linear-to-br">
      <div className="max-w-7xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-foreground text-3xl font-bold">
              {studentName ?? "Profil Perkembangan"}
            </h1>
            <p className="text-muted-foreground">
              Rangkuman catatan perkembangan siswa
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard/teacher/development/students">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke daftar siswa
            </Link>
          </Button>
        </div>

        {timelineError ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertCircle className="text-destructive h-4 w-4" />
                Tidak dapat menampilkan data siswa
              </CardTitle>
              <CardDescription>{timelineError.message}</CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              Anda hanya dapat membuka profil siswa di kelas yang Anda ajar.
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="logbook">Logbook</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="evidence">Evidence</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 pt-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {snapshots.length === 0 ? (
                  <Card>
                    <CardContent className="text-muted-foreground py-8 text-center text-sm">
                      Belum ada observasi tercatat.
                    </CardContent>
                  </Card>
                ) : (
                  snapshots.map((snapshot) => (
                    <DevelopmentCard
                      key={snapshot.area}
                      areaName={snapshot.area}
                      scale={snapshot.scale}
                      description={
                        snapshot.lastDate
                          ? `Terakhir: ${format(new Date(snapshot.lastDate), "d MMM yyyy", { locale: localeId })}`
                          : null
                      }
                    />
                  ))
                )}
              </div>
              <StudentProgressChart entries={entries} />
            </TabsContent>

            <TabsContent value="logbook" className="pt-4">
              <DailyLogTable
                logs={logs?.data ?? []}
                isLoading={isLoadingLogs}
                emptyMessage="Belum ada log harian untuk siswa ini."
                total={logs?.pagination?.total}
                page={logPage}
                hasMore={logs?.pagination?.hasMore}
                onPageChange={setLogPage}
              />
            </TabsContent>

            <TabsContent value="timeline" className="pt-4">
              <StudentTimeline entries={entries} />
            </TabsContent>

            <TabsContent value="evidence" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Bukti Observasi</CardTitle>
                  <CardDescription>
                    {evidences.length} bukti terlampir pada catatan siswa
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {evidences.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      Belum ada bukti yang diunggah.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      {evidences.map((evidence, index) =>
                        evidence.type === "IMAGE" ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={index}
                            src={evidence.url}
                            alt={`Bukti ${index + 1}`}
                            className="h-32 w-full rounded-md border object-cover"
                          />
                        ) : (
                          <a
                            key={index}
                            href={evidence.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex h-32 flex-col items-center justify-center gap-2 rounded-md border text-sm"
                          >
                            <FileText className="h-6 w-6" />
                            <Badge variant="secondary">{evidence.type}</Badge>
                          </a>
                        ),
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
