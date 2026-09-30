"use client";

import { useGetDevelopmentMe } from "@/app/(hooks)/hooks/Development/useDevelopmentMe";
import { useGetStudentsByIds } from "@/app/(hooks)/hooks/Users/useStudentByIds";
import { useGetUserByIdBetterAuth } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import { DevelopmentCard } from "@/components/development/development-card";
import { StudentTimeline } from "@/components/development/student-timeline";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { useSession } from "@/lib/authClients";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { AlertCircle, FileText } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const longDate = (value: string) =>
  format(new Date(value), "d MMMM yyyy", { locale: localeId });

/**
 * Portal orang tua (PRD §26): ringkasan anak sendiri.
 *
 * Semua data berasal dari `GET /api/development/me`, yang menentukan anak mana
 * yang boleh dilihat dari sesi — daftar anak di sini hanya untuk memilih
 * tampilan, bukan sumber otorisasi. Pemilih anak memakai jalur `studentIds`
 * yang sudah ada di portal orang tua.
 */
export default function ParentDevelopmentPage() {
  const { data: session } = useSession();
  const { data: userData } = useGetUserByIdBetterAuth(session?.user?.id ?? "");
  const studentIds = userData?.studentIds ?? [];

  const { data: children = [], isLoading: isLoadingChildren } =
    useGetStudentsByIds(studentIds);
  const {
    data: summary,
    isLoading: isLoadingSummary,
    error,
  } = useGetDevelopmentMe();

  const [selectedId, setSelectedId] = useState("");

  const students = summary?.students ?? [];
  // Pemilih anak memakai daftar `studentIds` (jalur lama portal orang tua);
  // isinya tetap dari `/me` yang sudah menyaring kepemilikan.
  const activeChildId = selectedId || children[0]?.id || "";
  const selected = students.find(
    (item) => item.student.id === activeChildId,
  );

  if (isLoadingSummary || isLoadingChildren) return <Loading />;

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-7xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-foreground text-3xl font-semibold tracking-tight">
              Perkembangan Anak
            </h1>
            <p className="text-muted-foreground">
              Ringkasan catatan perkembangan anak Anda
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard/parent/development/report">
              <FileText className="h-4 w-4" />
              Rapor Anak
            </Link>
          </Button>
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
        ) : children.length === 0 ? (
          <Card>
            <CardContent className="text-muted-foreground py-10 text-center text-sm">
              Belum ada anak yang terhubung ke akun Anda.
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Pilih Anak</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={activeChildId} onValueChange={setSelectedId}>
                  <SelectTrigger className="w-full sm:w-80">
                    <SelectValue placeholder="Pilih anak" />
                  </SelectTrigger>
                  <SelectContent>
                    {children.map((child) => (
                      <SelectItem key={child.id} value={child.id}>
                        {child.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {selected ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {selected.areas.length === 0 ? (
                    <Card>
                      <CardContent className="text-muted-foreground py-8 text-center text-sm">
                        Belum ada penilaian perkembangan yang dipublikasikan.
                      </CardContent>
                    </Card>
                  ) : (
                    selected.areas.map((area) => (
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

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Aktivitas Terbaru
                    </CardTitle>
                    <CardDescription>
                      {selected.timeline.length} catatan yang dibagikan kepada
                      orang tua
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <StudentTimeline
                      entries={selected.timeline}
                      emptyMessage="Belum ada catatan perkembangan yang dibagikan."
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Catatan Guru</CardTitle>
                    <CardDescription>
                      {selected.teacherNotes.length} catatan dari guru
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selected.teacherNotes.length === 0 ? (
                      <p className="text-muted-foreground text-sm">
                        Belum ada catatan guru.
                      </p>
                    ) : (
                      selected.teacherNotes.map((note) => (
                        <div
                          key={note.logId}
                          className="space-y-1 rounded-3xl border p-4"
                        >
                          <p className="text-muted-foreground text-xs">
                            {longDate(note.date)}
                            {note.teacherName
                              ? ` • ${note.teacherName}`
                              : ""}
                          </p>
                          <p className="text-sm font-medium">
                            {note.activity}
                          </p>
                          <p className="text-sm italic">
                            &ldquo;{note.teacherNote}&rdquo;
                          </p>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
