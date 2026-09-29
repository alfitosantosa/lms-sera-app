"use client";

import { type ClassProgressStudentDTO } from "@/app/(types)/types/development-types";
import {
  useGetIndicators,
  useGetScales,
} from "@/app/(hooks)/hooks/Development/useDevelopmentConfig";
import { useCreateDailyLog } from "@/app/(hooks)/hooks/Development/useDailyLogs";
import { ObservationTemplatePicker } from "@/components/development/observation-template-picker";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type QuickLogDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  students: ClassProgressStudentDTO[];
};

/**
 * Quick Log (PRD §56) — 6 field, satu observasi, untuk catat kilat.
 * Dikirim sebagai satu `DailyLog` biasa; tidak ada jalur khusus di backend.
 */
export function QuickLogDialog({
  open,
  onOpenChange,
  classId,
  students,
}: QuickLogDialogProps) {
  const [studentId, setStudentId] = useState("");
  const [activity, setActivity] = useState("");
  const [indicatorId, setIndicatorId] = useState("");
  const [scaleId, setScaleId] = useState("");
  const [note, setNote] = useState("");
  const [parentVisible, setParentVisible] = useState(false);

  const { data: indicators = [] } = useGetIndicators({ isActive: true });
  const { data: scales = [] } = useGetScales({ isActive: true });
  const createLog = useCreateDailyLog();

  useEffect(() => {
    if (!open) return;
    setStudentId("");
    setActivity("");
    setIndicatorId("");
    setScaleId("");
    setNote("");
    setParentVisible(false);
  }, [open]);

  const indicatorGroups = new Map<string, typeof indicators>();
  for (const indicator of indicators) {
    const area = indicator.developmentArea?.name ?? "Umum";
    const group = indicatorGroups.get(area) ?? [];
    group.push(indicator);
    indicatorGroups.set(area, group);
  }

  const canSave =
    studentId !== "" &&
    activity.trim() !== "" &&
    indicatorId !== "" &&
    note.trim() !== "";

  const handleSave = () => {
    if (!canSave) {
      toast.error("Lengkapi siswa, kegiatan, indikator, dan catatan");
      return;
    }
    createLog.mutate(
      {
        studentId,
        classId,
        date: new Date(),
        activity: activity.trim(),
        parentVisible,
        observations: [
          {
            indicatorId,
            scaleId: scaleId || null,
            observation: note.trim(),
          },
        ],
        evidences: [],
      },
      {
        onSuccess: () => {
          toast.success("Log harian tersimpan");
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Quick Log</DialogTitle>
          <DialogDescription>
            Catat satu observasi dengan cepat tanpa meninggalkan dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Siswa</label>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih siswa" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Kegiatan</label>
            <Input
              value={activity}
              onChange={(event) => setActivity(event.target.value)}
              placeholder="Misal: Membaca cerita"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Indikator</label>
            <Select value={indicatorId} onValueChange={setIndicatorId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih indikator" />
              </SelectTrigger>
              <SelectContent>
                {[...indicatorGroups.entries()].map(([area, items]) => (
                  <SelectGroup key={area}>
                    <SelectLabel>{area}</SelectLabel>
                    {items.map((indicator) => (
                      <SelectItem key={indicator.id} value={indicator.id}>
                        {indicator.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Hasil</label>
            <div className="flex flex-wrap gap-2">
              {scales.map((scale) => {
                const selected = scale.id === scaleId;
                return (
                  <Button
                    key={scale.id}
                    type="button"
                    size="sm"
                    variant={selected ? "default" : "outline"}
                    className={cn(
                      selected &&
                        !scale.color &&
                        "bg-primary text-primary-foreground",
                    )}
                    style={
                      selected && scale.color
                        ? { backgroundColor: scale.color, color: "#fff" }
                        : undefined
                    }
                    onClick={() => setScaleId(selected ? "" : scale.id)}
                  >
                    {scale.label}
                  </Button>
                );
              })}
              {scales.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  Skala penilaian belum dikonfigurasi.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Catatan</label>
              <ObservationTemplatePicker value={note} onChange={setNote} />
            </div>
            <Textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Tuliskan hasil observasi..."
              rows={3}
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={parentVisible}
              onCheckedChange={(value) => setParentVisible(value === true)}
            />
            Terlihat oleh orang tua
          </label>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={createLog.isPending}
          >
            {createLog.isPending && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
