"use client";

import { createPDFKwitansi } from "@/app/(action)/createPDF/Invoice/studentInvoice";
import { useGetAccountBankByIdMajor } from "@/app/(hooks)/hooks/AccountBank/useAccountBank";
import { useCreatePayment, useDeletePayment, useUpdatePayment } from "@/app/(hooks)/hooks/Payments/usePayment";
import { usePaymentsByDate } from "@/app/(hooks)/hooks/Payments/usePaymentByDate";
import { usePaymentItemsSetPaid, usePaymentItemsUnpaidStudent } from "@/app/(hooks)/hooks/Payments/usePaymentItems";
import { useGetStudentByIdMajor } from "@/app/(hooks)/hooks/Users/useGetStudentById";
import { useGetUserByIdBetterAuth } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import { AccountBankTypes, PaymentData, PaymentItemData, UserDataTypes } from "@/app/(types)";
import { DatePickerWithRange } from "@/components/date/datePicker";
import { DatePickerTime } from "@/components/date/datePickerTime";
import Loading from "@/components/loading";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { StudentCombobox } from "@/components/ui/student-combobox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/authClients";
import { errorHandlerFrontend } from "@/lib/errorHandlerFrontend";
import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, VisibilityState } from "@tanstack/react-table";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { ArrowUpDown, BadgeCheck, Building2, CalendarDays, ChevronDown, Clock, CreditCard, FileDown, FileText, MoreHorizontal, Package, Pencil, Plus, Receipt, Search, Trash2, User, X, XCircle } from "lucide-react";
import { unauthorized } from "next/navigation";
import * as React from "react";
import { DateRange } from "react-day-picker";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// ─── Status Config ────────────────────────────────────────────────────────────
const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  paid: { label: "Lunas", className: "bg-green-600 text-white", icon: <BadgeCheck className="h-3 w-3" /> },
  pending: { label: "Menunggu", className: "bg-yellow-500 text-white", icon: <Clock className="h-3 w-3" /> },
  overdue: { label: "Terlambat", className: "bg-red-600 text-white", icon: <XCircle className="h-3 w-3" /> },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? { label: status, className: "bg-gray-500 text-white", icon: null };
  return (
    <Badge className={`${cfg.className} flex items-center gap-1 w-fit`}>
      {cfg.icon}
      {cfg.label}
    </Badge>
  );
}

// ─── Export Excel Function ────────────────────────────────────────────────────
async function exportToExcel(data: PaymentData[], filename: string = "Data_Pembayaran.xlsx") {
  try {
    const XLSX = await import("xlsx");

    // ── 1. Siapkan data ───────────────────────────────────────────────────
    const exportData = data.map((item) => ({
      Branch: item.major?.name ?? "-",
      Kelas: item.student?.class?.name ?? "-",
      "Nama Siswa": item.student?.name ?? "-",
      "No. HP Orang Tua": item.student?.parentPhone ?? "-",
      "No. Kwitansi": item.receiptNumber,
      Bulan: item.month,
      Tahun: new Date(item.createdAt).getFullYear(),
      "Jumlah (Rp)": Number(item.amount),
      Status: statusConfig[item.status]?.label ?? item.status,
      "Tanggal Transfer":
        item.transferDate ?
          new Date(item.transferDate).toLocaleString("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
          })
        : "-",
      "Tanggal Bayar": item.createdAt ? new Date(item.createdAt).toLocaleDateString("id-ID") : "-",
      "Jatuh Tempo": item.dueDate ? new Date(item.dueDate).toLocaleDateString("id-ID") : "-",
      Bank: item.accountBank?.accountBank ?? "-",
      "Nama Rekening": item.accountBank?.accountName ?? "-",
      "No. Rekening": item.accountBank?.accountNumber ?? "-",
      "Referensi Bank": item.bankRef ?? "-",
      Keterangan: item.notes ?? "-",
    }));

    const totalCols = 17;
    const now = new Date();
    const exportDateStr = now.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    // ── 2. Buat worksheet kosong dulu ─────────────────────────────────────
    const ws = XLSX.utils.aoa_to_sheet([
      // Baris 1 — judul (placeholder, nanti diisi manual)
      ["LAPORAN DATA PEMBAYARAN"],
      // Baris 2 — sub-judul
      [`Diekspor pada: ${exportDateStr}  ·  Total: ${data.length} transaksi`],
    ]);

    // ── 3. Tambahkan data mulai baris ke-3 (index 2) ──────────────────────
    // ✅ FIX: gunakan sheet_add_json dengan `origin` sebagai argument terpisah
    XLSX.utils.sheet_add_json(ws, exportData, {
      skipHeader: false,
    });

    // Karena sheet_add_json default mulai dari A1 (overwrite),
    // kita shift data ke bawah dengan menambah offset manual via aoa
    // Cara lebih clean: buat worksheet dari aoa terlebih dahulu
    const headerRow = Object.keys(exportData[0] ?? {});
    const dataRows = exportData.map((row) => Object.values(row));

    // ✅ Rebuild worksheet dengan judul + header + data sekaligus via aoa_to_sheet
    const allRows = [
      // Baris 1: judul
      ["LAPORAN DATA PEMBAYARAN", ...Array(totalCols - 1).fill("")],
      // Baris 2: sub-judul
      [`Diekspor pada: ${exportDateStr}  ·  Total: ${data.length} transaksi`, ...Array(totalCols - 1).fill("")],
      // Baris 3: header kolom
      headerRow,
      // Baris 4+: data
      ...dataRows,
    ];

    const ws2 = XLSX.utils.aoa_to_sheet(allRows);

    // ── 4. Merge judul & sub-judul ────────────────────────────────────────
    ws2["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: totalCols - 1 } },
    ];

    // ── 5. Format tipe data kolom numerik ─────────────────────────────────
    // Jumlah (Rp) ada di kolom index 6, data mulai baris index 3
    exportData.forEach((_, rowIdx) => {
      const excelRowIdx = rowIdx + 3; // baris data mulai di index 3 (baris Excel ke-4)

      // Jumlah (Rp) — kolom index 6
      const jumlahCell = XLSX.utils.encode_cell({ r: excelRowIdx, c: 7 });
      if (ws2[jumlahCell]) {
        ws2[jumlahCell].t = "n";
        ws2[jumlahCell].z = "#,##0";
      }

      // Tahun — kolom index 5
      const tahunCell = XLSX.utils.encode_cell({ r: excelRowIdx, c: 6 });
      if (ws2[tahunCell]) {
        ws2[tahunCell].t = "n";
        ws2[tahunCell].z = "0";
      }
    });

    // ── 6. Lebar kolom ────────────────────────────────────────────────────
    ws2["!cols"] = [
      { wch: 22 }, // Branch
      { wch: 22 }, // Kelas
      { wch: 35 }, // Nama Siswa
      { wch: 18 }, // No. HP Orang Tua
      { wch: 18 }, // No. Kwitansi
      { wch: 14 }, // Bulan
      { wch: 8 }, // Tahun
      { wch: 18 }, // Jumlah (Rp)
      { wch: 14 }, // Status
      { wch: 14 }, // Tanggal Transfer
      { wch: 14 }, // Tanggal Bayar
      { wch: 14 }, // Jatuh Tempo
      { wch: 16 }, // Bank
      { wch: 24 }, // Nama Rekening
      { wch: 18 }, // No. Rekening
      { wch: 20 }, // Referensi Bank
      { wch: 28 }, // Keterangan
    ];

    // ── 7. Tinggi baris ───────────────────────────────────────────────────
    ws2["!rows"] = [
      { hpt: 28 }, // baris 1 — judul
      { hpt: 16 }, // baris 2 — sub-judul
      { hpt: 20 }, // baris 3 — header kolom
      ...exportData.map(() => ({ hpt: 16 })),
    ];

    // ── 8. Freeze pane: bekukan 3 baris header + 2 kolom kiri ─────────────
    ws2["!freeze"] = { xSplit: 2, ySplit: 3 };

    // ── 9. Simpan ke file ─────────────────────────────────────────────────
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws2, "Data Pembayaran");
    XLSX.writeFile(wb, filename);

    toast.success(`${data.length} data pembayaran berhasil diexport!`);
  } catch (error) {
    errorHandlerFrontend(error);
  }
}

