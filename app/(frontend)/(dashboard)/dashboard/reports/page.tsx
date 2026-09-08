"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Calendar, ClipboardCheck, CreditCard, Download, FileSpreadsheet, FileText, Filter, GraduationCap, Users } from "lucide-react";
import React, { useState } from "react";

const reportCategories = [
  {
    id: "calendar",
    title: "Kalender Pendidikan",
    icon: Calendar,
    color: "text-blue-600",
    reports: [
      { name: "Kalender Mingguan", format: ["PDF"], description: "Kalender pendidikan per minggu" },
      { name: "Kalender Tahunan", format: ["PDF"], description: "Kalender pendidikan per tahun" },
    ],
  },
  {
    id: "schedule",
    title: "Jadwal Mata Pelajaran",
    icon: FileText,
    color: "text-green-600",
    reports: [{ name: "Jadwal Harian", format: ["PDF"], description: "Jadwal mata pelajaran setiap hari" }],
  },
  {
    id: "students",
    title: "Data Siswa",
    icon: Users,
    color: "text-purple-600",
    reports: [{ name: "Data Lengkap Siswa", format: ["Excel", "PDF"], description: "Data siswa sesuai kebutuhan" }],
  },
  {
    id: "teachers",
    title: "Data Guru",
    icon: GraduationCap,
    color: "text-orange-600",
    reports: [{ name: "Data Lengkap Guru", format: ["Excel", "PDF"], description: "Data guru sesuai kebutuhan" }],
  },
  {
    id: "attendance",
    title: "Absensi Siswa",
    icon: ClipboardCheck,
    color: "text-indigo-600",
    reports: [
      { name: "Rekap Harian", format: ["Excel", "PDF"], description: "Rekapitulasi absensi harian" },
      { name: "Rekap Mingguan", format: ["Excel", "PDF"], description: "Rekapitulasi absensi mingguan" },
      { name: "Rekap Bulanan", format: ["Excel", "PDF"], description: "Rekapitulasi absensi bulanan" },
      { name: "Rekap Semester", format: ["Excel", "PDF"], description: "Rekapitulasi absensi semester" },
      { name: "Rekap Tahunan", format: ["Excel", "PDF"], description: "Rekapitulasi absensi tahunan" },
    ],
  },
  {
    id: "violations",
    title: "Pelanggaran Siswa",
    icon: AlertTriangle,
    color: "text-red-600",
    reports: [
      { name: "Rekap Harian", format: ["PDF"], description: "Rekapitulasi pelanggaran harian" },
      { name: "Rekap Mingguan", format: ["PDF"], description: "Rekapitulasi pelanggaran mingguan" },
      { name: "Rekap Bulanan", format: ["PDF"], description: "Rekapitulasi pelanggaran bulanan" },
      { name: "Rekap Semester", format: ["PDF"], description: "Rekapitulasi pelanggaran semester" },
      { name: "Rekap Tahunan", format: ["PDF"], description: "Rekapitulasi pelanggaran tahunan" },
      { name: "Kartu Pelanggaran", format: ["PDF"], description: "Kartu pelanggaran per siswa" },
    ],
  },
  {
    id: "billing",
    title: "Bayaran/Tagihan",
    icon: CreditCard,
    color: "text-yellow-600",
    reports: [
      { name: "Rekap Harian", format: ["Excel", "PDF"], description: "Rekapitulasi pembayaran harian" },
      { name: "Rekap Mingguan", format: ["Excel", "PDF"], description: "Rekapitulasi pembayaran mingguan" },
      { name: "Rekap Bulanan", format: ["Excel", "PDF"], description: "Rekapitulasi pembayaran bulanan" },
      { name: "Rekap Semester", format: ["Excel", "PDF"], description: "Rekapitulasi pembayaran semester" },
      { name: "Rekap Tahunan", format: ["Excel", "PDF"], description: "Rekapitulasi pembayaran tahunan" },
    ],
  },
];

const filterOptions = {
  scope: ["Per Siswa", "Per Kelas", "Per Jurusan", "Per Angkatan", "Satu Sekolah"],
  class: ["X RPL 1", "X RPL 2", "XI TKJ 1", "XI TKJ 2", "XII MM 1", "XII MM 2"],
  major: ["RPL", "TKJ", "MM", "TKRO"],
  grade: ["X", "XI", "XII"],
  period: ["Hari Ini", "Minggu Ini", "Bulan Ini", "Semester Ini", "Tahun Ini"],
};

