```markdown
# Product Requirements Document (PRD)
# LMS Rahmaniyah - Sistem Informasi Sekolah

**Versi:** 1.0  
**Tanggal:** 11 September 2026  
**Untuk:** Yayasan Pendidikan Rahmaniyah Al-Islamy

---

## 📋 Ringkasan Produk

**LMS Rahmaniyah** adalah sistem informasi manajemen sekolah terintegrasi untuk SMP, SMA, dan SMK IT Rahmaniyah Al-Islamy. Platform ini mengelola seluruh aspek operasional sekolah dari akademik, keuangan, kedisiplinan, hingga tahfidz Al-Qur'an.

---

## 🎯 Target Pengguna

1. **Administrator** - Pengelola sistem dan master data
2. **Bendahara** - Staff keuangan dan penagihan
3. **Guru/Teacher** - Pengajar dan wali kelas
4. **Siswa/Student** - Peserta didik
5. **Orang Tua/Parent** - Wali murid

---

## 🏗️ Struktur Multi-Yayasan (Foundation)

### Foundation Management
- **Multi-tenant system** - Mendukung beberapa yayasan dalam satu platform
- **Foundation Code** - Kode unik untuk registrasi user ke yayasan
- **Isolasi Data** - Data antar yayasan terpisah dan aman
- **Foundation Profile** - Nama, alamat, telepon, logo yayasan

### Major (Jurusan/Cabang)
- **Multi-Major per Foundation** - Setiap yayasan bisa memiliki beberapa jurusan/cabang
- **Major Code** - Kode unik per jurusan (e.g., SMK-IT, SMA-IT, SMP-IT)
- **Major Profile** - Alamat, telepon, admin, tanda tangan digital
- **Isolasi Akun Bank** - Setiap jurusan memiliki rekening bank terpisah

---

## 📚 Modul Utama

### 1. **Manajemen Akademik**

#### 1.1 Tahun Akademik
- ✅ Pengaturan tahun ajaran aktif
- ✅ Tanggal mulai dan selesai semester
- ✅ Multi tahun akademik untuk histori

#### 1.2 Jurusan & Kelas
- ✅ Master data jurusan (Major)
- ✅ Manajemen kelas per tingkat (Grade 1-12)
- ✅ Kapasitas kelas (default: 36 siswa)
- ✅ Kelas per tahun akademik

#### 1.3 Mata Pelajaran
- ✅ Master data mata pelajaran (Subject)
- ✅ Kode dan nama pelajaran
- ✅ Jumlah SKS/kredits
- ✅ Assignment per jurusan

#### 1.4 Jadwal Pelajaran
- ✅ Scheduling per kelas
- ✅ Hari, jam mulai, jam selesai
- ✅ Ruang kelas
- ✅ Assignment guru pengampu
- ✅ Filter by class, teacher, day

---

### 2. **Manajemen Presensi**

#### 2.1 Presensi Siswa
- ✅ Absensi per jadwal pelajaran
- ✅ Status: Hadir, Sakit, Izin, Alfa
- ✅ Catatan presensi
- ✅ Bulk attendance (absen sekaligus 1 kelas)
- ✅ Rekap presensi per periode
- ✅ Filter by student, class, date range

#### 2.2 Presensi Guru
- ✅ Check-in dan check-out waktu
- ✅ Status kehadiran harian
- ✅ Catatan ketidakhadiran
- ✅ Rekap kehadiran per bulan

---

### 3. **Tahfidz Al-Qur'an**

#### 3.1 Kelompok Tahfidz
- ✅ Manajemen kelompok hafalan
- ✅ Pembagian per tingkat
- ✅ Kapasitas per kelompok (default: 40)
- ✅ Assignment guru pembimbing

#### 3.2 Master Surah
- ✅ Database 114 surah Al-Qur'an
- ✅ Nama arab dan latin
- ✅ Jumlah ayat
- ✅ Tempat turun (Makkiyah/Madaniyah)

#### 3.3 Rekam Setoran
- ✅ Pencatatan hafalan siswa
- ✅ Surah dan range ayat (ayat awal - akhir)
- ✅ Penilaian kualitas hafalan
- ✅ Catatan guru pembimbing
- ✅ Histori progress hafalan

---

### 4. **Sistem Pembayaran & Keuangan**

#### 4.1 Jenis Pembayaran (Payment Type)
- ✅ SPP bulanan
- ✅ Biaya catering
- ✅ Biaya jemputan
- ✅ Biaya lainnya (custom)
- ✅ Pengaturan jumlah dan harga
- ✅ Fixed amount atau custom amount
- ✅ Fixed quantity atau custom quantity
- ✅ SKU Type untuk kategorisasi

#### 4.2 Tagihan Siswa (Payment Items)
- ✅ Generate tagihan per siswa
- ✅ Tagihan per bulan
- ✅ Status pembayaran (Lunas/Belum Lunas)
- ✅ Nominal, jumlah, subtotal
- ✅ Import bulk tagihan via Excel

#### 4.3 Pembayaran (Payment)
- ✅ Pencatatan pembayaran manual (offline)
- ✅ Pembayaran online via **Midtrans**
  - Snap (redirect ke halaman Midtrans)
  - Core API (pembayaran dalam aplikasi)
- ✅ Nomor kwitansi otomatis (KWT-XXXXXX)
- ✅ Validasi transfer manual
- ✅ Pilih rekening bank tujuan
- ✅ Catatan pembayaran
- ✅ Receipt/kwitansi PDF

#### 4.4 Rekening Bank
- ✅ Multi rekening per jurusan
- ✅ Nama bank
- ✅ Nomor rekening
- ✅ Nama pemilik rekening

#### 4.5 Dashboard Tunggakan
- ✅ Chart total tunggakan per bulan
- ✅ Filter by date range
- ✅ Filter by major/jurusan
- ✅ Filter by SKU Type
- ✅ Top siswa dengan tunggakan tertinggi
- ✅ Export Excel tunggakan

---

### 5. **Sistem Pelanggaran (Violations)**

#### 5.1 Jenis Pelanggaran
- ✅ Master data tipe pelanggaran
- ✅ Kategori (ringan, sedang, berat)
- ✅ Point pelanggaran
- ✅ Deskripsi pelanggaran
- ✅ Assignment per tahun akademik

#### 5.2 Pencatatan Pelanggaran
- ✅ Catat pelanggaran siswa
- ✅ Tanggal kejadian
- ✅ Guru pelapor
- ✅ Kelas siswa
- ✅ Status (active/resolved)
- ✅ Tindak lanjut dan catatan penyelesaian

---

### 6. **Penilaian & Rapor**

#### 6.1 Tipe Nilai (Grade Type)
- ✅ Tugas (task)
- ✅ Ulangan Harian
- ✅ UTS (Mid Exam)
- ✅ UAS (Final Exam)
- ✅ Praktik
- ✅ Bobot penilaian per tipe

#### 6.2 Konfigurasi Penilaian
- ✅ Setting bobot per mata pelajaran
- ✅ Minimal entri nilai
- ✅ Wajib atau opsional
- ✅ Per kelas dan tahun akademik

#### 6.3 Input Nilai
- ✅ Entry nilai per siswa per tipe
- ✅ Skor dan skor maksimal
- ✅ Deskripsi/catatan
- ✅ Tanggal penilaian

#### 6.4 Rapor
- ✅ Rapor per semester
- ✅ Rata-rata per kategori nilai
- ✅ Nilai akhir dan predikat
- ✅ Letter grade (A, B, C, D, E)
- ✅ Status kelulusan
- ✅ Catatan guru
- ✅ Publikasi rapor ke siswa/ortu

#### 6.5 Skala Nilai
- ✅ Konversi skor ke huruf
- ✅ Range nilai (min-max)
- ✅ Predikat (Sangat Baik, Baik, Cukup, Kurang)

---

### 7. **Tugas & Penugasan (Assignments)**

#### 7.1 Pembuatan Tugas
- ✅ Guru membuat tugas per jadwal
- ✅ Judul dan deskripsi tugas
- ✅ File attachment
- ✅ Tanggal assigned dan deadline
- ✅ Maks skor
- ✅ Izinkan pengumpulan terlambat
- ✅ Status publish/draft

#### 7.2 Pengumpulan Tugas
- ✅ Siswa submit tugas
- ✅ File attachment submission
- ✅ Catatan pengumpulan
- ✅ Status (submitted, graded, late)
- ✅ Timestamp pengumpulan

#### 7.3 Penilaian Tugas
- ✅ Guru beri nilai dan feedback
- ✅ Skor dan catatan
- ✅ Status grading
- ✅ Otomatis masuk ke nilai (Grade)

---

### 8. **Manajemen User**

#### 8.1 Autentikasi
- ✅ Sign up dengan email/password
- ✅ Sign in dengan email/password
- ✅ Sign in dengan Google OAuth
- ✅ Email verification
- ✅ Session management
- ✅ Multi-device login

#### 8.2 Role & Permission
- ✅ Admin - Full akses semua modul
- ✅ Bendahara - Akses pembayaran dan tagihan
- ✅ Teacher - Akses jadwal, presensi, nilai, tugas
- ✅ Student - View jadwal, nilai, tugas, pembayaran sendiri
- ✅ Parent - View data anak
- ✅ Custom roles dengan permission array

#### 8.3 Profile User (UserData)
- ✅ Data diri lengkap (NIK, NISN)
- ✅ Tempat & tanggal lahir
- ✅ Alamat & telepon
- ✅ Gender
- ✅ Foto profil
- ✅ Assignment ke yayasan & jurusan
- ✅ Assignment ke kelas
- ✅ Status (active/inactive)
- ✅ Employee ID untuk guru/staff
- ✅ Parent phone untuk siswa

---

### 9. **Notifikasi & Komunikasi**

#### 9.1 Notifikasi In-App
- ✅ Notifikasi pembayaran
- ✅ Notifikasi tugas baru
- ✅ Notifikasi nilai
- ✅ Notifikasi presensi
- ✅ Mark as read/unread
- ✅ Link ke detail

#### 9.2 WhatsApp Bot (Evolution API)
- ✅ Kirim notif ke ortu via WhatsApp
- ✅ Notif tunggakan pembayaran
- ✅ Notif presensi harian
- ✅ Notif pelanggaran
- ✅ Integrasi dengan Evolution API

#### 9.3 Pengumuman
- ✅ Posting pengumuman sekolah
- ✅ Judul, konten, gambar
- ✅ Link eksternal
- ✅ Periode tayang (start-end date)
- ✅ Status publish/draft

---

### 10. **Kalender & Event**

#### 10.1 Kalender Akademik
- ✅ Event per tahun akademik
- ✅ Tipe event (holiday, exam, ceremony, etc.)
- ✅ Judul dan deskripsi event
- ✅ Tanggal event
- ✅ Status publikasi

---

### 11. **Dashboard & Reporting**

#### 11.1 Dashboard Content
- ✅ Hero banner/slider
- ✅ Quick access cards
- ✅ Content management
- ✅ Order/urutan tampilan
- ✅ Schedule tayang

#### 11.2 Dashboard Analytics
- ✅ Total siswa per jurusan
- ✅ Total guru aktif
- ✅ Total tunggakan pembayaran
- ✅ Rekap presensi real-time
- ✅ Chart statistik bulanan

#### 11.3 Laporan
- ✅ Laporan presensi siswa
- ✅ Laporan pembayaran & tunggakan
- ✅ Laporan pelanggaran
- ✅ Laporan nilai per kelas
- ✅ Export to Excel

---

### 12. **Upload & Import Data**

#### 12.1 Import Excel
- ✅ Import siswa bulk
- ✅ Import guru bulk
- ✅ Import tagihan pembayaran bulk
- ✅ Import jadwal bulk
- ✅ Template download

#### 12.2 Template Management
- ✅ Template Excel standar
- ✅ Validasi format
- ✅ Error handling & preview

---

### 13. **Admin Tools**

#### 13.1 Foundation Management
- ✅ CRUD yayasan
- ✅ Foundation code generator
- ✅ Assign user ke yayasan

#### 13.2 Major Management
- ✅ CRUD jurusan per yayasan
- ✅ Config akun bank per jurusan
- ✅ Admin signature digital

#### 13.3 User Management
- ✅ CRUD users
- ✅ Assign role
- ✅ Ban/unban user
- ✅ Reset password
- ✅ View user without UserData (untuk assign)

#### 13.4 Special Schedule
- ✅ Jadwal khusus (libur, acara)
- ✅ Override jadwal normal

---

## 🔐 Keamanan & Akses

### Authentication
- Better Auth dengan Prisma adapter
- Session-based dengan cookie secure
- Email verification
- Google OAuth integration

### Authorization
- Role-based access control (RBAC)
- Permission array per role
- Foundation & Major isolation
- Route middleware protection

### Data Security
- PostgreSQL dengan SSL
- Environment variables untuk credentials
- API routes dengan error handling
- Input validation & sanitization

---

## 💳 Integrasi Pembayaran

### Midtrans Payment Gateway
- ✅ Snap integration (redirect payment)
- ✅ Core API (in-app payment)
- ✅ Webhook untuk status update
- ✅ Multiple payment methods:
  - Transfer bank
  - Virtual account
  - E-wallet (GoPay, OVO, DANA)
  - QRIS
  - Credit card

---

## 📱 WhatsApp Integration

### Evolution API (BotWA)
- ✅ Send notifikasi ke nomor orang tua
- ✅ Bulk message support
- ✅ Template message
- ✅ Media attachment (gambar, PDF)
- ✅ Delivery status tracking

---

## 📊 Reporting & Export

### Format Export
- ✅ PDF (kwitansi, rapor)
- ✅ Excel (tunggakan, rekap presensi, data siswa)

### Report Types
- Financial reports (tunggakan, penerimaan)
- Attendance reports (siswa & guru)
- Academic reports (nilai, rapor)
- Violation reports (kedisiplinan)
- Student information reports

---

## 🎨 User Interface

### Design System
- Tailwind CSS v4 dengan OKLCH colors
- shadcn/ui components (Radix UI primitives)
- Responsive design (mobile, tablet, desktop)
- Dark mode support (next-themes)

### Key UI Components
- Sidebar navigation (role-based menu)
- Data tables (TanStack Table)
- Forms (React Hook Form + Zod)
- Dialogs & modals
- Date pickers
- Charts (Recharts)
- Toast notifications (Sonner)

---

## 🛠️ Tech Stack Summary

### Frontend
- **Framework:** Next.js 16 (App Router)
- **React:** 19
- **TypeScript:** 5
- **Styling:** Tailwind CSS v4
- **UI Library:** shadcn/ui + Radix UI
- **State:** TanStack Query v5 + Jotai
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js 24 (production), Bun (development)
- **Database:** PostgreSQL
- **ORM:** Prisma 7
- **Auth:** Better Auth
- **API:** Next.js API Routes (REST)

### Integrations
- **Payment:** Midtrans (Snap + Core API)
- **WhatsApp:** Evolution API
- **File Storage:** Local/Cloud
- **PDF Generation:** @react-pdf/renderer
- **Excel:** xlsx, read-excel-file

### DevOps
- **Build:** Turbopack
- **Container:** Docker (standalone output)
- **Version Control:** Git
- **Package Manager:** Bun (dev), npm (production)

---

## 📈 Key Metrics & KPIs

### Academic
- Jumlah siswa aktif per jurusan
- Rata-rata kehadiran siswa
- Rata-rata nilai per kelas
- Progress hafalan tahfidz

### Financial
- Total pembayaran bulanan
- Tunggakan per siswa
- Collection rate per SKU type
- Outstanding balance trend

### Operational
- Presensi guru
- Tugas submitted vs pending
- Pelanggaran per kategori
- User activity

---

## 🚀 Fitur Unggulan

1. ✅ **Multi-Foundation System** - Satu platform untuk banyak yayasan
2. ✅ **Tahfidz Tracking** - Rekam hafalan Al-Qur'an siswa
3. ✅ **Online Payment** - Integrasi Midtrans lengkap
4. ✅ **WhatsApp Notification** - Notifikasi otomatis ke orang tua
5. ✅ **Bulk Import** - Upload data Excel dalam jumlah besar
6. ✅ **Comprehensive Reporting** - Dashboard analytics lengkap
7. ✅ **Mobile Responsive** - Akses dari smartphone
8. ✅ **Role-Based Access** - Hak akses sesuai peran

---

## 📝 Catatan Teknis

### Database Schema
- 34+ models/entities
- Relational mapping dengan Prisma
- Snake_case table names (@@map)
- Indexes untuk query optimization
- Cascade delete untuk referential integrity

### API Conventions
- RESTful endpoint structure
- JSON response format
- Error handling dengan handlePrismaError
- Async params unwrapping (Next.js 16)
- Search params validation

### Frontend Patterns
- Server Component untuk static content
- Client Component untuk interactivity
- TanStack Query untuk server state
- React Hook Form untuk forms
- Zod schema untuk validation

---

## 🔄 Update & Maintenance

### Version Control
- Git dengan feature branches
- Commit message convention
- Pull request reviews
- Staging environment testing

### Database Migrations
- Prisma migrate dev (development)
- Prisma migrate deploy (production)
- Migration rollback strategy
- Backup sebelum major changes

### Performance Optimization
- React Query caching strategy:
  - Static: 1 hour (majors, roles, subjects)
  - Dynamic: 5 min (payments, schedules)
  - Realtime: 30 sec (attendance, scores)
- Image optimization (Next.js Image)
- Code splitting & lazy loading
- Database query optimization

---

## 📞 Support & Documentation

### For Developers
- AGENTS.md - Repository guidelines
- DESIGN.md - Architecture decisions
- Steering files (.kiro/steering/)
- API documentation (inline comments)
- TypeScript types (app/(types)/)

### For Users
- User manual (in-app help)
- Video tutorials
- FAQ section
- Support contact (admin)

---

## 🎯 Roadmap & Future Enhancements

### Phase 2 (Planned)
- [ ] Parent mobile app
- [ ] E-learning content management
- [ ] Video conference integration
- [ ] Alumni tracking
- [ ] Advanced analytics dashboard
- [ ] Multi-language support

### Under Consideration
- [ ] AI-powered grade prediction
- [ ] Automated schedule generator
- [ ] Smart recommendation system
- [ ] Blockchain certificate verification
- [ ] Integration with gov systems (Dapodik)

---

## ✅ Kesimpulan

LMS Rahmaniyah adalah sistem informasi sekolah yang **lengkap, terintegrasi, dan modern** yang mengelola seluruh aspek operasional sekolah dari akademik, keuangan, kedisiplinan, hingga kegiatan tahfidz Al-Qur'an. 

Platform ini dirancang khusus untuk:
- **Yayasan Pendidikan Islam** dengan kebutuhan tahfidz
- **Multi-school management** dalam satu platform
- **Otomasi proses** pembayaran dan notifikasi
- **Kemudahan akses** untuk semua stakeholder

---

**Dokumen ini dibuat:** 11 September 2026  
**Untuk pertanyaan:** Hubungi administrator system

```

