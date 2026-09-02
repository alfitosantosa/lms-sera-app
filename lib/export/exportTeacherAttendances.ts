import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export interface TeacherAttendanceExportData {
  "Nama Guru": string;
  Email: string;
  "ID Pegawai": string;
  "Total Hari Kerja": number;
  Hadir: number;
  Sakit: number;
  Izin: number;
  Alfa: number;
  Terlambat: number;
  "Persentase Kehadiran": string;
}

export const exportTeacherAttendanceToExcel = async (data: any[], startDate: string, endDate: string, filename?: string) => {
  try {
    // Dynamically import xlsx only on client side
    if (typeof window === "undefined") {
      throw new Error("This function can only be called on the client side");
    }

    const XLSX = await import("xlsx");

    // Transform data for export
    const exportData: TeacherAttendanceExportData[] = data.map((teacher) => ({
      "Nama Guru": teacher.name,
      Email: teacher.email,
      "ID Pegawai": teacher.employeeId || "-",
      "Total Hari Kerja": teacher.statistics?.totalDays || 0,
      Hadir: teacher.statistics?.presentDays || 0,
      Sakit: teacher.statistics?.sickDays || 0,
      Izin: teacher.statistics?.leaveDays || 0,
      Alfa: teacher.statistics?.absentDays || 0,
      Terlambat: teacher.statistics?.lateDays || 0,
      "Persentase Kehadiran": `${teacher.statistics?.presentPercentage || 0}%`,
    }));

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Absensi");

    // Set column widths
    const colWidths = [
      { wch: 25 }, // Nama Guru
      { wch: 30 }, // Email
      { wch: 15 }, // ID Pegawai
      { wch: 15 }, // Total Hari Kerja
      { wch: 10 }, // Hadir
      { wch: 10 }, // Sakit
      { wch: 10 }, // Izin
      { wch: 10 }, // Alfa
      { wch: 10 }, // Terlambat
      { wch: 20 }, // Persentase Kehadiran
    ];
    ws["!cols"] = colWidths;

    // Create filename
    const exportFilename = filename || `laporan-absensi-guru-${format(new Date(), "yyyy-MM-dd")}.xlsx`;

    // Write file
    XLSX.writeFile(wb, exportFilename);

    return {
      success: true,
      message: `Laporan berhasil diexport: ${exportFilename}`,
      filename: exportFilename,
    };
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    return {
      success: false,
      message: "Gagal mengexport laporan ke Excel",
      error,
    };
  }
};

export const exportTeacherAttendanceDetailToExcel = async (data: any[], startDate: string, endDate: string, filename?: string) => {
  try {
    // Dynamically import xlsx only on client side
    if (typeof window === "undefined") {
      throw new Error("This function can only be called on the client side");
    }

    const XLSX = await import("xlsx");

    // Create multiple sheets: Summary and Detail
    const wb = XLSX.utils.book_new();

    // Sheet 1: Summary
    const summaryData = data.map((teacher) => ({
      "Nama Guru": teacher.name,
      Email: teacher.email,
      "ID Pegawai": teacher.employeeId || "-",
      "Total Hari": teacher.statistics?.totalDays || 0,
      Hadir: teacher.statistics?.presentDays || 0,
      Sakit: teacher.statistics?.sickDays || 0,
      Izin: teacher.statistics?.leaveDays || 0,
      Alfa: teacher.statistics?.absentDays || 0,
      Terlambat: teacher.statistics?.lateDays || 0,
      Persentase: `${teacher.statistics?.presentPercentage || 0}%`,
    }));

    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    wsSummary["!cols"] = [{ wch: 25 }, { wch: 30 }, { wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan");

    // Sheet 2: Detail records
    const detailData: any[] = [];
    data.forEach((teacher) => {
      if (teacher.teacherAttendances && Array.isArray(teacher.teacherAttendances)) {
        teacher.teacherAttendances.forEach((attendance: any) => {
          detailData.push({
            "Nama Guru": teacher.name,
            Email: teacher.email,
            Tanggal: format(new Date(attendance.date), "dd/MM/yyyy", {
              locale: idLocale,
            }),
            Status: getStatusLabel(attendance.status),
            "Jam Check-in": attendance.checkinTime ? format(new Date(attendance.checkinTime), "HH:mm") : "-",
            Catatan: attendance.notes || "-",
          });
        });
      }
    });

    const wsDetail = XLSX.utils.json_to_sheet(detailData);
    wsDetail["!cols"] = [{ wch: 25 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 25 }];
    XLSX.utils.book_append_sheet(wb, wsDetail, "Detail Absensi");

    // Create filename
    const exportFilename = filename || `laporan-absensi-detail-${format(new Date(), "yyyy-MM-dd")}.xlsx`;

    // Write file
    XLSX.writeFile(wb, exportFilename);

    return {
      success: true,
      message: `Laporan detail berhasil diexport: ${exportFilename}`,
      filename: exportFilename,
    };
  } catch (error) {
    console.error("Error exporting detail to Excel:", error);
    return {
      success: false,
      message: "Gagal mengexport laporan detail ke Excel",
      error,
    };
  }
};

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    hadir: "Hadir",
    sakit: "Sakit",
    izin: "Izin",
    alfa: "Alfa",
    terlambat: "Terlambat",
  };
  return labels[status] || status;
}
