"use client";

import { BulkUploadPaymentItems } from "@/app/(hooks)/hooks/Payments/usePaymentItems";
import { useGetPaymentTypeByIdMajor } from "@/app/(hooks)/hooks/Payments/usePaymentType";
import { useGetStudentByIdMajorActive } from "@/app/(hooks)/hooks/Users/useGetStudentById";
import { useGetUserByIdBetterAuth } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import Loading from "@/components/loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CopyButton } from "@/components/ui/shadcn-io/copy-button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSession } from "@/lib/authClients";
import { AlertCircle, Calendar, CheckCircle2, CreditCard, Download, FileText, Info, Layers, Upload, Users, X } from "lucide-react";
import { unauthorized } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────
export type typeData = {
  id: string;
  year?: string;
  name: string;
  nisn?: string;
  class?: { name: string };
};

export type PaymentTypeData = {
  skuType: string;
  id: string;
  name: string;
  amount: number;
  owner: string;
  isMonthly: boolean;
  isActive: boolean;
  isFixedAmount: boolean;
  isFixedQuantity: boolean;
  quantity: number;
  major?: { name: string };
};

type PreviewRow = {
  rowNum: number;
  studentId: string;
  paymentTypeId: string;
  quantity: number;
  amount: number;
  subtotal: number;
  month: string;
  year: string;
  name: string;
  skuType: string;
  isPaid: boolean;
  // display helpers
  _studentName?: string;
  _paymentTypeName?: string;
  _errors: string[];
};

// ─── Month helpers ────────────────────────────────────────────────────────────
const MONTH_LABELS: Record<string, string> = {
  "1": "Januari",
  "2": "Februari",
  "3": "Maret",
  "4": "April",
  "5": "Mei",
  "6": "Juni",
  "7": "Juli",
  "8": "Agustus",
  "9": "September",
  "10": "Oktober",
  "11": "November",
  "12": "Desember",
};

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 12 }, (_, i) => String(currentYear - 2 + i));

