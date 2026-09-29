"use client";

import {
  DAILY_LOG_STATUS_LABELS,
  type DailyLogDTO,
} from "@/app/(types)/types/development-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { ArrowUpDown, ImageIcon, Search } from "lucide-react";
import { useMemo, useState } from "react";

type DailyLogTableProps = {
  logs: DailyLogDTO[];
  isLoading?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
};

/** Ringkasan skala per log — label/warna dari `AssessmentScale`, bukan literal. */
function ScaleChips({ log }: { log: DailyLogDTO }) {
  const scales = (log.observations ?? []).flatMap((observation) =>
    observation.scale ? [observation.scale] : [],
  );
  if (scales.length === 0) {
    return <span className="text-muted-foreground">-</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {scales.map((scale, index) => (
        <span
          key={index}
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
            !scale.color && "bg-muted text-muted-foreground",
          )}
          style={
            scale.color
              ? { backgroundColor: scale.color, color: "#fff" }
              : undefined
          }
        >
          {scale.label}
        </span>
      ))}
    </div>
  );
}

export function DailyLogTable({
  logs,
  isLoading = false,
  searchPlaceholder = "Cari siswa atau kegiatan...",
  emptyMessage = "Belum ada log.",
}: DailyLogTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<DailyLogDTO>[]>(
    () => [
      {
        id: "student",
        accessorFn: (row) => row.student?.name ?? "-",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Siswa
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium">{row.original.student?.name ?? "-"}</div>
        ),
      },
      {
        id: "date",
        accessorFn: (row) => new Date(row.date).getTime(),
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Tanggal
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) =>
          format(new Date(row.original.date), "d MMM yyyy", {
            locale: localeId,
          }),
      },
      {
        id: "activity",
        accessorFn: (row) => row.activity,
        header: "Kegiatan",
        cell: ({ row }) => (
          <div>
            <div>{row.original.activity}</div>
            {row.original.teacherNote && (
              <div className="text-muted-foreground line-clamp-2 text-xs">
                {row.original.teacherNote}
              </div>
            )}
          </div>
        ),
      },
      {
        id: "scale",
        header: "Hasil",
        enableSorting: false,
        cell: ({ row }) => <ScaleChips log={row.original} />,
      },
      {
        id: "status",
        accessorFn: (row) => row.status,
        header: "Status",
        cell: ({ row }) => (
          <Badge variant="secondary">
            {DAILY_LOG_STATUS_LABELS[row.original.status] ??
              row.original.status}
          </Badge>
        ),
      },
      {
        id: "evidence",
        header: "Bukti",
        enableSorting: false,
        cell: ({ row }) => {
          const count = row.original._count?.evidences ?? 0;
          return count === 0 ? (
            <span className="text-muted-foreground">-</span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs">
              <ImageIcon className="h-3 w-3" />
              {count}
            </span>
          );
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: logs,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const log = row.original as DailyLogDTO;
      const text = [
        log.student?.name,
        log.activity,
        log.teacherNote,
        log.status,
        ...(log.observations ?? []).map((o) => o.indicator?.name),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return text.includes(String(filterValue).toLowerCase());
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="space-y-3 py-6">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative w-full sm:max-w-xs">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          placeholder={searchPlaceholder}
          className="pl-9"
        />
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-muted-foreground h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {table.getRowModel().rows.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-xs">
            {table.getFilteredRowModel().rows.length} log
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Berikutnya
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
