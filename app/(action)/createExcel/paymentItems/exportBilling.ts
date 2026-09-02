import { toast } from 'sonner';

const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

type PaymentItemData = {
  student?: {
    name: string;
    class?: {
      name: string;
    };
  };
  name: string;
  amount: number;
  quantity: number;
  subtotal: number;
  month: string;
  year: string;
  isPaid: boolean;
  payment?: {
    receiptNumber: string;
  };
  PaymentType?: {
    skuType: string;
    owner: string;
  };
};

// ─── Export Excel Function ────────────────────────────────────────────────────
export async function exportToExcelBilling(data: PaymentItemData[], filename: string = "Data_Tagihan.xlsx") {
  try {
    const XLSX = await import("xlsx");

    // Prepare data for export
    const exportData = data.map((item) => ({
      Kelas: item.student?.class?.name ?? "-",
      Siswa: item.student?.name ?? "-",
      "Nama Item": item.name,
      "Tipe SKU": item.PaymentType?.skuType || "default",
      Owner: item.PaymentType?.owner || "-",
      Nominal: item.amount,
      Qty: item.quantity,
      Subtotal: item.subtotal,
      Bulan: MONTHS[parseInt(item.month) - 1] ?? item.month,
      Tahun: item.year,
      "Status Bayar": item.isPaid ? "Lunas" : "Belum Lunas",
      Kwitansi: item.payment?.receiptNumber ?? "-",
    }));

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tagihan");

    // Set column widths
    const colWidths = [
      { wch: 12 }, // Kelas
      { wch: 20 }, // Siswa
      { wch: 25 }, // Nama Item
      { wch: 12 }, // Tipe SKU
      { wch: 12 }, // Owner
      { wch: 12 }, // Nominal
      { wch: 6 }, // Qty
      { wch: 12 }, // Subtotal
      { wch: 12 }, // Bulan
      { wch: 6 }, // Tahun
      { wch: 12 }, // Status Bayar
      { wch: 15 }, // Kwitansi
    ];
    ws["!cols"] = colWidths;

    // Write file
    XLSX.writeFile(wb, filename);
    toast.success("Data berhasil diexport ke Excel!");
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    toast.error("Gagal mengexport data: " + errorMessage);
  }
}
