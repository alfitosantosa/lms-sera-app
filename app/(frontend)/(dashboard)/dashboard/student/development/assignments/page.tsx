"use client";

import {
  type AssignmentDTO,
  type AssignmentSubmissionDTO,
  type EvidenceInput,
  getErrorMessage,
} from "@/app/(types)";
import {
  useCreateSubmission,
  useGetAssignments,
  useGetSubmissions,
} from "@/app/(hooks)/hooks/Assignments/useAssignments";
import { EvidenceUploader } from "@/components/development/evidence-uploader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const dateTime = (value: string) => new Date(value).toLocaleString("id-ID");

function SubmissionPanel({ assignment }: { assignment: AssignmentDTO }) {
  const submissionsQuery = useGetSubmissions(assignment.id);
  const submit = useCreateSubmission();
  const [notes, setNotes] = useState("");
  const [attachments, setAttachments] = useState<EvidenceInput[]>([]);

  const mine: AssignmentSubmissionDTO | undefined = submissionsQuery.data?.[0];

  if (submissionsQuery.isLoading) {
    return <p className="text-muted-foreground text-sm">Memuat status...</p>;
  }

  if (mine) {
    return (
      <div className="bg-muted/30 space-y-2 rounded-3xl border p-4 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={mine.status === "graded" ? "default" : "secondary"}>
            {mine.status === "graded" ? "Sudah dinilai" : "Sudah dikirim"}
          </Badge>
          <span className="text-muted-foreground text-xs">
            Dikirim {dateTime(mine.submittedAt)}
          </span>
          {mine.isLate && <Badge variant="destructive">Terlambat</Badge>}
        </div>
        {mine.notes && <p className="text-muted-foreground">{mine.notes}</p>}
        {mine.score !== null && (
          <p className="font-medium">
            Nilai: {Number(mine.score)} / {Number(assignment.maxScore)}
          </p>
        )}
        {mine.feedback && (
          <p>
            <span className="text-muted-foreground">Catatan guru: </span>
            {mine.feedback}
          </p>
        )}
      </div>
    );
  }

  const overdue = new Date(assignment.dueDate) < new Date();
  const blocked = overdue && !assignment.allowLateSubmission;

  return (
    <div className="space-y-3 rounded-3xl border p-4">
      {blocked ? (
        <p className="text-destructive text-sm">
          Tenggat pengumpulan sudah lewat.
        </p>
      ) : (
        <>
          <Textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Catatan untuk guru (opsional)"
          />
          <EvidenceUploader value={attachments} onChange={setAttachments} />
          <Button
            disabled={submit.isPending}
            onClick={async () => {
              try {
                await submit.mutateAsync({
                  assignmentId: assignment.id,
                  data: { notes: notes || null, attachments },
                });
                toast.success("Tugas berhasil dikirim");
              } catch (error) {
                toast.error(getErrorMessage(error));
              }
            }}
          >
            Kirim tugas
          </Button>
        </>
      )}
    </div>
  );
}

function AssignmentRow({ assignment }: { assignment: AssignmentDTO }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-3 rounded-3xl border p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium">{assignment.title}</p>
          <p className="text-muted-foreground text-sm">
            {assignment.subject?.name ?? "-"} • Tenggat{" "}
            {dateTime(assignment.dueDate)}
            {assignment.allowLateSubmission ? " • boleh terlambat" : ""}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setOpen(!open)}>
          {open ? "Tutup" : "Lihat / kirim"}
        </Button>
      </div>
      {open && (
        <>
          <p className="text-muted-foreground text-sm">
            {assignment.description}
          </p>
          <SubmissionPanel assignment={assignment} />
        </>
      )}
    </div>
  );
}

export default function StudentAssignmentsPage() {
  const [listPage, setListPage] = useState(1);
  const assignmentsQuery = useGetAssignments({ page: listPage, limit: 20 });
  const assignments = assignmentsQuery.data?.data ?? [];
  const pagination = assignmentsQuery.data?.pagination;

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-foreground text-3xl font-semibold tracking-tight">Tugas Saya</h1>
          <p className="text-muted-foreground">
            Kumpulkan tugas sebelum tenggat dan lihat catatan guru.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Daftar Tugas</CardTitle>
            <CardDescription>
              {assignmentsQuery.data
                ? `${assignmentsQuery.data.pagination.total} tugas`
                : "Memuat tugas..."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {assignmentsQuery.isLoading ? (
              <p className="text-muted-foreground text-sm">Memuat tugas...</p>
            ) : assignmentsQuery.error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Gagal memuat tugas</AlertTitle>
                <AlertDescription>
                  {assignmentsQuery.error.message}
                </AlertDescription>
              </Alert>
            ) : assignments.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Belum ada tugas untuk kelas Anda.
              </p>
            ) : (
              assignments.map((assignment) => (
                <AssignmentRow key={assignment.id} assignment={assignment} />
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
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => setListPage((page) => Math.max(1, page - 1))}
                  >
                    Sebelumnya
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasMore}
                    onClick={() => setListPage((page) => page + 1)}
                  >
                    Berikutnya
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
