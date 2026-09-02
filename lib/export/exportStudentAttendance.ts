import { UserDataTypes } from "@/app/(types)";
import { attendanceTypes } from "@/app/(types)/types/attendance-types";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export interface StudentAttendanceExportData {
  "Nama Siswa": string;
  Email: string;
  NISN: string;
  "Total Hari": number;
  Hadir: number;
  Terlambat: number;
  Sakit: number;
  Izin: number;
  Alfa: number;
  "Persentase Kehadiran": string;
}

export const exportStudentAttendanceToExcel = async (student: UserDataTypes, attendances: attendanceTypes[], startDate: string, endDate: string, filename?: string) => {
  try {
    // Dynamically import xlsx only on client side
    if (typeof window === "undefined") {
      throw new Error("This function can only be called on the client side");
    }

    const XLSX = await import("xlsx");

    // Calculate statistics
    const stats = {
      total: attendances.length,
      present: attendances.filter((a) => a.status === "present").length,
      late: attendances.filter((a) => a.status === "late").length,
      sick: attendances.filter((a) => a.status === "sick").length,
      excused: attendances.filter((a) => a.status === "excused").length,
      absent: attendances.filter((a) => a.status === "absent").length,
    };

    const presentPercentage = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

    // Transform data for export
    const exportData: StudentAttendanceExportData[] = [
      {
        "Nama Siswa": student.name,
        Email: student.email || "-",
        NISN: student.nisn || "-",
        "Total Hari": stats.total,
        Hadir: stats.present,
        Terlambat: stats.late,
        Sakit: stats.sick,
        Izin: stats.excused,
        Alfa: stats.absent,
        "Persentase Kehadiran": `${presentPercentage}%`,
      },
    ];

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekap Absensi");

    // Set column widths
    const colWidths = [
      { wch: 25 }, // Nama Siswa
      { wch: 30 }, // Email
      { wch: 15 }, // NISN
      { wch: 12 }, // Total Hari
      { wch: 10 }, // Hadir
      { wch: 12 }, // Terlambat
      { wch: 10 }, // Sakit
      { wch: 10 }, // Izin
      { wch: 10 }, // Alfa
      { wch: 20 }, // Persentase Kehadiran
    ];
    ws["!cols"] = colWidths;

    // Create filename
    const exportFilename = filename || `rekap-absensi-${student.name.replace(/\s+/g, "-")}-${format(new Date(), "yyyy-MM-dd")}.xlsx`;

    // Write file
    XLSX.writeFile(wb, exportFilename);

    return {
      success: true,
      message: `Rekap absensi berhasil diexport: ${exportFilename}`,
      filename: exportFilename,
    };
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    return {
      success: false,
      message: "Gagal mengexport rekap absensi ke Excel",
      error,
    };
  }
};

