/**
 * Rentang tanggal standar aplikasi: pagination & filter tanggal selalu
 * dimulai dari tanggal 1 bulan berjalan sampai hari ini.
 */

export function startOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function monthToDateRange(date: Date = new Date()): {
  from: Date;
  to: Date;
} {
  return { from: startOfMonth(date), to: date };
}

/** Format tanggal lokal sebagai YYYY-MM-DD (bukan UTC). */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Normalisasi parameter tanggal API. Bila salah satu kosong, pakai tanggal 1
 * bulan berjalan sebagai awal dan hari ini sebagai akhir.
 */
export function defaultDateRange(
  fromdate?: string | null,
  todate?: string | null,
): { fromdate: string; todate: string } {
  const today = new Date();
  return {
    fromdate: fromdate || formatLocalDate(startOfMonth(today)),
    todate: todate || formatLocalDate(today),
  };
}
