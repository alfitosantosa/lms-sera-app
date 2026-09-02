"use client";

import { useGetAcademicYears } from "@/app/(hooks)/hooks/AcademicYears/useAcademicYear";
import { useGetClasses } from "@/app/(hooks)/hooks/Classes/useClass";
import { useBulkCreateSchedulesData } from "@/app/(hooks)/hooks/Schedules/useBulkSchedules";
import { useGetSubjects } from "@/app/(hooks)/hooks/Subjects/useSubjects";
import { useGetTeachers } from "@/app/(hooks)/hooks/Users/useTeachers";
import { useGetUserByIdBetterAuth } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/ui/shadcn-io/copy-button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSession } from "@/lib/authClients";
import { AlertCircle, Download, FileText, Upload, X } from "lucide-react";
import { unauthorized } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export type typeData = {
  id: string;
  year: string;
  name: string;
};

function UploadSchedules() {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const { data: academicYearData = [] } = useGetAcademicYears();
  const { data: classData = [] } = useGetClasses();
  const { data: teachersData = [] } = useGetTeachers();
  const { data: subjectsData = [] } = useGetSubjects();

  const bulkCreateMutation = useBulkCreateSchedulesData();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const excelFiles = newFiles.filter((file) => file.name.endsWith(".xlsx") || file.name.endsWith(".xls"));

      if (excelFiles.length !== newFiles.length) {
        toast.error("Hanya file Excel (.xlsx atau .xls) yang diperbolehkan");
      }

      setFiles(excelFiles);

      // Preview data from first file
      if (excelFiles.length > 0) {
        try {
          // Dynamically import read-excel-file only on client side
          if (typeof window === "undefined") {
            throw new Error("This function can only be called on the client side");
          }
          const readXlsxFile = (await import("read-excel-file")).default;
          const rows = await readXlsxFile(excelFiles[0]);
          const preview = rows.slice(1, 6).map((row) => ({
            classId: row[0]?.toString() || "",
            subjectId: row[1]?.toString() || "",
            teacherId: row[2]?.toString() || "",
            academicYearId: row[3]?.toString() || "",
            dayOfWeek: row[4]?.toString() || "",
            startTime: row[5]?.toString() || "",
            endTime: row[6]?.toString() || "",
            room: row[7]?.toString() || "",
          }));
          setPreviewData(preview);
        } catch (error) {
          console.error("Preview error:", error);
        }
      } else {
        setPreviewData([]);
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    if (files.length === 1) {
      setPreviewData([]);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Pilih file terlebih dahulu");
      return;
    }

    setIsUploading(true);

    try {
      // Dynamically import read-excel-file only on client side
      if (typeof window === "undefined") {
        throw new Error("This function can only be called on the client side");
      }
      const readXlsxFile = (await import("read-excel-file")).default;

      const allSchedules: any[] = [];

      for (const file of files) {
        const rows = await readXlsxFile(file);

        // Skip header row (index 0)
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];

          // Skip empty rows
          if (!row[0]) continue;

          const scheduleData = {
            // Required fields
            classId: row[0]?.toString() || "",
            subjectId: row[1]?.toString() || "",
            teacherId: row[2]?.toString() || "",
            academicYearId: row[3]?.toString() || "",

            // Schedule info
            dayOfWeek: parseInt(row[4]?.toString()) || 1,
            startTime: row[5]?.toString() || "",
            endTime: row[6]?.toString() || "",
            room: row[7]?.toString() || "",

            // Status
            isActive: row[8] === "true" || row[8] === true || row[8] === 1 || true,
          };

          // Validate required fields and data integrity
          if (scheduleData.classId && scheduleData.subjectId && scheduleData.teacherId && scheduleData.academicYearId) {
            // Validate day of week range (1-7)
            if (scheduleData.dayOfWeek < 1 || scheduleData.dayOfWeek > 7) {
              console.warn(`Invalid day of week: ${scheduleData.dayOfWeek} for schedule with classId: ${scheduleData.classId}`);
              continue;
            }

            // Validate time format (HH:MM)
            const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
            if (!timeRegex.test(scheduleData.startTime) || !timeRegex.test(scheduleData.endTime)) {
              console.warn(`Invalid time format for schedule with classId: ${scheduleData.classId}`);
              continue;
            }

            allSchedules.push(scheduleData);
          }
        }
      }

      if (allSchedules.length === 0) {
        toast.error("Tidak ada data valid yang ditemukan dalam file");
        setIsUploading(false);
        return;
      }

      // Send bulk create request
      const result = (await bulkCreateMutation.mutateAsync({ schedules: allSchedules })) as {
        created?: number;
        total?: number;
      };

      if (result?.created) {
        toast.success(`Berhasil upload ${result.created} dari ${result.total} jadwal`);
      } else {
        toast.warning("Tidak ada jadwal baru yang ditambahkan");
      }
      setFiles([]);
      setPreviewData([]);

      // Reset file input
      const fileInput = document.getElementById("file-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error: any) {
      console.error("Upload error:", error);

      // Handle specific error messages from backend
      let errorMessage = "Gagal upload file";

      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      // Dynamically import xlsx library only on client side
      if (typeof window === "undefined") {
        throw new Error("This function can only be called on the client side");
      }
      const XLSX = await import("xlsx");

      // Create worksheet data
      const wsData = [
        // Header row
        ["Class ID*", "Subject ID*", "Teacher ID*", "Academic Year ID*", "Day of Week*", "Start Time*", "End Time*", "Room", "Is Active"],
        // Example row 1
        [classData[0]?.id || "class-id-here", subjectsData[0]?.id || "subject-id-here", teachersData[0]?.id || "teacher-id-here", academicYearData[0]?.id || "academic-year-id", "1", "07:00", "08:20", "Kelas X TSM A", "true"],
        // Example row 2
        [classData[0]?.id || "class-id-here", subjectsData[0]?.id || "subject-id-here", teachersData[0]?.id || "teacher-id-here", academicYearData[0]?.id || "academic-year-id", "2", "08:30", "09:50", "Kelas X TSM B", "true"],
      ];

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Set column widths
      ws["!cols"] = [
        { wch: 30 }, // Class ID
        { wch: 30 }, // Subject ID
        { wch: 30 }, // Teacher ID
        { wch: 30 }, // Academic Year ID
        { wch: 15 }, // Day of Week
        { wch: 10 }, // Start Time
        { wch: 10 }, // End Time
        { wch: 20 }, // Room
        { wch: 10 }, // Is Active
      ];

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Schedule Template");

      // Generate Excel file
      XLSX.writeFile(wb, "schedule-upload-template.xlsx");

      toast.success("Template Excel berhasil didownload");
    } catch (error) {
      console.error("Error generating template:", error);
      toast.error("Gagal membuat template");
    }
  };

  return (
    <div className="">
      <div className="font-bold text-3xl mb-3">Upload Page</div>

      <div className="mb-6">
        <Card className="p-6">
          <div className="text-xl font-semibold mb-4">Upload Files</div>

          <div className="space-y-4">
            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="text-sm text-blue-900 dark:text-blue-100">
                  <p className="font-semibold mb-1">Petunjuk Upload:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Download template terlebih dahulu</li>
                    <li>Isi data sesuai kolom yang tersedia</li>
                    <li>Field yang wajib diisi: Class ID, Subject ID, Teacher ID, Academic Year ID, Day of Week, Start Time, End Time</li>
                    <li>Day of Week: 1 (Senin), 2 (Selasa), 3 (Rabu), 4 (Kamis), 5 (Jumat), 6 (Sabtu), 7 (Minggu)</li>
                    <li>Format waktu: HH:MM (contoh: 07:00 atau 08:30)</li>
                    <li>Room: Nama ruangan kelas (opsional)</li>
                    <li>Is Active: true atau false</li>
                    <li>Pastikan semua ID yang dimasukkan sudah ada di sistem</li>
                    <li>Data yang tidak valid akan dilewati dan tidak diupload</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <Input className="bg-background" id="file-upload" multiple onChange={handleFileChange} type="file" accept=".xlsx,.xls" />
              <p className="text-sm text-muted-foreground mt-2">Format: .xlsx atau .xls | Maksimal file yang dapat di-upload sekaligus</p>
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold">File yang dipilih:</p>
                {files.map((file, index) => (
                  <div className="flex items-center justify-between rounded-md border p-2" key={index}>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-muted-foreground text-xs">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <Button className="h-6 w-6" onClick={() => removeFile(index)} size="icon" type="button" variant="ghost" disabled={isUploading}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {previewData.length > 0 && (
              <div className="border rounded-lg p-4">
                <p className="text-sm font-semibold mb-2">Preview Data (5 baris pertama):</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Class ID</th>
                        <th className="text-left p-2">Subject ID</th>
                        <th className="text-left p-2">Teacher ID</th>
                        <th className="text-left p-2">Day</th>
                        <th className="text-left p-2">Start Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="p-2 font-mono text-xs">{row.classId}</td>
                          <td className="p-2 font-mono text-xs">{row.subjectId}</td>
                          <td className="p-2 font-mono text-xs">{row.teacherId}</td>
                          <td className="p-2">{row.dayOfWeek}</td>
                          <td className="p-2">{row.startTime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={downloadTemplate} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>

              <Button onClick={handleUpload} disabled={files.length === 0 || isUploading}>
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? "Uploading..." : `Upload ${files.length > 0 ? `(${files.length} file)` : ""}`}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card className="p-4">
          <div className="text-xl font-bold mb-2">Data Guru</div>
          <Table>
            <TableCaption>Semua Data Guru - Copy ID untuk digunakan di Excel</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachersData.map((data: any) => (
                <TableRow key={data.id}>
                  <TableCell>{data.name}</TableCell>
                  <TableCell>{data.position}</TableCell>
                  <TableCell className="font-mono text-xs">{data.id}</TableCell>
                  <TableCell>
                    <CopyButton onClick={() => toast.success("ID berhasil dicopy")} variant="secondary" content={data.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="p-4">
          <div className="text-xl font-bold mb-2">Data Mata Pelajaran</div>
          <Table>
            <TableCaption>Semua Data Mata Pelajaran - Copy ID untuk digunakan di Excel</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjectsData.map((data: any) => (
                <TableRow key={data.id}>
                  <TableCell>{data.code}</TableCell>
                  <TableCell>{data.name}</TableCell>
                  <TableCell className="font-mono text-xs">{data.id}</TableCell>
                  <TableCell>
                    <CopyButton variant="secondary" onClick={() => toast.success("ID berhasil dicopy")} content={data.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="p-4">
          <div className="text-xl font-bold mb-2">Data Tahun Akademik</div>
          <Table>
            <TableCaption>Semua Data Tahun Akademik - Copy ID untuk digunakan di Excel</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Year</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {academicYearData.map((data) => (
                <TableRow key={data.id}>
                  <TableCell>{data.year}</TableCell>
                  <TableCell className="font-mono text-xs">{data.id}</TableCell>
                  <TableCell>
                    <CopyButton variant="secondary" onClick={() => toast.success("ID berhasil dicopy")} content={data.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="p-4">
          <div className="text-xl font-bold mb-2">Data Kelas</div>
          <Table>
            <TableCaption>Semua Data Kelas - Copy ID untuk digunakan di Excel</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classData.map((data) => (
                <TableRow key={data.id}>
                  <TableCell>{data.name}</TableCell>
                  <TableCell className="font-mono text-xs">{data.id}</TableCell>
                  <TableCell>
                    <CopyButton variant="secondary" onClick={() => toast.success("ID berhasil dicopy")} content={data.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}

export default function UserDataTable() {
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id;

  const { data: userData, isLoading: isLoadingUserData } = useGetUserByIdBetterAuth(userId as string);
  const userRole = userData?.role?.name;

  // Show loading while checking authorization
  if (isPending || isLoadingUserData) {
    return <Loading />;
  }

  // Check if user is Admin
  if (userRole !== "Admin") {
    unauthorized();
    return null;
  }

  // Render dashboard only after authorization is confirmed
  return <UploadSchedules />;
}
