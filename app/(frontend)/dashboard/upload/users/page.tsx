"use client";

import { useGetAcademicYears } from "@/app/(hooks)/hooks/AcademicYears/useAcademicYear";
import { useGetClasses } from "@/app/(hooks)/hooks/Classes/useClass";
import { useGetMajors } from "@/app/(hooks)/hooks/Majors/useMajors";
import { useGetRoles } from "@/app/(hooks)/hooks/Roles/useRoles";
import { useGetTahfidzGroup } from "@/app/(hooks)/hooks/TahfidzGroup/useTahfidzGroup";
import { useBulkCreateUserData } from "@/app/(hooks)/hooks/Users/useBulkUsersData";
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

function UploadUsers() {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const { data: rolesData = [] } = useGetRoles();
  const { data: academicYearData = [] } = useGetAcademicYears();
  const { data: classData = [] } = useGetClasses();
  const { data: majorsData = [] } = useGetMajors();
  const { data: tahfidzGroupData = [] } = useGetTahfidzGroup();

  const bulkCreateMutation = useBulkCreateUserData();

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
            name: row[0]?.toString() || "",
            email: row[1]?.toString() || "",
            nik: row[2]?.toString() || "",
            nisn: row[3]?.toString() || "",
            roleId: row[4]?.toString() || "",
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

  const parseDate = (value: any): Date | null => {
    if (!value) return null;

    // If it's already a Date object
    if (value instanceof Date) return value;

    // If it's a number (Excel date serial number)
    if (typeof value === "number") {
      // Excel date: days since 1900-01-01 (with adjustment for 1900 leap year bug)
      const date = new Date((value - 25569) * 86400 * 1000);
      return isNaN(date.getTime()) ? null : date;
    }

    // If it's a string, try multiple formats
    if (typeof value === "string") {
      // Remove any whitespace
      const trimmed = value.trim();

      // Format: DD/MM/YYYY or D/M/YYYY
      if (trimmed.includes("/")) {
        const parts = trimmed.split("/");
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
          const year = parseInt(parts[2], 10);

          if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
            const date = new Date(year, month, day);
            return isNaN(date.getTime()) ? null : date;
          }
        }
      }

      // Format: DD-MM-YYYY or D-M-YYYY
      if (trimmed.includes("-") && !trimmed.startsWith("20")) {
        const parts = trimmed.split("-");
        if (parts.length === 3 && parts[2].length === 4) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const year = parseInt(parts[2], 10);

          if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
            const date = new Date(year, month, day);
            return isNaN(date.getTime()) ? null : date;
          }
        }
      }

      // Format: YYYY-MM-DD (ISO format)
      const isoDate = new Date(trimmed);
      if (!isNaN(isoDate.getTime())) {
        return isoDate;
      }
    }

    return null;
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

      const allUsers: any[] = [];

      for (const file of files) {
        const rows = await readXlsxFile(file);

        // Skip header row (index 0)
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];

          // Skip empty rows
          if (!row[0]) continue;

          const userData = {
            // Required fields
            name: row[0]?.toString() || "",

            // Basic info
            email: row[1]?.toString() || null,
            nik: row[2]?.toString() || null,
            nisn: row[3]?.toString() || null,
            roleId: row[4]?.toString() || null,

            // Personal info
            gender: row[5]?.toString() || null,
            birthPlace: row[6]?.toString() || null,
            birthDate: parseDate(row[7]),
            address: row[8]?.toString() || null,
            parentPhone: row[9]?.toString() || null,

            // Academic info
            academicYearId: row[10]?.toString() || null,
            classId: row[11]?.toString() || null,
            tahfidzGroupId: row[12]?.toString() || null,
            majorId: row[13]?.toString() || null,

            // Dates
            enrollmentDate: parseDate(row[14]),
            graduationDate: parseDate(row[15]),

            // Employee specific (for staff/teacher)
            employeeId: row[16]?.toString() || null,
            position: row[17]?.toString() || null,
            startDate: parseDate(row[18]),
            endDate: parseDate(row[19]),

            // Status
            status: row[20]?.toString() || "active",
            isActive: row[21] === "true" || row[21] === true || row[21] === 1 || true,

            // Relations (optional)
            relation: row[22]?.toString() || null,
          };

          // Validate required field
          if (userData.name) {
            allUsers.push(userData);
          }
        }
      }

      if (allUsers.length === 0) {
        toast.error("Tidak ada data valid yang ditemukan dalam file");
        setIsUploading(false);
        return;
      }

      // Send bulk create request

      await bulkCreateMutation.mutateAsync({ users: allUsers });

      toast.success(`Berhasil upload ${allUsers.length} user`);
      setFiles([]);
      setPreviewData([]);

      // Reset file input
      const fileInput = document.getElementById("file-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error?.response?.data?.error || "Gagal upload file");
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
        // Header row (bold, with background color would need styling)
        [
          "Name*",
          "Email",
          "NIK",
          "NISN",
          "Role ID",
          "Gender",
          "Birth Place",
          "Birth Date",
          "Address",
          "Parent Phone",
          "Academic Year ID",
          "Class ID",
          "Tahfidz Group ID",
          "Major ID",
          "Enrollment Date",
          "Graduation Date",
          "Employee ID",
          "Position",
          "Start Date",
          "End Date",
          "Status",
          "Is Active",
          "Relation",
        ],
        // Example row 1
        [
          "John Doe",
          "john@example.com",
          "1234567890123456",
          "0012345678",
          rolesData[0]?.id || "",
          "L",
          "Jakarta",
          "15/01/2005",
          "Jl. Example No. 123",
          "081234567890",
          academicYearData[0]?.id || "",
          classData[0]?.id || "",
          tahfidzGroupData[0]?.id || "",
          majorsData[0]?.id || "",
          "01/07/2023",
          "",
          "",
          "",
          "",
          "",
          "active",
          "true",
          "",
        ],
        // Example row 2
        [
          "Jane Smith",
          "jane@example.com",
          "9876543210987654",
          "0098765432",
          rolesData[0]?.id || "",
          "P",
          "Bandung",
          "20/03/2006",
          "Jl. Contoh No. 456",
          "082345678901",
          academicYearData[0]?.id || "",
          classData[0]?.id || "",
          tahfidzGroupData[0]?.id || "",
          majorsData[0]?.id || "",
          "01/07/2023",
          "",
          "",
          "",
          "",
          "",
          "active",
          "true",
          "",
        ],
      ];

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Set column widths
      ws["!cols"] = [
        { wch: 20 }, // Name
        { wch: 25 }, // Email
        { wch: 18 }, // NIK
        { wch: 12 }, // NISN
        { wch: 30 }, // Role ID
        { wch: 8 }, // Gender
        { wch: 15 }, // Birth Place
        { wch: 12 }, // Birth Date
        { wch: 30 }, // Address
        { wch: 15 }, // Parent Phone
        { wch: 30 }, // Academic Year ID
        { wch: 30 }, // Class ID
        { wch: 30 }, // Tahfidz Group ID
        { wch: 30 }, // Major ID
        { wch: 15 }, // Enrollment Date
        { wch: 15 }, // Graduation Date
        { wch: 15 }, // Employee ID
        { wch: 20 }, // Position
        { wch: 12 }, // Start Date
        { wch: 12 }, // End Date
        { wch: 10 }, // Status
        { wch: 10 }, // Is Active
        { wch: 15 }, // Relation
      ];

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "User Template");

      // Generate Excel file
      XLSX.writeFile(wb, "user-upload-template.xlsx");

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
                    <li>Field yang wajib diisi: Name</li>
                    <li>Format tanggal: DD/MM/YYYY (contoh: 15/01/2005 atau 01/07/2023)</li>
                    <li>Gender: L (Laki-laki) atau P (Perempuan)</li>
                    <li>Status: active atau inactive</li>
                    <li>Is Active: true atau false</li>
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
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Email</th>
                        <th className="text-left p-2">NIK</th>
                        <th className="text-left p-2">NISN</th>
                        <th className="text-left p-2">Role ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="p-2">{row.name}</td>
                          <td className="p-2">{row.email}</td>
                          <td className="p-2">{row.nik}</td>
                          <td className="p-2">{row.nisn}</td>
                          <td className="p-2 font-mono text-xs">{row.roleId}</td>
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
          <div className="text-xl font-bold mb-2">Data Roles</div>
          <Table>
            <TableCaption>Semua Data Roles - Copy ID untuk digunakan di Excel</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rolesData.map((data) => (
                <TableRow key={data.id}>
                  <TableCell>{data.name}</TableCell>
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
          <div className="text-xl font-bold mb-2">Data Jurusan</div>
          <Table>
            <TableCaption>Semua Data Jurusan - Copy ID untuk digunakan di Excel</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {majorsData.map((data) => (
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
        <Card className="p-4">
          <div className="text-xl font-bold mb-2">Data Tahfidz Group</div>
          <Table>
            <TableCaption>Semua Data Tahfidz Group - Copy ID untuk digunakan di Excel</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tahfidzGroupData.map((data) => (
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
    if (userRole !== "Bendahara") {
      unauthorized();
      return null;
    }
  }

  // Render dashboard only after authorization is confirmed
  return <UploadUsers />;
}
