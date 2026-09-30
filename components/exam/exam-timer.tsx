"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type ExamTimerProps = {
  /** Sisa waktu (detik) dari server; null bila ujian tanpa durasi. */
  initialSeconds: number | null;
  /** Dipanggil tepat sekali saat waktu habis. */
  onExpire: () => void;
};

const URGENT_THRESHOLD_SECONDS = 5 * 60;

/**
 * Hitung mundur dari `initialSeconds` milik server, dihitung ulang secara lokal
 * setiap detik dari waktu mount (bukan dari deadline buatan klien saja).
 */
export function ExamTimer({ initialSeconds, onExpire }: ExamTimerProps) {
  const deadlineRef = useRef<number | null>(
    initialSeconds === null ? null : Date.now() + initialSeconds * 1000,
  );
  const [remaining, setRemaining] = useState(initialSeconds ?? 0);
  const firedRef = useRef(false);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    const deadline = deadlineRef.current;
    if (deadline === null) return;

    const tick = () => {
      const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(seconds);
      if (seconds === 0 && !firedRef.current) {
        firedRef.current = true;
        onExpireRef.current();
      }
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  if (initialSeconds === null) {
    return (
      <Card>
        <CardContent className="text-muted-foreground py-4 text-sm">
          Ujian tanpa batas waktu
        </CardContent>
      </Card>
    );
  }

  const urgent = remaining <= URGENT_THRESHOLD_SECONDS;
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <Card
      className={cn(urgent && "border-destructive-border bg-destructive-surface")}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Clock className="size-4" /> Sisa Waktu
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "text-3xl font-semibold tracking-tight tabular-nums",
            urgent && "text-destructive-strong",
          )}
        >
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </span>
        <Badge variant={urgent ? "destructive" : "secondary"}>
          {urgent ? "Segera berakhir" : "Menit"}
        </Badge>
      </CardContent>
    </Card>
  );
}