function formatRupiah(value: number | string) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);
}

const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

// ─── Form Schema ──────────────────────────────────────────────────────────────
// ✅ Schema fix
const paymentItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.coerce.number(), // ← "150000" → 150000
  quantity: z.coerce.number(), // ← "1" → 1
  subtotal: z.coerce.number(), // ← "150000" → 150000
  month: z.string(),
  year: z.string(),
  selected: z.boolean().default(true),
  isPaid: z.boolean().optional(), // Flag to indicate if item is already paid
});

const paymentSchema = z.object({
  studentId: z.string().min(1, "Siswa wajib dipilih"),
  bendaharaId: z.string().min(1, "Bendahara ID wajib diisi"),
  majorId: z.string().min(1, "Branch wajib dipilih"),
  accountBankId: z.string().min(1, "Rekening bank wajib dipilih"),
  month: z.string().min(1, "Bulan wajib dipilih"),
  status: z.string().min(1, "Status wajib dipilih"),
  paymentDate: z.string().min(1, "Tanggal bayar wajib diisi"),
  transferDate: z.string().optional(),
  dueDate: z.string().optional(),
  receiptNumber: z.string().min(1, "Nomor kwitansi wajib diisi"),
  bankRef: z.string().min(1, "Masukan Ref Bank"),
  notes: z.string().optional(),
  items: z.array(paymentItemSchema).min(1, "Minimal satu item pembayaran harus dipilih"),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

// ─── Expanded Items Row ───────────────────────────────────────────────────────
function ExpandedItemsRow({ items }: { items: PaymentItemData[] }) {
  if (!items?.length) {
    return <div className="px-8 py-3 text-sm text-muted-foreground">Tidak ada item pembayaran.</div>;
  }
  return (
    <div className="px-8 py-3 bg-muted/20">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-muted-foreground border-b">
            <th className="text-left pb-2 font-medium">Jenis Pembayaran</th>
            <th className="text-center pb-2 font-medium">Bulan/Tahun</th>
            <th className="text-right pb-2 font-medium">Nominal</th>
            <th className="text-center pb-2 font-medium">Qty</th>
            <th className="text-right pb-2 font-medium">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={item.id ?? i} className="border-b last:border-0">
              <td className="py-2 font-medium">{item.name ?? "-"}</td>
              <td className="py-2 text-center">
                {item.month} / {item.year}
              </td>
              <td className="py-2 text-right">{formatRupiah(item.amount)}</td>
              <td className="py-2 text-center">{item.quantity}</td>
              <td className="py-2 text-right font-medium">{formatRupiah(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Form Dialog ──────────────────────────────────────────────────────────────
// ─── Di dalam PaymentFormDialog ──────────────────────────────────────────────
function PaymentFormDialog({
  open,
  onOpenChange,
  editData,
  onSuccess,
  allStudents,
  allAccountBanks,
  userDataId,
  userDataMajorId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: PaymentData | null;
  onSuccess: () => void;
  allStudents: UserDataTypes[];
  allAccountBanks: AccountBankTypes[];
  userDataId?: string;
  userDataMajorId?: string;
}) {
  const createPayment = useCreatePayment();
  const updatePayment = useUpdatePayment();
  const setPaidMutation = usePaymentItemsSetPaid();
  const [selectedStudentId, setSelectedStudentId] = React.useState<string>("");

  const [totalTransfer, setTotalTransfer] = React.useState<number | "">("");

  // Reset saat dialog tutup
  React.useEffect(() => {
    if (!open) {
      setTotalTransfer("");
      setSelectedStudentId("");
    }
  }, [open]);

  // ✅ FIX 1: Fetch unpaid items — aktif saat selectedStudentId ada
  const { data: unpaidItemsData = [], isLoading: isLoadingUnpaid } = usePaymentItemsUnpaidStudent(selectedStudentId);

  const [unpaidItems, setUnpaidItems] = React.useState<PaymentItemData[]>([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<PaymentFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(paymentSchema as any),
    defaultValues: {
      status: "pending",
      paymentDate: new Date().toISOString().split("T")[0],
      transferDate: new Date().toISOString(),
      month: MONTHS[new Date().getMonth()],
      bendaharaId: userDataId || "",
      majorId: userDataMajorId || "",
      items: [],
      receiptNumber: "",
      bankRef: "",
    },
  });

  const { fields, replace } = useFieldArray({ control, name: "items" });
  const watchedItems = watch("items");

  // Generate receipt number saat dialog dibuka untuk mode create
  React.useEffect(() => {
    if (open && !editData) {
      const newReceiptNumber = `KWT-${crypto.randomUUID().substring(0, 12).toUpperCase()}`;
      setValue("receiptNumber", newReceiptNumber);
      setValue("month", MONTHS[new Date().getMonth()]);
    } else if (editData) {
      setValue("receiptNumber", editData.receiptNumber);
      setValue("bankRef", editData.bankRef);
      setValue("studentId", editData.studentId);
      setValue("bankRef", editData.bankRef);
      setValue("status", editData.status);
    }
  }, [open, editData?.id, setValue]);

  // Stable key — hanya trigger ulang jika ID data benar-benar berbeda
  const unpaidItemsKey = unpaidItemsData?.map((i: PaymentItemData) => i.id).join(",") ?? "";

  const memoizedUnpaidItems = React.useMemo(() => {
    // Start with existing payment items from editData
    const existingItems =
      editData?.paymentItems?.map((item) => ({
        id: item.id,
        name: item.name,
        amount: item.amount,
        quantity: item.quantity,
        subtotal: item.subtotal,
        month: item.month,
        year: item.year,
        selected: true,
        isPaid: true, // Mark existing payment items as paid
      })) || [];

    // Add unpaid items
    const newUnpaidItems =
      unpaidItemsData?.map((item: PaymentItemData) => ({
        id: item.id,
        name: item.name,
        amount: item.amount,
        quantity: item.quantity,
        subtotal: item.subtotal,
        month: item.month,
        year: item.year,
        selected: true,
        isPaid: false, // Mark new items as unpaid
      })) || [];

    // Concatenate both arrays
    return [...existingItems, ...newUnpaidItems];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unpaidItemsKey, editData?.paymentItems]);

  React.useEffect(() => {
    if (memoizedUnpaidItems.length > 0) {
      replace(memoizedUnpaidItems);
      // Combine both editData.paymentItems and unpaidItemsData for setUnpaidItems
      const allItems = [...(editData?.paymentItems || []), ...(unpaidItemsData || [])];
      setUnpaidItems(allItems);
    } else if (!editData) {
      // ✅ Jangan replace jika mode edit dan unpaid kosong
      replace([]);
      setUnpaidItems([]);
    }
    setTotalTransfer("");
  }, [unpaidItemsKey, editData?.paymentItems]);

  // Stable serialized key — hanya berubah jika selected/subtotal benar-benar berbeda
  const itemsKey = watchedItems?.map((item) => `${item.selected}:${item.subtotal}`).join("|") ?? "";

  const grandTotal = React.useMemo(() => {
    return (
      watchedItems
        ?.filter((item) => item.selected)
        ?.reduce((sum, item) => {
          const subtotal = parseFloat(String(item.subtotal || 0));
          return sum + (isNaN(subtotal) ? 0 : subtotal);
        }, 0) ?? 0
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsKey]);

  // Auto-fill totalTransfer saat grandTotal berubah
  React.useEffect(() => {
    if (grandTotal > 0) {
      setTotalTransfer(grandTotal);
    } else {
      setTotalTransfer("");
    }
  }, [grandTotal]);

  const toggleItemSelection = React.useCallback(
    (index: number) => {
      const currentSelected = watchedItems[index].selected;
      setValue(`items.${index}.selected`, !currentSelected);
    },
    [watchedItems, setValue],
  );

  // ✅ FIX 5: editData reset — tambah setSelectedStudentId agar query unpaid terpanggil
  React.useEffect(() => {
    if (editData) {
      reset({
        studentId: editData.studentId || "",
        accountBankId: editData.accountBankId || "",
        month: editData.month || "",
        status: editData.status || "pending",
        paymentDate: editData.paymentDate ? new Date(editData.paymentDate).toISOString().split("T")[0] : "",
        transferDate: editData.transferDate ? new Date(editData.transferDate).toISOString() : "",
        dueDate: editData.dueDate ? new Date(editData.dueDate).toISOString().split("T")[0] : "",
        receiptNumber: editData.receiptNumber || "",
        bankRef: editData.bankRef || "",
        notes: editData.notes || "",
        bendaharaId: userDataId || "",
        majorId: userDataMajorId || "",
        items:
          editData.paymentItems?.length ?
            editData.paymentItems.map((item) => ({
              id: item.id,
              name: item.name,
              amount: item.amount,
              quantity: item.quantity,
              subtotal: item.subtotal,
              month: item.month,
              year: item.year,
              selected: true,
            }))
          : [],
      });
      // ✅ Set selectedStudentId agar query unpaid aktif saat mode edit
      setSelectedStudentId(editData.studentId || "");
      setTotalTransfer(Number(editData.amount) || "");
    } else {
      const newReceiptNumber = `KWT-${crypto.randomUUID().substring(0, 12).toUpperCase()}`;
      reset({
        studentId: "",
        accountBankId: "",
        month: MONTHS[new Date().getMonth()],
        status: "paid",
        paymentDate: new Date().toISOString().split("T")[0],
        transferDate: new Date().toISOString(),
        dueDate: "",
        receiptNumber: newReceiptNumber,
        bankRef: "",
        notes: "",
        bendaharaId: userDataId || "",
        majorId: userDataMajorId || "",
        items: [],
      });
      setSelectedStudentId("");
      setUnpaidItems([]);
      setTotalTransfer("");
    }
  }, [editData?.id, userDataId, userDataMajorId, reset]);

  const totalTransferNum = typeof totalTransfer === "number" ? totalTransfer : 0;
  const isTransferValid = grandTotal > 0 && totalTransferNum === grandTotal;
  const isTransferEmpty = totalTransfer === "" || totalTransfer === 0;
  const isTransferMismatch = !isTransferEmpty && !isTransferValid;

  const selectedItemsCount = watchedItems?.filter((item) => item.selected)?.length ?? 0;

  const onSubmit = async (data: PaymentFormValues) => {
    try {
      const selectedItems = data.items.filter((item) => item.selected);

      if (selectedItems.length === 0) {
        toast.error("Pilih minimal satu item pembayaran!");
        return;
      }

      const paymentPayload = {
        studentId: data.studentId,
        bendaharaId: data.bendaharaId,
        majorId: data.majorId,
        accountBankId: data.accountBankId,
        month: data.month,
        amount: grandTotal,
        status: data.status,
        paymentDate: new Date(data.paymentDate).toISOString(),
        transferDate: data.transferDate ? new Date(data.transferDate).toISOString() : undefined,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
        receiptNumber: data.receiptNumber,
        bankRef: data.bankRef,
        notes: data.notes || null,
      };

      console.log(paymentPayload);

      if (editData) {
        await updatePayment.mutateAsync({ id: editData.id, ...paymentPayload });
        const paymentItemsIds = selectedItems.map((item) => item.id);
        await setPaidMutation.mutateAsync({
          paymentItemsIds,
          paymentId: editData.id,
        });
        toast.success("Pembayaran berhasil diperbarui!");
      } else {
        const created = await createPayment.mutateAsync(paymentPayload);
        const newPaymentId = created?.id as string;
        if (newPaymentId) {
          const paymentItemsIds = selectedItems.map((item) => item.id);
          await setPaidMutation.mutateAsync({
            paymentItemsIds,
            paymentId: newPaymentId,
          });
        }
        toast.success("Pembayaran berhasil dibuat!");
      }
      console.log(data);
      reset();
      setSelectedStudentId("");
      setUnpaidItems([]);
      setTotalTransfer("");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      errorHandlerFrontend(error);
    }
  };

  const isPending = createPayment.isPending || updatePayment.isPending || setPaidMutation.isPending;

  const isSubmitDisabled = isPending || selectedItemsCount === 0 || totalTransfer === grandTotal;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[110h] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editData ? "Edit Pembayaran" : "Tambah Pembayaran Baru"}</DialogTitle>
          <DialogDescription>{editData ? "Perbarui informasi pembayaran siswa" : "Buat pembayaran baru untuk siswa dengan memilih item tagihan yang belum dibayar"}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <input type="hidden" {...register("bendaharaId")} />
          <input type="hidden" {...register("majorId")} />

          {/* Student Selection */}
          <div className="space-y-2">
            <Label>Siswa</Label>
            <Controller
              name="studentId"
              control={control}
              render={({ field }) => (
                <StudentCombobox
                  students={allStudents}
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedStudentId(value);
                  }}
                  disabled={!!editData}
                  placeholder="Pilih Siswa"
                />
              )}
            />
            {errors.studentId && <p className="text-sm text-red-500">{errors.studentId.message}</p>}
            {(!selectedStudentId || !editData?.studentId) && isLoadingUnpaid && <p className="text-sm text-muted-foreground">Memuat tagihan belum dibayar...</p>}
            {selectedStudentId && !isLoadingUnpaid && unpaidItems.length === 0 && <p className="text-sm text-green-600">✓ Tidak ada tagihan yang belum dibayar</p>}
          </div>

          {/* Account Bank & Month */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label>Rekening Bank</Label>
              <Controller
                name="accountBankId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Rekening Bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {allAccountBanks?.map((b: AccountBankTypes) => (
                        <SelectItem key={b.id} value={b.id}>
                          {`${b.accountBank} - ${b.accountName} - ${b.accountNumber}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.accountBankId && <p className="text-sm text-red-500">{errors.accountBankId.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">Lunas</SelectItem>
                        <SelectItem value="pending">Menunggu</SelectItem>
                        <SelectItem value="overdue">Terlambat</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Bulan</Label>
                <Controller
                  name="month"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Bulan" />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.month && <p className="text-sm text-red-500">{errors.month.message}</p>}
              </div>
            </div>
          </div>

          {/* Payment Date & Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paymentDate">Tanggal Bayar</Label>
              <Input id="paymentDate" type="date" {...register("paymentDate")} />
              {errors.paymentDate && <p className="text-sm text-red-500">{errors.paymentDate.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">
                Jatuh Tempo <span className="text-xs text-muted-foreground">(opsional)</span>
              </Label>
              <Input id="dueDate" type="date" {...register("dueDate")} />
            </div>
          </div>

          {/* Receipt & Bank Ref */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="receiptNumber">Nomor Kwitansi</Label>
              <Input disabled={true} id="receiptNumber" placeholder="KWT-XXXXXXXX" {...register("receiptNumber")} />
              {errors.receiptNumber && <p className="text-sm text-red-500">{errors.receiptNumber.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankRef">Nomor Ref Bank</Label>
              <Input id="bankRef" placeholder="Contoh: 122237678764" {...register("bankRef")} />
              {errors.bankRef && <p className="text-sm text-red-500">{errors.bankRef.message}</p>}
            </div>
          </div>

          {/* Transfer Date with Time Picker */}
          <div className="space-y-2">
            <Label>
              Tanggal & Waktu Transfer <span className="text-xs text-muted-foreground">(opsional)</span>
            </Label>
            <Controller
              name="transferDate"
              control={control}
              render={({ field }) => (
                <DatePickerTime
                  value={field.value ? new Date(field.value) : undefined}
                  onChange={(date) => {
                    field.onChange(date ? date.toISOString() : "");
                  }}
                  dateLabel="Tanggal"
                  timeLabel="Waktu"
                  placeholder="Pilih tanggal"
                />
              )}
            />
            {errors.transferDate && <p className="text-sm text-red-500">{errors.transferDate.message}</p>}
          </div>

          <Separator />

          {/* Payment Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                Item Pembayaran Belum Lunas
                {selectedItemsCount > 0 && <span className="ml-2 text-sm font-normal text-muted-foreground">({selectedItemsCount} item dipilih)</span>}
              </Label>
            </div>

            {errors.items && typeof errors.items === "object" && "message" in errors.items && <p className="text-sm text-red-500">{errors.items.message}</p>}

            {!selectedStudentId && !editData && (
              <div className="text-center p-8 border rounded-lg bg-muted/20">
                <User className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Pilih siswa terlebih dahulu untuk melihat tagihan</p>
              </div>
            )}

            {selectedStudentId && isLoadingUnpaid && (
              <div className="text-center p-8 border rounded-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Memuat tagihan...</p>
              </div>
            )}

            {selectedStudentId && !isLoadingUnpaid && fields.length === 0 && (
              <div className="text-center p-8 border rounded-lg bg-green-50">
                <BadgeCheck className="h-12 w-12 mx-auto text-green-600 mb-2" />
                <p className="text-sm font-medium text-green-900">Semua tagihan sudah lunas!</p>
                <p className="text-xs text-green-700 mt-1">Tidak ada pembayaran yang tertunda</p>
              </div>
            )}

            {fields.length > 0 && (
              <>
                <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-1">
                  <div className="col-span-1 text-center">Pilih</div>
                  <div className="col-span-2">Jenis Transaksi</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2 text-center">Bulan/Tahun</div>
                  <div className="col-span-2">Nominal (Rp)</div>
                  <div className="col-span-1 text-center">Qty</div>
                  <div className="col-span-2 text-right">Subtotal</div>
                </div>

                <div className="space-y-2">
                  {fields.map((field, index) => {
                    const currentItem = watchedItems?.[index];
                    const isSelected = currentItem?.selected ?? true;
                    const isPaid = currentItem?.isPaid ?? false;

                    return (
                      <div key={field.id} className={`grid border p-2 rounded-lg grid-cols-12 gap-1 items-center transition-all ${isSelected ? "bg-blue-50 border-blue-200" : "bg-muted/20 opacity-60"}`}>
                        <div className="col-span-1 flex justify-center">
                          <Checkbox checked={isSelected} onCheckedChange={() => toggleItemSelection(index)} />
                        </div>
                        <div className="col-span-2">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{currentItem?.name}</p>
                          </div>
                        </div>
                        <div className="col-span-2">
                          {" "}
                          {isPaid ?
                            <Badge className="bg-green-600 text-white ">Lunas</Badge>
                          : <Badge className="bg-red-600 text-white ">Belum Lunas</Badge>}
                        </div>

                        <div className="col-span-2 text-center">
                          <Badge variant="outline" className="text-xs">
                            {currentItem?.month} {currentItem?.year}
                          </Badge>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm">{formatRupiah(currentItem?.amount ?? 0)}</p>
                        </div>
                        <div className="col-span-1 text-center">
                          <p className="text-sm font-medium">{currentItem?.quantity}</p>
                        </div>
                        <div className="col-span-2  text-right">
                          <p className="text-sm font-semibold tabular-nums">{formatRupiah(currentItem?.subtotal ?? 0)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <Separator />

          {/* Grand Total */}
          {selectedItemsCount > 0 && (
            <div className="flex justify-end">
              <div className="space-y-1 text-right min-w-50">
                <div className="flex justify-between text-sm gap-8">
                  <span className="text-muted-foreground">Total Pembayaran</span>
                  <span className="font-bold text-lg tabular-nums text-blue-600">{formatRupiah(grandTotal)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedItemsCount} dari {fields.length} item dipilih
                </p>
              </div>
            </div>
          )}

          {/* Jumlah Ditransfer */}
          {selectedItemsCount > 0 && (
            <div className="space-y-2">
              <Label htmlFor="totalTransfer">
                Jumlah Ditransfer <span className="text-xs text-muted-foreground">(opsional - untuk verifikasi)</span>
              </Label>

              <div className="relative">
                <Input
                  id="totalTransfer"
                  type="number"
                  placeholder={`Masukkan ${formatRupiah(grandTotal)}`}
                  value={totalTransfer}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTotalTransfer(val === "" ? "" : Number(val));
                  }}
                  className={
                    isTransferEmpty ? ""
                    : isTransferValid ?
                      "border-green-500 focus-visible:ring-green-500"
                    : "border-red-500 focus-visible:ring-red-500"
                  }
                />
                {!isTransferEmpty && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isTransferValid ?
                      <BadgeCheck className="h-4 w-4 text-green-600" />
                    : <XCircle className="h-4 w-4 text-red-500" />}
                  </div>
                )}
              </div>

              {isTransferEmpty && grandTotal > 0 && <p className="text-xs text-muted-foreground">Masukkan jumlah yang ditransfer untuk melanjutkan</p>}
              {isTransferMismatch && (
                <div className="flex items-center gap-1.5 rounded-lg bg-red-50 border border-red-200 px-3 py-2">
                  <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                  <div className="text-xs text-red-700">
                    <span className="font-semibold">Jumlah tidak sesuai.</span> Selisih: <span className="font-semibold tabular-nums">{formatRupiah(Math.abs(grandTotal - totalTransferNum))}</span>{" "}
                    {totalTransferNum < grandTotal ? "(kurang)" : "(lebih)"}
                  </div>
                </div>
              )}
              {isTransferValid && (
                <div className="flex items-center gap-1.5 rounded-lg bg-green-50 border border-green-200 px-3 py-2">
                  <BadgeCheck className="h-4 w-4 text-green-600 shrink-0" />
                  <p className="text-xs text-green-700 font-medium">Jumlah transfer sesuai · Siap disimpan</p>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              Catatan <span className="text-xs text-muted-foreground">(opsional)</span>
            </Label>
            <Textarea id="notes" placeholder="Catatan tambahan..." rows={2} {...register("notes")} />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-muted-foreground">
              {selectedItemsCount === 0 && <span>Pilih minimal 1 item untuk melanjutkan</span>}
              {selectedItemsCount > 0 && isTransferMismatch && <span className="text-yellow-600">⚠ Jumlah transfer tidak sesuai dengan total</span>}
              {selectedItemsCount > 0 && isTransferValid && <span className="text-green-600 font-medium">✓ Jumlah transfer sesuai</span>}
              {selectedItemsCount > 0 && isTransferEmpty && <span className="text-blue-600">ℹ Isi jumlah ditransfer untuk verifikasi</span>}
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                Batal
              </Button>
              <Button type="submit" disabled={!isSubmitDisabled} title={selectedItemsCount === 0 ? "Pilih minimal 1 item" : undefined}>
                {isPending ?
                  "Menyimpan..."
                : editData ?
                  "Perbarui"
                : "Simpan"}
              </Button>
            </div>
          </div>

          {/* Debug: validation errors (development only) */}
          {process.env.NODE_ENV === "development" && Object.keys(errors).length > 0 && (
            <div className="text-xs text-red-500 space-y-1 p-3 bg-red-50 rounded border border-red-200">
              <p className="font-semibold">❌ Validation Errors:</p>
              {Object.entries(errors).map(([key, error]) => (
                <p key={key}>
                  • {key}: {error?.message as string}
                </p>
              ))}
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Dialog ────────────────────────────────────────────────────────────
function DeletePaymentDialog({ open, onOpenChange, paymentData, onSuccess }: { open: boolean; onOpenChange: (open: boolean) => void; paymentData: PaymentData | null; onSuccess: () => void }) {
  const deletePayment = useDeletePayment();

  const handleDelete = async () => {
    if (!paymentData) return;
    try {
      await deletePayment.mutateAsync(paymentData.id);
      toast.success("Pembayaran berhasil dihapus!");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      errorHandlerFrontend(error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Pembayaran</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus pembayaran dengan nomor kwitansi <span className="font-semibold">"{paymentData?.receiptNumber}"</span> milik {paymentData?.student?.name ?? "siswa ini"}? Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          {/* <AlertDialogAction onClick={handleDelete} disabled={deletePayment.isPending} className="bg-red-600 hover:bg-red-700">
            {deletePayment.isPending ? "Menghapus..." : "Hapus"}
          </AlertDialogAction> */}
          <AlertDialogAction onClick={handleDelete} disabled={true} className="bg-red-600 hover:bg-red-700">
            {deletePayment.isPending ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Main DataTable ───────────────────────────────────────────────────────────
function PaymentDataTable({
  userDataId,
  userDataMajor,
}: {
  userDataId?: string;
  userDataMajor: {
    id?: string;
    name?: string;
  };
}) {
  // ✅ Memoize initial date range to prevent re-creation
  const initialDateRange = React.useMemo(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return {
      from: firstDayOfMonth,
      to: today,
    };
  }, []);

  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(initialDateRange);

  // ✅ Memoize date change handler
  const handleDateRangeChange = React.useCallback((newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
  }, []);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState<string>("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [monthFilter, setMonthFilter] = React.useState<string>("all");
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = React.useState(false);

  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedPayment, setSelectedPayment] = React.useState<PaymentData | null>(null);
  // const [totalTransfer, setTotalTransfer] = React.useState(0);

  const majorId = userDataMajor.id;

  // Query hooks
  const {
    data: payments = [],
    isLoading,
    refetch,
  } = usePaymentsByDate({
    fromdate: dateRange?.from,
    todate: dateRange?.to,
    majorId: majorId, // ✅ FIX: Pass majorId directly (undefined is OK)
  });
  const { data: allStudents = [] } = useGetStudentByIdMajor(majorId as string);
  const { data: allAccountBanks = [] } = useGetAccountBankByIdMajor(majorId as string);

  // Callback hooks
  const globalFilterFn = React.useCallback((row: any, _: string, filterValue: string) => {
    if (!filterValue) return true;
    const p = row.original as PaymentData;
    const text = [p.student?.name, p.major?.name, p.accountBank?.accountName, p.accountBank?.accountBank, p.receiptNumber, p.month, p.status, p.notes].filter(Boolean).join(" ").toLowerCase();
    return text.includes(filterValue.toLowerCase());
  }, []);

  const toggleExpand = React.useCallback((id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleSuccess = React.useCallback(() => {
    refetch();
  }, [refetch]);

  // ✅ Memoize reset handler - MUST BE BEFORE OTHER LOGIC
  const handleResetDateRange = React.useCallback(() => {
    setDateRange(initialDateRange);
  }, [initialDateRange]);

  // Memoize columns definition
  const columns: ColumnDef<PaymentData>[] = React.useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)} aria-label="Select all" />,
        cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} aria-label="Select row" />,
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "expand",
        header: () => <span className="text-xs text-muted-foreground">Item</span>,
        cell: ({ row }) => {
          const p = row.original;
          const isExpanded = expandedRows.has(p.id);
          const itemCount = p.paymentItems?.length ?? 0;
          return (
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs px-2" onClick={() => toggleExpand(p.id)}>
              <Package className="h-3.5 w-3.5" />
              {itemCount}
              {isExpanded ?
                <ChevronDown className="h-3.5 w-3.5 rotate-180 transition-transform" />
              : <ChevronDown className="h-3.5 w-3.5 transition-transform" />}
            </Button>
          );
        },
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "student",
        accessorFn: (row) => row.student?.name ?? "-",
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            <User className="mr-2 h-4 w-4" />
            Siswa
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div className="font-medium">{row.original.student?.name ?? "-"}</div>,
      },
      {
        accessorKey: "receiptNumber",
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            <Receipt className="mr-2 h-4 w-4" />
            No. Kwitansi
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div className="font-mono text-sm font-medium">{row.getValue("receiptNumber")}</div>,
      },
      {
        accessorKey: "month",
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            <CalendarDays className="mr-2 h-4 w-4" />
            Bulan
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <Badge variant="outline">{row.getValue("month")}</Badge>,
        filterFn: (row, _id, value) => {
          if (value === "all") return true;
          return row.original.month === value;
        },
      },
      {
        accessorKey: "amount",
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            <CreditCard className="mr-2 h-4 w-4" />
            Jumlah
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div className="font-semibold tabular-nums">{formatRupiah(row.getValue("amount"))}</div>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
        filterFn: (row, _id, value) => {
          if (value === "all") return true;
          return row.original.status === value;
        },
      },
      {
        id: "major",
        accessorFn: (row) => row.major?.name ?? "-",
        header: "Branch",
        cell: ({ row }) => <Badge variant="secondary">{row.original.major?.name ?? "-"}</Badge>,
      },
      {
        id: "accountBank",
        accessorFn: (row) => row.accountBank?.accountName ?? "-",
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            <Building2 className="mr-2 h-4 w-4" />
            Bank
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const bank = row.original.accountBank;
          return (
            <div>
              <div className="text-sm font-medium">{bank?.accountBank ?? "-"}</div>
              {bank?.accountName && <div className="text-xs text-muted-foreground">{bank.accountName}</div>}
            </div>
          );
        },
      },
      {
        accessorKey: "transferDate",
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            <CalendarDays className="mr-2 h-4 w-4" />
            Tgl Transfer
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const d = row.getValue("transferDate") as string;
          if (!d) return <span className="text-muted-foreground">-</span>;
          return <span>{format(new Date(d), "dd MMM yyyy", { locale: localeId })}</span>;
        },
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            <CalendarDays className="mr-2 h-4 w-4" />
            Tgl Input
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const d = row.getValue("createdAt") as string;
          if (!d) return <span className="text-muted-foreground">-</span>;
          return <span>{format(new Date(d), "dd MMM yyyy", { locale: localeId })}</span>;
        },
      },
      {
        accessorKey: "dueDate",
        header: "Jatuh Tempo",
        cell: ({ row }) => {
          const d = row.getValue("dueDate") as string;
          if (!d) return <span className="text-muted-foreground">-</span>;
          return <span>{format(new Date(d), "dd MMM yyyy", { locale: localeId })}</span>;
        },
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const p = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(p.id)}>Copy ID Pembayaran</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(p.receiptNumber)}>Copy No. Kwitansi</DropdownMenuItem>
                <DropdownMenuItem onClick={() => createPDFKwitansi(p as unknown as Parameters<typeof createPDFKwitansi>[0])}>
                  <FileDown className="mr-2 h-4 w-4" />
                  Invoice PDF
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedPayment(p);
                    setEditDialogOpen(true);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedPayment(p);
                    setDeleteDialogOpen(true);
                  }}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [expandedRows, toggleExpand],
  );

  const table = useReactTable({
    data: payments as PaymentData[],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    globalFilterFn,
    onGlobalFilterChange: setGlobalFilter,
    state: { sorting, columnFilters, columnVisibility, rowSelection, globalFilter },
  });

  React.useEffect(() => {
    table.getColumn("status")?.setFilterValue(statusFilter !== "all" ? statusFilter : undefined);
  }, [statusFilter, table]);

  React.useEffect(() => {
    table.getColumn("month")?.setFilterValue(monthFilter !== "all" ? monthFilter : undefined);
  }, [monthFilter, table]);

  if (isLoading) return <Loading />;

  const filteredRows = table.getFilteredRowModel().rows;
  const totalPayments = payments.length;
  const totalPaid = filteredRows.filter((r) => r.original.status === "paid").reduce((sum, r) => sum + parseFloat(String(r.original.amount)), 0);

  const columnLabels: Record<string, string> = {
    student: "Siswa",
    receiptNumber: "No. Kwitansi",
    month: "Bulan",
    amount: "Jumlah",
    status: "Status",
    major: "Branch",
    accountBank: "Bank",
    paymentDate: "Tgl Bayar",
    transferDate: "Tgl Transfer",
    dueDate: "Jatuh Tempo",
  };

  // ✅ Include dateRange in active filter detection
  const hasActiveFilter = globalFilter || statusFilter !== "all" || monthFilter !== "all" || dateRange;

  return (
    <div>
      <div className="font-bold text-3xl mb-3">Data Pembayaran</div>
      <Badge>{userDataMajor.name}</Badge>
      {/* Toolbar */}
      <div className="flex items-center justify-between py-4 flex-wrap gap-y-3">
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari siswa, kwitansi, bulan..." value={globalFilter ?? ""} onChange={(e) => setGlobalFilter(e.target.value)} className="max-w-sm pl-8" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="paid">Lunas</SelectItem>
              <SelectItem value="pending">Menunggu</SelectItem>
              <SelectItem value="overdue">Terlambat</SelectItem>
            </SelectContent>
          </Select>
          <div>
            <DatePickerWithRange date={dateRange} setDate={handleDateRangeChange} />
          </div>
          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Filter Bulan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Bulan</SelectItem>
              {MONTHS.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasActiveFilter && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setGlobalFilter("");
                setStatusFilter("all");
                setMonthFilter("all");
                handleResetDateRange();
                table.resetColumnFilters();
              }}
            >
              <X className="mr-2 h-4 w-4" />
              Reset Filter
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Kolom <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((c) => c.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem key={column.id} className="capitalize" checked={column.getIsVisible()} onCheckedChange={(v) => column.toggleVisibility(!!v)}>
                    {columnLabels[column.id] ?? column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            onClick={async () => {
              setIsExporting(true);
              await exportToExcel(payments as PaymentData[]);
              setIsExporting(false);
            }}
            disabled={isExporting}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <FileText className="mr-2 h-4 w-4" />
            {isExporting ? "Mengexport..." : "Export Excel"}
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Pembayaran
          </Button>
        </div>
      </div>

      {/* Active filter badges */}
      {hasActiveFilter && (
        <div className="flex items-center space-x-2 py-2 flex-wrap gap-y-1">
          <span className="text-sm text-muted-foreground">Filter aktif:</span>
          {globalFilter && (
            <Badge variant="secondary" className="gap-1">
              Pencarian: {globalFilter}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setGlobalFilter("")} />
            </Badge>
          )}
          {statusFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Status: {statusConfig[statusFilter]?.label ?? statusFilter}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setStatusFilter("all")} />
            </Badge>
          )}
          {monthFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Bulan: {monthFilter}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setMonthFilter("all")} />
            </Badge>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border w-full overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ?
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                  {/* Expanded items row */}
                  {expandedRows.has(row.original.id) && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={columns.length} className="p-0">
                        <ExpandedItemsRow items={row.original.paymentItems ?? []} />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            : <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">{hasActiveFilter ? "Tidak ada data yang sesuai dengan filter." : "Tidak ada data pembayaran yang ditemukan."}</p>
                    {hasActiveFilter && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setGlobalFilter("");
                          setStatusFilter("all");
                          setMonthFilter("all");
                          handleResetDateRange();
                          table.resetColumnFilters();
                        }}
                      >
                        Reset Filter
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            }
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} dari {filteredRows.length} baris dipilih.
          {filteredRows.length !== totalPayments && <span className="ml-2">(difilter dari {totalPayments} total)</span>}
        </div>
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">
            Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}
          </p>
          <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              Sebelumnya
            </Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Selanjutnya
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold">Total Transaksi</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{totalPayments}</p>
          {filteredRows.length !== totalPayments && <p className="text-sm text-muted-foreground">({filteredRows.length} terfilter)</p>}
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <BadgeCheck className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold">Lunas</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{filteredRows.filter((r) => r.original.status === "paid").length}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            <h3 className="font-semibold">Menunggu</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{filteredRows.filter((r) => r.original.status === "pending").length}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-purple-500" />
            <h3 className="font-semibold">Total Terbayar</h3>
          </div>
          <p className="text-xl font-bold mt-2 tabular-nums">{formatRupiah(totalPaid)}</p>
          <p className="text-xs text-muted-foreground">dari transaksi lunas</p>
        </div>
      </div>

      {/* Dialogs */}
      <PaymentFormDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onSuccess={handleSuccess} allStudents={allStudents} allAccountBanks={allAccountBanks} userDataId={userDataId} userDataMajorId={majorId} />
      <PaymentFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        editData={selectedPayment}
        onSuccess={handleSuccess}
        allStudents={allStudents}
        allAccountBanks={allAccountBanks}
        userDataId={userDataId}
        userDataMajorId={majorId}
      />
      <DeletePaymentDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} paymentData={selectedPayment} onSuccess={handleSuccess} />
    </div>
  );
}

// ─── Auth Wrapper ─────────────────────────────────────────────────────────────
export default function PaymentPage() {
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id;
  const { data: userData, isLoading: isLoadingUserData } = useGetUserByIdBetterAuth(userId as string);
  const userRole = userData?.role?.name;
  const userDataId = userData?.id;

  // ✅ FIX #2: Memoize userDataMajor object untuk stabilize reference
  const userDataMajor = React.useMemo(() => {
    return userData?.major ? { id: userData.major.id, name: userData.major.name } : { id: undefined, name: undefined };
  }, [userData?.major?.id, userData?.major?.name]);

  if (isPending || isLoadingUserData) {
    return <Loading />;
  }

  // Check if user is Admin or Bendahara
  if (userRole !== "Admin" && userRole !== "Bendahara") {
    unauthorized();
    return null;
  }

  return <PaymentDataTable userDataId={userDataId} userDataMajor={userDataMajor} />;
}
