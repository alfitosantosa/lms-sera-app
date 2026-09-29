"use client";

import { type DailyLogDTO } from "@/app/(types)/types/development-types";
import { useUpdateDailyLog } from "@/app/(hooks)/hooks/Development/useDailyLogs";
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
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type DailyLogEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  log: DailyLogDTO | null;
  scales: { id: string; label: string }[];
  indicatorGroups: [string, { id: string; name: string }[]][];
};

/**
 * Ubah draft log harian lewat `PATCH /api/daily-logs/[id]` (hanya draft milik
 * sendiri / admin — penentuannya di halaman pemanggil). Observasi diganti
 * dengan satu baris; bukti sengaja tidak dikirim agar PATCH tidak menghapus
 * bukti yang sudah ada (`evidences` yang dikirim selalu mengganti seluruhnya).
 */
export function DailyLogEditDialog({
  open,
  onOpenChange,
  log,
  scales,
  indicatorGroups,
}: DailyLogEditDialogProps) {
  const updateLog = useUpdateDailyLog();
  const [activity, setActivity] = useState("");
  const [teacherNote, setTeacherNote] = useState("");
  const [parentVisible, setParentVisible] = useState(false);
  const [indicatorId, setIndicatorId] = useState("");
  const [scaleId, setScaleId] = useState("");
  const [observation, setObservation] = useState("");

  useEffect(() => {
    if (!open || !log) return;
    const first = log.observations?.[0];
    setActivity(log.activity);
    setTeacherNote(log.teacherNote ?? "");
    setParentVisible(log.parentVisible);
    setIndicatorId(first?.indicatorId ?? "");
    setScaleId(first?.scaleId ?? "");
    setObservation(first?.observation ?? "");
  }, [open, log]);

  const handleSave = () => {
    if (!log) return;
    if (
      activity.trim() === "" ||
      indicatorId === "" ||
      observation.trim() === ""
    ) {
      toast.error("Isi kegiatan, indikator, dan catatan");
      return;
    }
    updateLog.mutate(
      {
        id: log.id,
        data: {
          activity: activity.trim(),
          teacherNote: teacherNote.trim() === "" ? null : teacherNote.trim(),
          parentVisible,
          observations: [
            {
              indicatorId,
              scaleId: scaleId || null,
              observation: observation.trim(),
            },
          ],
        },
      },
      {
        onSuccess: () => {
          toast.success("Log diperbarui");
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Log Harian</DialogTitle>
          <DialogDescription>
            Perbarui kegiatan, catatan, dan visibilitas log draft.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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
                {indicatorGroups.map(([area, items]) => (
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
            <Select value={scaleId} onValueChange={setScaleId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih hasil" />
              </SelectTrigger>
              <SelectContent>
                {scales.map((scale) => (
                  <SelectItem key={scale.id} value={scale.id}>
                    {scale.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Catatan</label>
            <Textarea
              value={observation}
              onChange={(event) => setObservation(event.target.value)}
              placeholder="Tuliskan hasil observasi..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Catatan guru</label>
            <Input
              value={teacherNote}
              onChange={(event) => setTeacherNote(event.target.value)}
              placeholder="Catatan internal untuk orang tua"
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
            disabled={updateLog.isPending}
          >
            {updateLog.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
