import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export const exportClassAttendanceDailyToExcel = async (classData: any, attendanceByDate: Record<string, any[]>, students: any[], startDate: string, endDate: string, filename?: string) => {
  try {
    // Dynamically import xlsx only on client side
    if (typeof window === "undefined") {
      throw new Error("This function can only be called on client side");
    }

    const XLSX = await import("xlsx");

    // Calculate overall totals
    const overallTotals = {
      totalHadir: 0,
      totalTerlambat: 0,
      totalSakit: 0,
      totalIzin: 0,
      totalAlfa: 0,
      totalDays: Object.keys(attendanceByDate).length,
    };

    // Helper to calculate totals from a list of attendance records
    const calculateTotals = (attendances: any[]) => {
      const stats = {
        hadir: 0,
        terlambat: 0,
        sakit: 0,
        izin: 0,
        alfa: 0,
      };

      attendances.forEach((attendance: any) => {
        switch (attendance.status) {
          case "present":
            stats.hadir += 1;
            break;
          case "late":
            stats.terlambat += 1;
            break;
          case "sick":
            stats.sakit += 1;
            break;
          case "excused":
            stats.izin += 1;
            break;
          case "absent":
            stats.alfa += 1;
            break;
        }
      });
      return stats;
    };

    // Calculate overall totals from daily data
    Object.values(attendanceByDate).forEach((dayAttendances: any[]) => {
      const dayStats = calculateTotals(dayAttendances);
      overallTotals.totalHadir += dayStats.hadir;
      overallTotals.totalTerlambat += dayStats.terlambat;
      overallTotals.totalSakit += dayStats.sakit;
      overallTotals.totalIzin += dayStats.izin;
      overallTotals.totalAlfa += dayStats.alfa;
    });

    const totalAttendance = overallTotals.totalHadir + overallTotals.totalTerlambat + overallTotals.totalSakit + overallTotals.totalIzin + overallTotals.totalAlfa;
    const overallPercentage = totalAttendance > 0 ? Math.round(((overallTotals.totalHadir + overallTotals.totalTerlambat) / totalAttendance) * 100) : 0;

    // Create workbook with multiple sheets
    const wb = XLSX.utils.book_new();

    // Sheet 1: Daily Breakdown
    const dailyData = Object.entries(attendanceByDate).map(([date, attendances]) => {
      const dayStats = calculateTotals(attendances);

      return {
        Tanggal: format(new Date(date), "dd/MM/yyyy", { locale: idLocale }),
        Kelas: classData.name,
        "Total Siswa": attendances.length,
        Hadir: dayStats.hadir,
        Terlambat: dayStats.terlambat,
        Sakit: dayStats.sakit,
        Izin: dayStats.izin,
        Alfa: dayStats.alfa,
        "Total Kehadiran": dayStats.hadir + dayStats.terlambat,
        "Total Tidak Hadir": dayStats.sakit + dayStats.izin + dayStats.alfa,
        "Persentase Kehadiran": `${Math.round(((dayStats.hadir + dayStats.terlambat) / (dayStats.hadir + dayStats.terlambat + dayStats.sakit + dayStats.izin + dayStats.alfa)) * 100) || 0}%`,
      };
    });

    const wsDaily = XLSX.utils.json_to_sheet(dailyData);
    XLSX.utils.book_append_sheet(wb, wsDaily, "Detail Harian");

    // Sheet 2: Student Summary
    // Flatten attendance data to easily filter by student
    const allAttendanceRecords = Object.values(attendanceByDate).flat();

    const studentSummaryData = students.map((student, index) => {
      const studentAttendances = allAttendanceRecords.filter((a: any) => a.studentId === student.id);
      const stats = calculateTotals(studentAttendances);
      const totalPresence = stats.hadir + stats.terlambat;
      const totalAbsence = stats.sakit + stats.izin + stats.alfa;
      const totalRecords = totalPresence + totalAbsence;
      const percentage = totalRecords > 0 ? Math.round((totalPresence / totalRecords) * 100) : 0;

      return {
        No: index + 1,
        "Nama Siswa": student.name,
        Email: student.email || "-",
        Hadir: stats.hadir,
        Terlambat: stats.terlambat,
        Sakit: stats.sakit,
        Izin: stats.izin,
        Alfa: stats.alfa,
        "Total Kehadiran": totalPresence,
        "Total Tidak Hadir": totalAbsence,
        "Persentase Kehadiran": `${percentage}%`,
      };
    });

    const wsStudents = XLSX.utils.json_to_sheet(studentSummaryData);
    XLSX.utils.book_append_sheet(wb, wsStudents, "Ringkasan Siswa");

    // Sheet 3: Overall Summary
    const summaryData = [
      {
        Kelas: classData.name,
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
      { wch: 20 }, // Kelas
      { wch: 12 }, // Total Siswa
      { wch: 8 }, // Hadir
      { wch: 10 }, // Terlambat
      { wch: 8 }, // Sakit
      { wch: 8 }, // Izin
      { wch: 8 }, // Alfa
      { wch: 15 }, // Total Kehadiran
      { wch: 15 }, // Total Tidak Hadir
      { wch: 20 }, // Persentase Kehadiran
    ];
    wsDaily["!cols"] = dailyColWidths;

    // Set column widths for student summary sheet
    const studentColWidths = [
      { wch: 5 }, // No
      { wch: 30 }, // Nama Siswa
      { wch: 25 }, // Email
      { wch: 8 }, // Hadir
      { wch: 10 }, // Terlambat
      { wch: 8 }, // Sakit
      { wch: 8 }, // Izin
      { wch: 8 }, // Alfa
      { wch: 15 }, // Total Kehadiran
      { wch: 15 }, // Total Tidak Hadir
      { wch: 20 }, // Persentase Kehadiran
    ];
    wsStudents["!cols"] = studentColWidths;

    // Set column widths for summary sheet
    const summaryColWidths = [
      { wch: 20 }, // Kelas
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
    const exportFilename = filename || `rekap-absensi-kelas-${classData.name.replace(/\s+/g, "-")}-${format(new Date(), "yyyy-MM-dd")}.xlsx`;

    // Write file
    XLSX.writeFile(wb, exportFilename);

    return {
      success: true,
      message: `Rekap absensi kelas berhasil diexport: ${exportFilename}`,
      filename: exportFilename,
    };
  } catch (error) {
    console.error("Error exporting class attendance to Excel:", error);
    return {
      success: false,
      message: "Gagal mengexport rekap absensi kelas ke Excel",
      error,
    };
  }
};