export default function ReportsModule() {
  const [selectedCategory, setSelectedCategory] = useState("attendance");
  const [filters, setFilters] = useState({
    scope: "Satu Sekolah",
    class: "",
    major: "",
    grade: "",
    period: "Bulan Ini",
  });

  const handleDownload = (reportName: string, format: string) => {
    // Simulate download
    alert(`Mengunduh ${reportName} dalam format ${format}...`);
  };

  const currentCategory = reportCategories.find((cat) => cat.id === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-blue-600" />
            <span>Sistem Laporan {process.env.NEXT_PUBLIC_CLIENT_NAME}</span>
          </CardTitle>
          <CardDescription>Generate dan download laporan untuk semua modul administrasi sekolah</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Category Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Kategori Laporan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {reportCategories.map((category) => (
              <Button key={category.id} variant={selectedCategory === category.id ? "default" : "ghost"} className="w-full justify-start" onClick={() => setSelectedCategory(category.id)}>
                <category.icon className={`h-4 w-4 mr-2 ${category.color}`} />
                {category.title}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filter Laporan</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Cakupan</label>
                  <Select value={filters.scope} onValueChange={(value) => setFilters({ ...filters, scope: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {filterOptions.scope.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {filters.scope === "Per Kelas" && (
                  <div>
                    <label className="text-sm font-medium mb-1 block">Kelas</label>
                    <Select value={filters.class} onValueChange={(value) => setFilters({ ...filters, class: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Kelas" />
                      </SelectTrigger>
                      <SelectContent>
                        {filterOptions.class.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {filters.scope === "Per Jurusan" && (
                  <div>
                    <label className="text-sm font-medium mb-1 block">Jurusan</label>
                    <Select value={filters.major} onValueChange={(value) => setFilters({ ...filters, major: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Jurusan" />
                      </SelectTrigger>
                      <SelectContent>
                        {filterOptions.major.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {filters.scope === "Per Angkatan" && (
                  <div>
                    <label className="text-sm font-medium mb-1 block">Angkatan</label>
                    <Select value={filters.grade} onValueChange={(value) => setFilters({ ...filters, grade: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Angkatan" />
                      </SelectTrigger>
                      <SelectContent>
                        {filterOptions.grade.map((option) => (
                          <SelectItem key={option} value={option}>
                            Kelas {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium mb-1 block">Periode</label>
                  <Select value={filters.period} onValueChange={(value) => setFilters({ ...filters, period: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {filterOptions.period.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reports List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {currentCategory && <currentCategory.icon className={`h-5 w-5 ${currentCategory.color}`} />}
                <span>{currentCategory?.title}</span>
              </CardTitle>
              <CardDescription>Pilih laporan yang ingin diunduh dengan format yang tersedia</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentCategory?.reports.map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold">{report.name}</h4>
                      <p className="text-sm text-gray-600">{report.description}</p>
                      <div className="flex space-x-1 mt-2">
                        {report.format.map((format) => (
                          <Badge key={format} variant="outline" className="text-xs">
                            {format}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {report.format.map((format) => (
                        <Button key={format} size="sm" variant="outline" onClick={() => handleDownload(report.name, format)} className="flex items-center space-x-1">
                          {format === "Excel" ?
                            <FileSpreadsheet className="h-4 w-4 text-green-600" />
                          : <FileText className="h-4 w-4 text-red-600" />}
                          <Download className="h-3 w-3" />
                          <span>{format}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Special Reports */}
          {selectedCategory === "violations" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Laporan Khusus Pelanggaran</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-800">Kartu Pelanggaran Siswa</h4>
                      <p className="text-sm text-yellow-700 mb-3">Laporan khusus berupa kartu pelanggaran individual untuk setiap siswa dalam format PDF</p>
                      <Button size="sm" variant="outline" className="border-yellow-300 bg-transparent">
                        <FileText className="h-4 w-4 mr-2 text-red-600" />
                        <Download className="h-3 w-3 mr-1" />
                        Download Kartu Pelanggaran
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Report Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Statistik Laporan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">127</div>
                  <div className="text-sm text-gray-600">Laporan Bulan Ini</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">1,247</div>
                  <div className="text-sm text-gray-600">Total Download</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">7</div>
                  <div className="text-sm text-gray-600">Kategori Laporan</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
