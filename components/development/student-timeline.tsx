"use client";

import { type TimelineEntryDTO } from "@/app/(types)/types/development-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EVIDENCE_TYPE_LABELS as EVIDENCE_LABELS } from "@/app/(types)/types/development-types";
import { cn } from "@/lib/shadCN/utils";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { CalendarDays, FileText, Paperclip } from "lucide-react";

type StudentTimelineProps = {
  entries: TimelineEntryDTO[];
  emptyMessage?: string;
};

/**
 * Timeline vertikal perkembangan anak (PRD §25) — keterangan + thumbnail bukti.
 */
export function StudentTimeline({
  entries,
  emptyMessage = "Belum ada catatan perkembangan.",
}: StudentTimelineProps) {
  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="text-muted-foreground py-10 text-center text-sm">
          {emptyMessage}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="border-border relative space-y-6 border-l pl-6">
      {entries.map((entry) => (
        <div key={entry.id} className="relative">
          <span className="bg-primary absolute top-1.5 -left-[31px] h-3 w-3 rounded-full" />
          {entry.kind === "assignment-evidence" ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                  <FileText className="h-4 w-4" />
                  {format(new Date(entry.date), "d MMMM yyyy", {
                    locale: localeId,
                  })}
                  <span className="text-muted-foreground text-sm font-normal">
                    Bukti tugas: {entry.assignmentTitle}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-muted-foreground text-sm">
                  {entry.subject ?? "Tugas"}
                  {entry.score !== null &&
                    ` • Nilai ${entry.score}${entry.maxScore !== null ? ` / ${entry.maxScore}` : ""}`}
                </p>
                {entry.feedback && (
                  <p className="text-sm italic">
                    &ldquo;{entry.feedback}&rdquo;
                  </p>
                )}
                <a
                  href={entry.url}
                  className="text-interactive inline-flex items-center gap-1 text-xs underline"
                >
                  <Paperclip className="h-3 w-3" />
                  {EVIDENCE_LABELS[entry.type] ?? entry.type}
                </a>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                  <CalendarDays className="h-4 w-4" />
                  {format(new Date(entry.date), "d MMMM yyyy", {
                    locale: localeId,
                  })}
                  <span className="text-muted-foreground text-sm font-normal">
                    {entry.activity}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {entry.observations.map((observation, index) => (
                  <div
                    key={index}
                    className="border-border space-y-1 border-l pl-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">
                        {observation.area ?? "Umum"}
                      </span>
                      {observation.scale && (
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                            !observation.scale.color &&
                              "bg-muted text-muted-foreground",
                          )}
                          style={
                            observation.scale.color
                              ? {
                                  backgroundColor: observation.scale.color,
                                  color: "#fff",
                                }
                              : undefined
                          }
                        >
                          {observation.scale.label}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {observation.observation}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Indikator: {observation.indicator}
                    </p>
                  </div>
                ))}

                {entry.teacherNote && (
                  <p className="text-sm italic">
                    &ldquo;{entry.teacherNote}&rdquo;
                  </p>
                )}

                {entry.evidences.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <Paperclip className="text-muted-foreground h-4 w-4" />
                    {entry.evidences.map((evidence, index) =>
                      evidence.type === "IMAGE" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={index}
                          src={evidence.url}
                          alt={`Bukti ${index + 1}`}
                          className="border-border h-16 w-16 rounded-2xl border object-cover"
                        />
                      ) : (
                        <a
                          key={index}
                          href={evidence.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-interactive inline-flex items-center gap-1 text-xs underline"
                        >
                          <FileText className="h-3 w-3" />
                          {EVIDENCE_LABELS[evidence.type] ?? evidence.type}
                        </a>
                      ),
                    )}
                  </div>
                )}

                {entry.teacher && (
                  <p className="text-muted-foreground text-xs">
                    Dicatat oleh {entry.teacher.name}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      ))}
    </div>
  );
}