export const exportStudentAttendanceDailyToExcel = async (student: UserDataTypes, attendances: attendanceTypes[], startDate: string, endDate: string, filename?: string) => {
  try {
    // Create daily attendance summary for student
    const dailyAttendanceSummary: Record<string, any> = {};
    attendances.forEach((attendance: any) => {
      const date = format(new Date(attendance.date), "yyyy-MM-dd");
      if (!dailyAttendanceSummary[date]) {
        dailyAttendanceSummary[date] = {
          hadir: 0,
          terlambat: 0,
          sakit: 0,
          izin: 0,
          alfa: 0,
        };
      }

      // Count attendance status
      switch (attendance.status) {
        case "present":
          dailyAttendanceSummary[date].hadir += 1;
          break;
        case "late":
          dailyAttendanceSummary[date].terlambat += 1;
          break;
        case "sick":
          dailyAttendanceSummary[date].sakit += 1;
          break;
        case "excused":
          dailyAttendanceSummary[date].izin += 1;
          break;
        case "absent":
          dailyAttendanceSummary[date].alfa += 1;
          break;
      }
    });

    // Dynamically import xlsx only on client side
    if (typeof window === "undefined") {
      throw new Error("This function can only be called on the client side");
    }

    const XLSX = await import("xlsx");

    // Calculate overall totals
    const overallTotals = {
      totalHadir: 0,
      totalTerlambat: 0,
      totalSakit: 0,
      totalIzin: 0,
      totalAlfa: 0,
      totalDays: Object.keys(dailyAttendanceSummary).length,
    };

    Object.values(dailyAttendanceSummary).forEach((stats) => {
      overallTotals.totalHadir += stats.hadir;
      overallTotals.totalTerlambat += stats.terlambat;
      overallTotals.totalSakit += stats.sakit;
      overallTotals.totalIzin += stats.izin;
      overallTotals.totalAlfa += stats.alfa;
    });

    const totalAttendance = overallTotals.totalHadir + overallTotals.totalTerlambat + overallTotals.totalSakit + overallTotals.totalIzin + overallTotals.totalAlfa;
    const overallPercentage = totalAttendance > 0 ? Math.round(((overallTotals.totalHadir + overallTotals.totalTerlambat) / totalAttendance) * 100) : 0;

    // Create workbook with multiple sheets
    const wb = XLSX.utils.book_new();

    // Sheet 1: Daily Breakdown
    const exportData = Object.entries(dailyAttendanceSummary).map(([date, stats]) => ({
      Tanggal: format(new Date(date), "dd/MM/yyyy", { locale: idLocale }),
      "Nama Siswa": student.name,
      Email: student.email || "-",
      NISN: student.nisn || "-",
      Hadir: stats.hadir,
      Terlambat: stats.terlambat,
      Sakit: stats.sakit,
      Izin: stats.izin,
      Alfa: stats.alfa,
      "Total Kehadiran": stats.hadir + stats.terlambat,
      "Persentase Kehadiran": `${Math.round(((stats.hadir + stats.terlambat) / (stats.hadir + stats.terlambat + stats.sakit + stats.izin + stats.alfa)) * 100) || 0}%`,
    }));

    const wsDaily = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, wsDaily, "Detail Harian");

    // Sheet 2: Overall Summary
    const summaryData = [
      {
        "Nama Siswa": student.name,
        Email: student.email || "-",
        NISN: student.nisn || "-",
        "Periode Mulai": format(new Date(startDate), "dd/MM/yyyy", { locale: idLocale }),
        "Periode Selesai": format(new Date(endDate), "dd/MM/yyyy", { locale: idLocale }),
        "Total Hari": overallTotals.totalDays,
        "Total Hadir": overallTotals.totalHadir,
        "Total Terlambat": overallTotals.totalTerlambat,
        "Total Sakit": overallTotals.totalSakit,
        "Total Izin": overallTotals.totalIzin,
        "Total Alfa": overallTotals.totalAlfa,
        "Total Kehadiran": overallTotals.totalHadir + overallTotals.totalTerlambat,
        "Total Tidak Hadir": overallTotals.totalSakit + overallTotals.totalIzin + overallTotals.totalAlfa,
        "Persentase Kehadiran": `${overallPercentage}%`,
      },
    ];

    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan Keseluruhan");

    // Set column widths for daily sheet
    const dailyColWidths = [
      { wch: 15 }, // Tanggal
      { wch: 25 }, // Nama Siswa
      { wch: 30 }, // Email
      { wch: 15 }, // NISN
      { wch: 10 }, // Hadir
      { wch: 12 }, // Terlambat
      { wch: 10 }, // Sakit
      { wch: 10 }, // Izin
      { wch: 10 }, // Alfa
      { wch: 15 }, // Total Kehadiran
      { wch: 20 }, // Persentase Kehadiran
    ];
    wsDaily["!cols"] = dailyColWidths;

    // Set column widths for summary sheet
    const summaryColWidths = [
      { wch: 25 }, // Nama Siswa
      { wch: 30 }, // Email
      { wch: 15 }, // NISN
      { wch: 15 }, // Periode Mulai
      { wch: 15 }, // Periode Selesai
      { wch: 12 }, // Total Hari
      { wch: 12 }, // Total Hadir
      { wch: 15 }, // Total Terlambat
      { wch: 12 }, // Total Sakit
      { wch: 12 }, // Total Izin
      { wch: 12 }, // Total Alfa
      { wch: 15 }, // Total Kehadiran
      { wch: 15 }, // Total Tidak Hadir
      { wch: 20 }, // Persentase Kehadiran
    ];
    wsSummary["!cols"] = summaryColWidths;

    // Create filename
    const exportFilename = filename || `rekap-absensi-harian-${student.name.replace(/\s+/g, "-")}-${format(new Date(), "yyyy-MM-dd")}.xlsx`;

    // Write file
    XLSX.writeFile(wb, exportFilename);

    return {
      success: true,
      message: `Rekap absensi harian berhasil diexport: ${exportFilename}`,
      filename: exportFilename,
    };
  } catch (error) {
    console.error("Error exporting daily attendance to Excel:", error);
    return {
      success: false,
      message: "Gagal mengexport rekap absensi harian ke Excel",
      error,
    };
  }
};

