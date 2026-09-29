"use client";

import {
  type AssessmentScaleRefDTO,
  type ClassMatrixDTO,
} from "@/app/(types)";
import {
  ScaleSelector,
  type ScaleOption,
} from "@/components/development/scale-selector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useMemo, useRef, useState } from "react";

type MatrixEntry = {
  studentId: string;
  indicatorId: string;
  scaleId: string;
};

type AssessmentMatrixProps = {
  matrix: ClassMatrixDTO;
  scales: ScaleOption[];
  /** Simpan satu sel; error dilempar agar optimistik di-rollback. */
  onSelect: (entry: MatrixEntry) => Promise<unknown>;
  /** Isi satu kolom indikator untuk semua siswa sekaligus (opsional). */
  onBulkApply?: (indicatorId: string, scaleId: string) => Promise<unknown>;
  disabled?: boolean;
};

const ARROW_KEYS: Record<string, true> = {
  ArrowUp: true,
  ArrowDown: true,
  ArrowLeft: true,
  ArrowRight: true,
};

/** Dropdown "isi semua" untuk satu kolom indikator. */
function BulkFill({
  scales,
  disabled,
  onApply,
}: {
  scales: ScaleOption[];
  disabled?: boolean;
  onApply: (scaleId: string) => Promise<unknown>;
}) {
  const [value, setValue] = useState<string | undefined>(undefined);
  return (
    <Select
      value={value}
      onValueChange={(next) => {
        setValue(next);
        void onApply(next)
          .catch(() => undefined)
          .finally(() => setValue(undefined));
      }}
    >
      <SelectTrigger
        className="h-7 w-32 text-xs"
        disabled={disabled}
        aria-label="Isi skala untuk semua siswa"
      >
        <SelectValue placeholder="Isi semua…" />
      </SelectTrigger>
      <SelectContent>
        {scales.map((scale) => (
          <SelectItem key={scale.id} value={scale.id}>
            {scale.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/**
 * Matriks siswa × indikator. Tiap sel = pemilih skala.
 *
 * - Optimistic: nilai sel berubah langsung, di-rollback bila simpan gagal
 *   (toast error ditangani hook mutasi).
 * - Keyboard: panah atas/bawah/kiri/kanan memindah fokus antar sel; tombol
 *   skala tetap bisa di-Tab/Enter seperti biasa.
 */
export function AssessmentMatrix({
  matrix,
  scales,
  onSelect,
  onBulkApply,
  disabled = false,
}: AssessmentMatrixProps) {
  const tableRef = useRef<HTMLTableElement>(null);
  const [optimistic, setOptimistic] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);

  // Sel yang baru disimpan belum tentu sudah ada di `matrix` (refetch async).
  const cellScale = useMemo(() => {
    const map = new Map<string, AssessmentScaleRefDTO | null>();
    for (const cell of matrix.cells) {
      map.set(`${cell.studentId}:${cell.indicatorId}`, cell.scale);
    }
    return map;
  }, [matrix]);

  const save = async (entry: MatrixEntry) => {
    const key = `${entry.studentId}:${entry.indicatorId}`;
    setOptimistic((prev) => ({ ...prev, [key]: entry.scaleId }));
    setSavingKey(key);
    try {
      await onSelect(entry);
      // Hapus override setelah simpan berhasil: pemanggil sudah menunggu
      // refetch, jadi sel langsung memakai nilai server dan override tidak
      // lagi menutupi perubahan berikutnya (mis. "Isi semua").
      setOptimistic((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    } catch {
      // Rollback: hapus override optimistik → sel kembali ke nilai server.
      setOptimistic((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    } finally {
      setSavingKey((current) => (current === key ? null : current));
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTableElement>) => {
    if (!ARROW_KEYS[event.key]) return;
    const cell = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-row][data-col]",
    );
    if (!cell) return;

    let row = Number(cell.dataset.row);
    let col = Number(cell.dataset.col);
    if (event.key === "ArrowUp") row -= 1;
    else if (event.key === "ArrowDown") row += 1;
    else if (event.key === "ArrowLeft") col -= 1;
    else col += 1;

    const target = tableRef.current?.querySelector<HTMLElement>(
      `[data-row="${row}"][data-col="${col}"]`,
    );
    if (!target) return;

    event.preventDefault();
    (target.querySelector<HTMLElement>("button") ?? target).focus();
  };

  if (matrix.indicators.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Belum ada indikator aktif di area ini.
      </p>
    );
  }

  return (
    <Table ref={tableRef} onKeyDown={handleKeyDown}>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-40">Siswa</TableHead>
          {matrix.indicators.map((indicator, col) => (
            <TableHead key={indicator.id} data-row={-1} data-col={col}>
              <div className="space-y-1">
                <div className="font-medium">{indicator.name}</div>
                {onBulkApply && (
                  <BulkFill
                    scales={scales}
                    disabled={disabled}
                    onApply={(scaleId) => onBulkApply(indicator.id, scaleId)}
                  />
                )}
              </div>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {matrix.students.map((student, row) => (
          <TableRow key={student.id}>
            <TableCell className="font-medium">
              {student.name}
              {student.nisn ? (
                <span className="text-muted-foreground block text-xs">
                  {student.nisn}
                </span>
              ) : null}
            </TableCell>
            {matrix.indicators.map((indicator, col) => {
              const key = `${student.id}:${indicator.id}`;
              return (
                <TableCell
                  key={indicator.id}
                  data-row={row}
                  data-col={col}
                  className={cn(
                    "align-top",
                    savingKey === key && "opacity-60",
                  )}
                >
                  <ScaleSelector
                    scales={scales}
                    value={optimistic[key] ?? cellScale.get(key)?.id ?? null}
                    disabled={disabled}
                    ariaLabel={`Skala ${indicator.name} untuk ${student.name}`}
                    onChange={(scaleId) =>
                      void save({
                        studentId: student.id,
                        indicatorId: indicator.id,
                        scaleId,
                      })
                    }
                  />
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