// ─── Main Upload Component ─────────────────────────────────────────────────────
function UploadBilling({ majorId, majorName }: { majorId: string; majorName?: string }) {
  const [files, setFiles] = useState<File[]>([]);
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [uploadResult, setUploadResult] = useState<{
    count: number;
    skipped: number;
    total: number;
  } | null>(null);
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  // ── Data hooks ────────────────────────────────────────────────────────────
  const { data: students = [] } = useGetStudentByIdMajorActive(majorId);
  const { data: paymentTypes = [] } = useGetPaymentTypeByIdMajor(majorId);

  const bulkUploadMutation = BulkUploadPaymentItems();

  // Build lookup maps for validation & display
  const studentMap = useMemo(() => {
    const map = new Map<string, string>();
    students.forEach((s) => map.set(s.id, s.name));
    return map;
  }, [students]);

  const paymentTypeMap = useMemo(() => {
    const map = new Map<string, PaymentTypeData>();
    paymentTypes.forEach((pt) => map.set(pt.id, pt));
    return map;
  }, [paymentTypes]);

  // Unique skuTypes from paymentTypes
  const skuTypes = useMemo(() => {
    const set = new Set<string>();
    paymentTypes.forEach((pt) => {
      if (pt.skuType) set.add(pt.skuType);
    });
    return Array.from(set);
  }, [paymentTypes]);

  // ── File handling ─────────────────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadResult(null);
    setPreviewRows([]);
    setAvailableSheets([]);
    setSelectedSheet("");

    if (!e.target.files) return;

    const newFiles = Array.from(e.target.files);
    const excelFiles = newFiles.filter((f) => f.name.endsWith(".xlsx") || f.name.endsWith(".xls"));

    if (excelFiles.length !== newFiles.length) {
      toast.error("Hanya file Excel (.xlsx atau .xls) yang diperbolehkan");
    }

    setFiles(excelFiles);

    if (excelFiles.length > 0) {
      setCurrentFile(excelFiles[0]);
      await detectSheets(excelFiles[0]);
    } else {
      setPreviewRows([]);
      setCurrentFile(null);
    }
  };

  const removeFile = (index: number) => {
    const next = files.filter((_, i) => i !== index);
    setFiles(next);
    if (next.length === 0) {
      setPreviewRows([]);
      setAvailableSheets([]);
      setSelectedSheet("");
      setCurrentFile(null);
    }
  };

  // ── Detect all sheets in Excel ────────────────────────────────────────────
  const detectSheets = async (file: File) => {
    try {
      const XLSX = await import("xlsx");
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });

      const sheetNames = workbook.SheetNames;
      setAvailableSheets(sheetNames);

      if (sheetNames.length > 0) {
        setSelectedSheet(sheetNames[0]);
        await parseAndPreview(file, sheetNames[0]);

        if (sheetNames.length > 1) {
          toast.success(`Ditemukan ${sheetNames.length} sheet. Pilih sheet di dropdown untuk melihat data.`);
        } else {
          toast.success(`File berhasil dibaca`);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal membaca file Excel");
    }
  };

  // ── Handle sheet selection change ─────────────────────────────────────────
  const handleSheetChange = async (sheetName: string) => {
    setSelectedSheet(sheetName);
    if (currentFile) {
      await parseAndPreview(currentFile, sheetName);
    }
  };

  // ── Parse Excel → PreviewRow[] ────────────────────────────────────────────
  const parseAndPreview = async (file: File, sheetName?: string) => {
    try {
      const XLSX = await import("xlsx");
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });

      // Use specified sheet or first sheet
      const targetSheet = sheetName || workbook.SheetNames[0];
      const worksheet = workbook.Sheets[targetSheet];

      // Convert sheet to array of arrays
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

      const parsed: PreviewRow[] = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row[0]) continue;

        const errors: string[] = [];

        const studentId = row[0]?.toString() ?? "";
        const paymentTypeId = row[1]?.toString() ?? "";
        const quantity = Number(row[2]) || 0;
        const amount = Number(row[3]) || 0;
        const subtotal = Number(row[4]) || quantity * amount;
        const month = row[5]?.toString()?.padStart(2, "0") ?? "";
        const year = row[6]?.toString() ?? "";
        const name = row[7]?.toString() ?? "";
        const skuType = row[8]?.toString() ?? "default";
        const isPaid = row[9]?.toString() === "true" || row[9] === true;

        // Validate
        if (!studentId) errors.push("studentId kosong");
        else if (!studentMap.has(studentId)) errors.push("studentId tidak ditemukan");

        if (!paymentTypeId) errors.push("paymentTypeId kosong");
        else if (!paymentTypeMap.has(paymentTypeId)) errors.push("paymentTypeId tidak ditemukan");

        if (quantity <= 0) errors.push("quantity harus > 0");
        if (amount < 0) errors.push("amount tidak boleh negatif");
        if (!month || !/^\d{2}$/.test(month)) errors.push("month format salah (01-12)");
        if (!year || !/^\d{4}$/.test(year)) errors.push("year format salah (YYYY)");
        if (!name) errors.push("name kosong");

        parsed.push({
          rowNum: i + 1,
          studentId,
          paymentTypeId,
          quantity,
          amount,
          subtotal: subtotal || quantity * amount,
          month,
          year,
          name,
          skuType,
          isPaid,
          _studentName: studentMap.get(studentId) ?? studentId,
          _paymentTypeName: paymentTypeMap.get(paymentTypeId)?.name ?? paymentTypeId,
          _errors: errors,
        });
      }

      setPreviewRows(parsed);

      const errorCount = parsed.filter((r) => r._errors.length > 0).length;
      if (errorCount > 0) {
        toast.warning(`Sheet "${targetSheet}": ${parsed.length} baris ditemukan, ${errorCount} baris memiliki error`);
      } else {
        toast.success(`Sheet "${targetSheet}": ${parsed.length} baris siap diupload`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal membaca file Excel");
    }
  };

  // ── Upload valid rows ─────────────────────────────────────────────────────
  const handleUpload = async () => {
    const validRows = previewRows.filter((r) => r._errors.length === 0);

    if (validRows.length === 0) {
      toast.error("Tidak ada baris valid untuk diupload");
      return;
    }

    try {
      const payload = validRows.map((r) => ({
        studentId: r.studentId,
        paymentTypeId: r.paymentTypeId,
        quantity: r.quantity,
        amount: r.amount,
        subtotal: r.subtotal,
        isPaid: r.isPaid,
        month: r.month,
        year: r.year,
        name: r.name,
        skuType: r.skuType,
      }));

      console.log("payload", payload);

      const result = await bulkUploadMutation.mutateAsync(payload);
      setUploadResult(result as { count: number; skipped: number; total: number });
      toast.success(`Berhasil membuat ${(result as { count: number }).count ?? validRows.length} item tagihan!`);
      setFiles([]);
      setPreviewRows([]);
      const fileInput = document.getElementById("billing-file-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Gagal mengupload data";
      toast.error(errorMessage);
    }
  };

  // ── Download template ─────────────────────────────────────────────────────
  const downloadTemplate = async () => {
    try {
      const XLSX = await import("xlsx");

      const firstStudent = students[0];
      const firstPT = paymentTypes[0];
      const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");

      const wsData = [
        // ── Row 1: Headers ──
        ["Student ID*", "Payment Type ID*", "Quantity*", "Amount*", "Subtotal", "Month* (MM)", "Year* (YYYY)", "Name*", "SKU Type", "Is Paid (true/false)"],
        // ── Row 2: Example ──
        [
          firstStudent?.id ?? "student-id-disini",
          firstPT?.id ?? "payment-type-id-disini",
          1,
          firstPT ? firstPT.amount : 100000,
          firstPT ? firstPT.amount : 100000,
          currentMonth,
          String(currentYear),
          firstPT?.name ?? "SPP Bulanan",
          firstPT?.skuType ?? "SPP",
          "false",
        ],
      ];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      ws["!cols"] = [{ wch: 36 }, { wch: 36 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 25 }, { wch: 15 }, { wch: 18 }];

      XLSX.utils.book_append_sheet(wb, ws, "Billing Template");
      XLSX.writeFile(wb, `billing-template-${majorName ?? majorId}.xlsx`);
      toast.success("Template Excel berhasil didownload");
    } catch {
      toast.error("Gagal membuat template");
    }
  };

  // ── Export students list (for reference) ─────────────────────────────────
  const exportStudentList = async () => {
    try {
      const XLSX = await import("xlsx");

      const wsData = [["ID (gunakan di kolom Student ID)", "Nama Siswa", "NISN", "Kelas"], ...students.map((s) => [s.id, s.name, s.nisn ?? "-", s.class?.name ?? "-"])];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws["!cols"] = [{ wch: 36 }, { wch: 30 }, { wch: 14 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, ws, "Daftar Siswa");
      XLSX.writeFile(wb, `daftar-siswa-${majorName ?? majorId}.xlsx`);
      toast.success("Daftar siswa berhasil diexport");
    } catch {
      toast.error("Gagal export daftar siswa");
    }
  };

  // ── Export payment types (for reference) ─────────────────────────────────
  const exportPaymentTypeList = async () => {
    try {
      const XLSX = await import("xlsx");

      const wsData = [
        ["ID (gunakan di kolom Payment Type ID)", "Nama", "Nominal", "Owner", "Tipe SKU", "Bulanan?", "Nominal Tetap?", "Qty Tetap?"],
        ...paymentTypes.map((pt) => [pt.id, pt.name, pt.amount, pt.owner, pt.skuType, pt.isMonthly ? "Ya" : "Tidak", pt.isFixedAmount ? "Ya" : "Tidak", pt.isFixedQuantity ? "Ya" : "Tidak"]),
      ];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws["!cols"] = [{ wch: 36 }, { wch: 25 }, { wch: 14 }, { wch: 15 }, { wch: 10 }, { wch: 14 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, ws, "Jenis Tagihan");
      XLSX.writeFile(wb, `jenis-tagihan-${majorName ?? majorId}.xlsx`);
      toast.success("Daftar jenis tagihan berhasil diexport");
    } catch {
      toast.error("Gagal export jenis tagihan");
    }
  };

  const validCount = previewRows.filter((r) => r._errors.length === 0).length;
  const errorCount = previewRows.filter((r) => r._errors.length > 0).length;

  return (
    <div className="">
      {/* ── Page Header ── */}
      <div>
        <div className="font-bold text-3xl mb-1">Upload Tagihan</div>
        {majorName && (
          <Badge variant="secondary" className="text-sm">
            Branch: {majorName}
          </Badge>
        )}
      </div>

      {/* ── Success Result Banner ── */}
      {uploadResult && (
        <div className="flex items-start gap-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-4">
          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-green-800 dark:text-green-200">Upload Berhasil!</p>
            <p className="text-sm text-green-700 dark:text-green-300 mt-0.5">
              {uploadResult.count} item tagihan dibuat · {uploadResult.skipped > 0 && `${uploadResult.skipped} dilewati (duplikat) ·`} {uploadResult.total} total baris diproses
            </p>
          </div>
        </div>
      )}

      {/* ── Step 1: Export Reference Data ── */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</div>
          <div className="text-lg font-semibold">Export Data Referensi</div>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Download daftar siswa dan jenis tagihan untuk mendapatkan ID yang dibutuhkan saat mengisi template.</p>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={exportStudentList} disabled={!students.length}>
            <Users className="h-4 w-4 mr-2" />
            Export Daftar Siswa
            <Badge variant="secondary" className="ml-2 text-xs">
              {students.length} siswa
            </Badge>
          </Button>
          <Button variant="outline" onClick={exportPaymentTypeList} disabled={!paymentTypes.length}>
            <CreditCard className="h-4 w-4 mr-2" />
            Export Jenis Tagihan
            <Badge variant="secondary" className="ml-2 text-xs">
              {paymentTypes.length} jenis
            </Badge>
          </Button>
        </div>
      </Card>

      {/* ── Step 2: Download Template ── */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</div>
          <div className="text-lg font-semibold">Download Template Excel</div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-sm text-blue-900 dark:text-blue-100 space-y-1">
              <p className="font-semibold">Petunjuk Pengisian Template:</p>
              <ul className="list-disc list-inside space-y-0.5 text-blue-800 dark:text-blue-200">
                <li>
                  <strong>Student ID</strong> — ambil dari export Daftar Siswa di Langkah 1
                </li>
                <li>
                  <strong>Payment Type ID</strong> — ambil dari export Jenis Tagihan di Langkah 1
                </li>
                <li>
                  <strong>Quantity</strong> — jumlah item (angka bulat, minimal 1)
                </li>
                <li>
                  <strong>Amount</strong> — nominal per satuan (angka, tanpa titik/koma)
                </li>
                <li>
                  <strong>Subtotal</strong> — boleh dikosongkan, otomatis = Qty × Amount
                </li>
                <li>
                  <strong>Month</strong> — format sesuai digit: 1 s/d 12
                </li>
                <li>
                  <strong>Year</strong> — format 4 digit: mis. {currentYear}
                </li>
                <li>
                  <strong>Name</strong> — nama item tagihan (mis. "SPP Januari {currentYear}")
                </li>
                <li>
                  <strong>SKU Type</strong> — lihat tabel SKU Type di bawah (opsional)
                </li>
                <li>
                  <strong>Is Paid</strong> — true / false (default: false)
                </li>
              </ul>
            </div>
          </div>
        </div>

        <Button onClick={downloadTemplate} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download Template
        </Button>
      </Card>

      {/* ── Step 3: Upload File ── */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</div>
          <div className="text-lg font-semibold">Upload File Excel</div>
        </div>

        <div className="space-y-4">
          <div>
            <Input id="billing-file-upload" type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="bg-background" />
            <p className="text-sm text-muted-foreground mt-1">Format: .xlsx atau .xls</p>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file, i) => (
                <div key={i} className="flex items-center justify-between rounded-md border p-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(i)} disabled={bulkUploadMutation.isPending}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Sheet selector */}
          {availableSheets.length > 1 && (
            <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="h-5 w-5 text-blue-600" />
                <div className="font-semibold text-blue-900 dark:text-blue-100">Pilih Sheet Excel</div>
                <Badge variant="secondary" className="text-xs">
                  {availableSheets.length} sheet tersedia
                </Badge>
              </div>
              <Select value={selectedSheet} onValueChange={handleSheetChange}>
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="Pilih sheet..." />
                </SelectTrigger>
                <SelectContent>
                  {availableSheets.map((sheet) => (
                    <SelectItem key={sheet} value={sheet}>
                      <div className="flex items-center gap-2">
                        <Layers className="h-3 w-3" />
                        {sheet}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">ℹ️ File Excel ini memiliki {availableSheets.length} sheet. Pilih sheet yang ingin dibaca untuk melihat preview data.</p>
            </Card>
          )}

          {/* Single sheet info */}
          {availableSheets.length === 1 && selectedSheet && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Layers className="h-4 w-4" />
              <span>
                Sheet: <strong>{selectedSheet}</strong>
              </span>
            </div>
          )}

          {/* Preview table */}
          {previewRows.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-muted/40 border-b">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Info className="h-4 w-4" />
                  Preview Data dari Sheet:{" "}
                  <Badge variant="secondary" className="ml-1">
                    {selectedSheet}
                  </Badge>
                  <span className="text-muted-foreground">({previewRows.length} baris)</span>
                </div>
                <div className="flex gap-2">
                  {validCount > 0 && <Badge className="bg-green-600 text-white text-xs">{validCount} valid</Badge>}
                  {errorCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {errorCount} error
                    </Badge>
                  )}
                </div>
              </div>
              <div className="overflow-x-auto max-h-72">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-background border-b">
                    <tr>
                      <th className="text-left p-2 font-medium">#</th>
                      <th className="text-left p-2 font-medium">Siswa</th>
                      <th className="text-left p-2 font-medium">Jenis Tagihan</th>
                      <th className="text-left p-2 font-medium">Nama</th>
                      <th className="text-right p-2 font-medium">Qty</th>
                      <th className="text-right p-2 font-medium">Amount</th>
                      <th className="text-right p-2 font-medium">Subtotal</th>
                      <th className="text-center p-2 font-medium">Bulan/Tahun</th>
                      <th className="text-center p-2 font-medium">Lunas</th>
                      <th className="text-left p-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row) => (
                      <tr key={row.rowNum} className={`border-b ${row._errors.length > 0 ? "bg-red-50 dark:bg-red-950/20" : "hover:bg-muted/30"}`}>
                        <td className="p-2 text-muted-foreground">{row.rowNum}</td>
                        <td className="p-2">
                          <div className="font-medium truncate max-w-[140px]">{row._studentName}</div>
                          <div className="text-muted-foreground font-mono truncate max-w-[140px]">{row.studentId.slice(0, 8)}…</div>
                        </td>
                        <td className="p-2">
                          <div className="truncate max-w-[140px]">{row._paymentTypeName}</div>
                          <Badge variant="outline" className="text-xs mt-0.5">
                            {row.skuType}
                          </Badge>
                        </td>
                        <td className="p-2 truncate max-w-[120px]">{row.name}</td>
                        <td className="p-2 text-right">{row.quantity}</td>
                        <td className="p-2 text-right tabular-nums">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(row.amount)}</td>
                        <td className="p-2 text-right tabular-nums font-medium">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(row.subtotal)}</td>
                        <td className="p-2 text-center">
                          {MONTH_LABELS[row.month] ?? row.month} {row.year}
                        </td>
                        <td className="p-2 text-center">
                          {row.isPaid ?
                            <Badge className="bg-green-600 text-white text-xs">Lunas</Badge>
                          : <Badge variant="outline" className="text-xs">
                              Belum
                            </Badge>
                          }
                        </td>
                        <td className="p-2">
                          {row._errors.length > 0 ?
                            <div className="text-red-600 text-xs space-y-0.5">
                              {row._errors.map((e, i) => (
                                <div key={i}>⚠ {e}</div>
                              ))}
                            </div>
                          : <CheckCircle2 className="h-4 w-4 text-green-600" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {errorCount > 0 && <div className="px-4 py-2 bg-red-50 dark:bg-red-950/20 border-t text-xs text-red-700 dark:text-red-300">⚠ Baris dengan error akan dilewati saat upload. Perbaiki file Excel lalu upload ulang.</div>}
            </div>
          )}

          <Button onClick={handleUpload} disabled={validCount === 0 || bulkUploadMutation.isPending}>
            <Upload className="h-4 w-4 mr-2" />
            {bulkUploadMutation.isPending ?
              "Mengupload..."
            : validCount > 0 ?
              `Upload ${validCount} Item Tagihan`
            : "Pilih file terlebih dahulu"}
          </Button>
        </div>
      </Card>

      {/* ── Reference Tables ── */}
      <div className="grid gap-6">
        {/* Payment Types */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-purple-500" />
              <div className="text-lg font-bold">Jenis Tagihan</div>
              <Badge variant="secondary">{paymentTypes.length} jenis</Badge>
            </div>
            <p className="text-xs text-muted-foreground">Copy ID → paste ke kolom Payment Type ID di template</p>
          </div>
          <div className="max-h-64 overflow-y-auto">
            <Table>
              <TableCaption>Jenis tagihan untuk branch {majorName}</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Nominal</TableHead>
                  <TableHead>SKU Type</TableHead>
                  <TableHead>Bulanan?</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Copy</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentTypes.map((pt) => (
                  <TableRow key={pt.id}>
                    <TableCell className="font-medium">{pt.name}</TableCell>
                    <TableCell className="tabular-nums">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(pt.amount)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {pt.skuType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {pt.isMonthly ?
                        <Badge className="bg-blue-600 text-white text-xs">Bulanan</Badge>
                      : <Badge variant="secondary" className="text-xs">
                          Sekali
                        </Badge>
                      }
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{pt.id}</TableCell>
                    <TableCell>
                      <CopyButton variant="secondary" content={pt.id} onClick={() => toast.success(`ID ${pt.name} berhasil dicopy`)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* SKU Types */}
        {skuTypes.length > 0 && (
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-5 w-5 text-orange-500" />
              <div className="text-lg font-bold">Daftar SKU Type</div>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Gunakan salah satu nilai berikut di kolom <strong>SKU Type</strong> pada template.
            </p>
            <div className="flex flex-wrap gap-2">
              {skuTypes.map((sku) => (
                <div key={sku} className="flex items-center gap-1.5">
                  <Badge variant="outline" className="font-mono text-sm px-3 py-1">
                    {sku}
                  </Badge>
                  <CopyButton variant="ghost" content={sku} onClick={() => toast.success(`SKU "${sku}" berhasil dicopy`)} />
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Month & Year Reference */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-5 w-5 text-green-500" />
            <div className="text-lg font-bold">Referensi Bulan & Tahun</div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium mb-2">Format Bulan (kolom Month):</p>
              <div className="grid grid-cols-1 gap-1">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].map((num) => {
                  const name = MONTH_LABELS[num];
                  return (
                    <div key={num} className="flex items-center justify-between rounded border px-2 py-1 text-sm">
                      <span className="text-muted-foreground">{name}</span>
                      <div className="flex items-center gap-1">
                        <code className="font-mono font-bold">{num}</code>
                        <CopyButton variant="ghost" content={num} onClick={() => toast.success(`Bulan ${name} (${num}) berhasil dicopy`)} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Format Tahun (kolom Year):</p>
              <div className="space-y-1">
                {YEARS.map((y) => (
                  <div key={y} className="flex items-center justify-between rounded border px-2 py-1 text-sm">
                    <span className="text-muted-foreground">Tahun {y}</span>
                    <div className="flex items-center gap-1">
                      <code className="font-mono font-bold">{y}</code>
                      <CopyButton variant="ghost" content={y} onClick={() => toast.success(`Tahun ${y} berhasil dicopy`)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Auth Wrapper ─────────────────────────────────────────────────────────────
export default function UploadBillingPage() {
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id;
  const { data: userData, isLoading: isLoadingUserData } = useGetUserByIdBetterAuth(userId as string);
  const userRole = userData?.role?.name;

  if (isPending || isLoadingUserData) return <Loading />;

  if (userRole !== "Admin" && userRole !== "Bendahara") {
    unauthorized();
    return null;
  }

  return <UploadBilling majorId={userData?.major?.id ?? ""} majorName={userData?.major?.name} />;
}