export const exportStudentAttendanceDetailToExcel = async (student: UserDataTypes, attendances: attendanceTypes[], startDate: string, endDate: string, filename?: string) => {
  try {
    // Dynamically import xlsx only on client side
    if (typeof window === "undefined") {
      throw new Error("This function can only be called on the client side");
    }

    const XLSX = await import("xlsx");

    // Create multiple sheets: Summary and Detail
    const wb = XLSX.utils.book_new();

    // Calculate statistics
    const stats = {
      total: attendances.length,
      present: attendances.filter((a: any) => a.status === "present").length,
      late: attendances.filter((a: any) => a.status === "late").length,
      sick: attendances.filter((a: any) => a.status === "sick").length,
      excused: attendances.filter((a: any) => a.status === "excused").length,
      absent: attendances.filter((a: any) => a.status === "absent").length,
    };

    const presentPercentage = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

    // Sheet 1: Summary
    const summaryData = [
      {
        "Nama Siswa": student.name,
        Email: student.email || "-",
        NISN: student.nisn || "-",
        "Total Hari": stats.total,
        Hadir: stats.present,
        Terlambat: stats.late,
        Sakit: stats.sick,
        Izin: stats.excused,
        Alfa: stats.absent,
        Persentase: `${presentPercentage}%`,
      },
    ];

    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    wsSummary["!cols"] = [{ wch: 25 }, { wch: 30 }, { wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan");

    // Sheet 2: Detail records
    const detailData = attendances.map((attendance) => ({
      "Nama Siswa": student.name,
      Tanggal: format(new Date(attendance.date), "dd/MM/yyyy", { locale: idLocale }),
      "Mata Pelajaran": attendance.schedule?.subject?.name || "-",
      Guru: attendance.schedule?.teacher?.name || "-",
      Ruangan: attendance.schedule?.room || "-",
      "Jam Mulai": attendance.schedule?.startTime || "-",
      "Jam Selesai": attendance.schedule?.endTime || "-",
      Status: getStatusLabel(attendance.status),
      Catatan: attendance.notes || "-",
    }));

    const wsDetail = XLSX.utils.json_to_sheet(detailData);
    wsDetail["!cols"] = [{ wch: 25 }, { wch: 15 }, { wch: 25 }, { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 25 }];
    XLSX.utils.book_append_sheet(wb, wsDetail, "Detail Absensi");

    // Create filename
    const exportFilename = filename || `rekap-absensi-detail-${student.name.replace(/\s+/g, "-")}-${format(new Date(), "yyyy-MM-dd")}.xlsx`;

    // Write file
    XLSX.writeFile(wb, exportFilename);

    return {
      success: true,
      message: `Rekap absensi detail berhasil diexport: ${exportFilename}`,
      filename: exportFilename,
    };
  } catch (error) {
    console.error("Error exporting detail to Excel:", error);
    return {
      success: false,
      message: "Gagal mengexport rekap absensi detail ke Excel",
      error,
    };
  }
};

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    present: "Hadir",
    late: "Terlambat",
    sick: "Sakit",
    excused: "Izin",
    absent: "Alfa",
  };
  return labels[status] || status;
}
