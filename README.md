# 🎓 LMS PLATFORM FROM SANTOSATECHID

[![Next.js](https://img.shields.io/badge/Next.js-16.2.7-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.7-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.3.0-38bdf8)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.8.0-2D3748)](https://www.prisma.io/)

Sistem manajemen sekolah berbasis web yang komprehensif untuk lms-platform-santosatechid. Dibangun dengan Next.js 16, React 19, dan TypeScript untuk memberikan pengalaman modern, cepat, dan scalable.

---

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Prasyarat](#-prasyarat)
- [Instalasi](#-instalasi)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [Struktur Project](#-struktur-project)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Authentication](#-authentication)
- [Development & Production](#-development--production-optimization)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## ✨ Fitur Utama

### 🎯 Manajemen Akademik

- **Tahun Akademik**: Kelola tahun ajaran dan periode akademik
- **Jurusan**: Manajemen jurusan dan program studi
- **Kelas**: Organisasi kelas dan pembagian siswa
- **Mata Pelajaran**: Daftar dan manajemen mata pelajaran

### 👥 Manajemen Pengguna

- **Siswa**: Profil siswa, data lengkap, dan tracking progress
- **Guru**: Data guru, jadwal mengajar, dan performa
- **Admin**: Multi-role access control dan permissions
- **Role-Based Access Control (RBAC)**: Fine-grained permissions

### 📊 Sistem Kehadiran

- **Absensi Siswa**: Tracking kehadiran harian siswa
- **Absensi Guru**: Monitoring kehadiran staff pengajar
- **Rekap Kehadiran**: Laporan dan analytics kehadiran
- **Schedule Integration**: Terintegrasi dengan jadwal pelajaran

### 💰 Sistem Pembayaran

- **Billing Management**: Invoice dan tagihan otomatis
- **Payment Items**: Daftar item pembayaran (SPP, biaya lainnya)
- **Payment Types**: Kategori pembayaran yang fleksibel
- **Transaction History**: Riwayat transaksi lengkap
- **Midtrans Integration**: Payment gateway terintegrasi
- **Receipt Generation**: Generate bukti pembayaran PDF
- **Account Bank**: Multi-bank account management

### 📅 Manajemen Jadwal

- **Jadwal Reguler**: Penjadwalan kelas reguler
- **Jadwal Khusus**: Special events dan kegiatan khusus
- **Kalender**: View kalender akademik interaktif
- **Conflict Detection**: Deteksi bentrok jadwal otomatis

### 📖 Program Tahfidz

- **Tahfidz Groups**: Manajemen kelompok tahfidz
- **Progress Tracking**: Tracking hafalan dan progress
- **Records Management**: Catatan setoran hafalan
- **Performance Reports**: Laporan progress individual

### ⚠️ Sistem Pelanggaran

- **Violation Types**: Kategori jenis pelanggaran
- **Violation Records**: Pencatatan pelanggaran siswa
- **Point System**: Sistem poin pelanggaran
- **Reporting**: Laporan pelanggaran per siswa/kelas

### 📱 Integrasi WhatsApp

- **WhatsApp Bot**: Notifikasi otomatis via WhatsApp
- **Bulk Messaging**: Kirim pesan massal ke orang tua/siswa
- **Attendance Alerts**: Notifikasi absensi real-time
- **Payment Reminders**: Reminder pembayaran otomatis

### 📈 Reporting & Analytics

- **Dashboard Analytics**: Real-time metrics dan KPIs
- **Custom Reports**: Generate laporan custom
- **Data Export**: Export data ke Excel/PDF
- **Visual Charts**: Grafik dan visualisasi data

### 🔐 Keamanan & Authentication

- **Better Auth**: Modern authentication system
- **Session Management**: Secure session handling
- **Password Security**: Bcrypt hashing
- **Role-Based Authorization**: Granular access control

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: [Next.js 16.2.7](https://nextjs.org/) (App Router + Turbopack)
- **UI Library**: [React 19.2.7](https://reactjs.org/)
- **Language**: [TypeScript 5.9.3](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4.3.0](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: [Jotai](https://jotai.org/)
- **Forms**: [React Hook Form](https://react-hook-form.com/)
- **Data Fetching**: [TanStack Query](https://tanstack.com/query)
- **Tables**: [TanStack Table](https://tanstack.com/table)
- **Animations**: [Motion](https://motion.dev/)
- **Date Handling**: [date-fns](https://date-fns.org/)
- **PDF Generation**: [@react-pdf/renderer](https://react-pdf.org/)

### Backend

- **Runtime**: Node.js v26.0.0
- **API**: Next.js API Routes (App Router)
- **Authentication**: [Better Auth](https://www.better-auth.com/)
- **Database ORM**: [Prisma 7.8.0](https://www.prisma.io/)
- **Database**: PostgreSQL
- **Validation**: [Zod](https://zod.dev/)
- **API Documentation**: [Swagger](https://swagger.io/)

### Payment & Integration

- **Payment Gateway**: [Midtrans](https://midtrans.com/)
- **WhatsApp Bot**: Custom WhatsApp integration

### Development Tools

- **Package Manager**: npm
- **Code Quality**: Prettier, ESLint
- **Git Hooks**: Husky
- **Type Checking**: TypeScript strict mode

---

## 📦 Prasyarat

Sebelum memulai, pastikan Anda telah menginstall:

- **Node.js**: v20.x atau lebih baru (Recommended: v26.0.0)
- **npm**: v10.x atau lebih baru
- **PostgreSQL**: v14.x atau lebih baru
- **Git**: Latest version

---

## 🚀 Instalasi

### 1. Clone Repository

```bash
git clone <repository-url>
cd pos-`${process.env.NEXT_PUBLIC_CLIENT_NAME?.toUpperCase()}`-new-2
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Copy file `.env.example` ke `.env` dan `.env.local`:

```bash
cp .env.example .env
cp .env.example .env.local
```

Edit file `.env` dan `.env.local` dengan konfigurasi Anda (lihat bagian [Environment Variables](#-environment-variables)).

### 4. Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed database dengan data awal
npx prisma db seed
```

### 5. Run Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di [http://localhost:3000](http://localhost:3000)

---

## 🔐 Environment Variables

Buat file `.env` dan `.env.local` dengan variabel berikut:

### Database

```env
DATABASE_URL="postgresql://user:password@localhost:5432/smk_db"
DIRECT_URL="postgresql://user:password@localhost:5432/smk_db"
```

### Authentication (Better Auth)

```env
BETTER_AUTH_SECRET="your-secret-key-min-32-characters"
BETTER_AUTH_URL="http://localhost:3000"
```

### Midtrans Payment Gateway

```env
MIDTRANS_SERVER_KEY="your-midtrans-server-key"
MIDTRANS_CLIENT_KEY="your-midtrans-client-key"
MIDTRANS_IS_PRODUCTION="false"
```

### WhatsApp Bot (Optional)

```env
WHATSAPP_API_URL="your-whatsapp-api-url"
WHATSAPP_API_KEY="your-whatsapp-api-key"
```

### Next.js Configuration

```env
NODE_ENV="development"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### Development-Specific (`.env.local` only)

```env
WATCHPACK_POLLING=false
FAST_REFRESH=true
```

⚠️ **Penting**:

- File `.env.local` **TIDAK** di-commit ke Git
- Gunakan `.env.example` sebagai template
- Jangan share credentials di public repository

---

## 📜 Available Scripts

### Development

```bash
# Start development server dengan Turbopack (Recommended)
npm run dev

# Start dengan Hot Module Replacement optimized
npm run dev:hmr

# Start dengan Fast Refresh enabled
npm run dev:fast

# Clean cache dan start fresh
npm run dev:clean
```

### Production

```bash
# Build untuk production (dengan suppressed warnings)
npm run build

# Start production server
npm start
```

### Code Quality

```bash
# Run ESLint
npm run lint

# Format code dengan Prettier
npm run format
```

### Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Open Prisma Studio (Database GUI)
npx prisma studio

# Reset database (WARNING: menghapus semua data)
npx prisma migrate reset
```

---

## 📁 Struktur Project

```
pos-rahmany-new-2/
├── app/                          # Next.js App Router
│   ├── (action)/                 # Server actions
│   ├── (backend)/                # Backend API routes
│   │   └── api/                  # API endpoints
│   │       ├── academicyear/     # Academic year management
│   │       ├── accountbank/      # Bank account APIs
│   │       ├── attendance/       # Attendance system
│   │       ├── auth/             # Authentication
│   │       ├── betterauth/       # Better Auth integration
│   │       ├── botwa/            # WhatsApp bot
│   │       ├── class/            # Class management
│   │       ├── docs/             # API documentation (Swagger)
│   │       ├── health/           # Health check endpoint
│   │       ├── major/            # Major/Jurusan
│   │       ├── midtrans/         # Midtrans payment
│   │       ├── payment/          # Payment system
│   │       ├── paymenttype/      # Payment types
│   │       ├── roles/            # Role management
│   │       ├── schedules/        # Schedule management
│   │       ├── students/         # Student management
│   │       ├── subjects/         # Subject management
│   │       ├── tahfidzgroup/     # Tahfidz groups
│   │       ├── tahfidzrecord/    # Tahfidz records
│   │       ├── teachers/         # Teacher management
│   │       ├── typeviolations/   # Violation types
│   │       └── violations/       # Violation records
│   ├── (frontend)/               # Frontend pages
│   │   ├── dashboard/            # Dashboard pages
│   │   │   ├── academicyear/    # Academic year UI
│   │   │   ├── attendance/      # Attendance UI
│   │   │   ├── bendahara/       # Treasurer dashboard
│   │   │   ├── billing/         # Billing management
│   │   │   ├── botwa/           # WhatsApp bot UI
│   │   │   ├── calender/        # Calendar view
│   │   │   ├── classes/         # Class management UI
│   │   │   ├── majors/          # Major management UI
│   │   │   ├── parent/          # Parent portal
│   │   │   ├── payments/        # Payment UI
│   │   │   ├── profile/         # User profile
│   │   │   ├── recapattendance/ # Attendance recap
│   │   │   ├── reports/         # Reports & analytics
│   │   │   ├── roles/           # Role management UI
│   │   │   ├── schedules/       # Schedule UI
│   │   │   ├── student/         # Student portal
│   │   │   ├── subjects/        # Subject UI
│   │   │   ├── tahfidzrecord/   # Tahfidz UI
│   │   │   ├── teacher/         # Teacher portal
│   │   │   ├── upload/          # Bulk upload UI
│   │   │   └── violations/      # Violations UI
│   │   └── docs/                # API documentation page
│   ├── (hooks)/                  # Custom React hooks
│   ├── auth/                     # Auth pages (login/register)
│   ├── repository/               # Data access layer
│   ├── types/                    # TypeScript type definitions
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/                   # Reusable React components
├── lib/                          # Utility functions & helpers
│   └── swagger-paths.ts          # Swagger API documentation paths
├── prisma/                       # Database schema & migrations
│   ├── schema.prisma             # Prisma schema definition
│   └── generated/                # Generated Prisma Client
├── public/                       # Static assets
├── docs/                         # Project documentation
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies & scripts
```

---

## 📚 API Documentation

API menggunakan **Swagger/OpenAPI** untuk dokumentasi interaktif.

### Mengakses Dokumentasi API

Setelah server berjalan, akses dokumentasi di:

```
http://localhost:3000/docs
```

Atau raw OpenAPI spec di:

```
http://localhost:3000/api/docs
```

### Endpoint Utama

| Kategori        | Endpoint                 | Deskripsi                |
| --------------- | ------------------------ | ------------------------ |
| **Academic**    | `/api/academicyear`      | Manajemen tahun akademik |
| **Academic**    | `/api/major`             | Manajemen jurusan        |
| **Academic**    | `/api/class`             | Manajemen kelas          |
| **Academic**    | `/api/subjects`          | Manajemen mata pelajaran |
| **Users**       | `/api/students`          | Manajemen siswa          |
| **Users**       | `/api/teachers`          | Manajemen guru           |
| **Users**       | `/api/roles`             | Manajemen role           |
| **Auth**        | `/api/auth/[...all]`     | Better Auth endpoints    |
| **Auth**        | `/api/betterauth/users`  | User management          |
| **Attendance**  | `/api/attendance`        | Absensi siswa            |
| **Attendance**  | `/api/teacherattendance` | Absensi guru             |
| **Payment**     | `/api/payment`           | Transaksi pembayaran     |
| **Payment**     | `/api/paymenttype`       | Tipe pembayaran          |
| **Payment**     | `/api/midtrans`          | Midtrans integration     |
| **Payment**     | `/api/accountbank`       | Rekening bank            |
| **Schedule**    | `/api/schedules`         | Jadwal pelajaran         |
| **Schedule**    | `/api/specialschedule`   | Jadwal khusus            |
| **Tahfidz**     | `/api/tahfidzgroup`      | Kelompok tahfidz         |
| **Tahfidz**     | `/api/tahfidzrecord`     | Catatan hafalan          |
| **Violations**  | `/api/violations`        | Pelanggaran siswa        |
| **Violations**  | `/api/typeviolations`    | Tipe pelanggaran         |
| **Integration** | `/api/botwa`             | WhatsApp bot             |
| **System**      | `/api/health`            | Health check             |

### Contoh Request

```bash
# Health check
curl http://localhost:3000/api/health

# Get all students (requires authentication)
curl http://localhost:3000/api/students \
  -H "Authorization: Bearer <your-token>"
```

---

## 🗄️ Database Schema

Database menggunakan **PostgreSQL** dengan **Prisma ORM**.

### Core Models

#### User & Authentication

- **User**: Data user utama (id, name, email, role, banned status)
- **Session**: Manajemen sesi login
- **Account**: Provider account (untuk OAuth)
- **UserData**: Data tambahan user (profile lengkap)

#### Academic Models

- **AcademicYear**: Tahun ajaran
- **Major**: Jurusan/program studi
- **Class**: Kelas
- **Subject**: Mata pelajaran

#### Attendance Models

- **Attendance**: Absensi siswa
- **TeacherAttendance**: Absensi guru
- **Schedule**: Jadwal pelajaran

#### Payment Models

- **Payment**: Transaksi pembayaran
- **PaymentItem**: Item pembayaran
- **PaymentType**: Tipe pembayaran
- **AccountBank**: Rekening bank

#### Tahfidz Models

- **TahfidzGroup**: Kelompok tahfidz
- **TahfidzRecord**: Catatan setoran hafalan

#### Violation Models

- **Violation**: Pelanggaran siswa
- **TypeViolation**: Jenis pelanggaran

### Prisma Configuration

```prisma
generator client {
  provider   = "prisma-client"
  output     = "./generated"
  engineType = "client"
  runtime    = "bun"
}

datasource db {
  provider = "postgresql"
}
```

### Database Commands

```bash
# Generate Prisma Client setelah perubahan schema
npx prisma generate

# Buat migration baru
npx prisma migrate dev --name <migration-name>

# Apply migrations di production
npx prisma migrate deploy

# Lihat database di GUI
npx prisma studio
```

---

## 🔒 Authentication

Aplikasi menggunakan **Better Auth** untuk sistem autentikasi yang modern dan aman.

### Fitur Authentication

- ✅ Email & Password authentication
- ✅ Session management dengan secure cookies
- ✅ Role-based access control (RBAC)
- ✅ User impersonation (admin feature)
- ✅ Ban/unban users
- ✅ Email verification

### Roles

- **admin**: Full access ke semua fitur
- **teacher**: Akses ke fitur guru (absensi, nilai, jadwal)
- **student**: Akses portal siswa (jadwal, pembayaran, absensi)
- **parent**: Akses portal orang tua (monitoring anak)
- **bendahara**: Akses fitur keuangan/pembayaran
- **user**: Default role dengan akses terbatas

### Protected Routes

Routes di bawah `/dashboard` memerlukan autentikasi. Middleware akan redirect ke halaman login jika belum terautentikasi.

---

## ⚡ Development & Production Optimization

### **Development Environment** (`NODE_ENV=development`)

#### Optimasi di Development:

- **Zero Cache**: Semua response di-set ke `no-store, no-cache, must-revalidate, max-age=0`
- **Fast Refresh**: Update komponen instant tanpa reload halaman penuh
- **Disabled ETags**: Skip cache validation untuk build lebih cepat
- **No Compression**: Skip gzip compression untuk dev build lebih cepat
- **HMR Enabled**: Server Components cache disabled untuk instant updates

#### Scripts Development:

```bash
npm run dev          # Start dengan Turbopack (default, recommended)
npm run dev:hmr      # Alternative dengan HMR
npm run dev:fast     # Dengan Fast Refresh optimized
npm run dev:clean    # Clean cache dan start fresh
```

### **Production Environment** (`NODE_ENV=production`)

#### Optimasi di Production:

- **Aggressive Caching**: 1-year immutable cache untuk static assets
- **Tree-Shaking**: Optimized package imports hilangkan unused code
- **Compression**: Gzip compression enabled untuk response lebih kecil
- **Console Removal**: Semua `console.log()` stripped dari bundles
- **ETags**: Cache validation enabled untuk smart invalidation
- **Security Headers**: Reduced response size dengan no `X-Powered-By`

#### Caching Strategy:

```
Static Assets (SVG, JPG, PNG, etc):  1 year (immutable)
/_next/static/*:                      1 year (immutable)
/api/*:                               no-store (always fresh)
HTML Pages:                           1 hour dengan s-maxage
```

#### Scripts Production:

```bash
npm run build   # Build untuk production (NODE_NO_WARNINGS=1)
npm start       # Start production server
```

### Performance Comparison

| Feature     | Development     | Production            |
| ----------- | --------------- | --------------------- |
| Cache       | Disabled        | Aggressive (1 year)   |
| Compression | ❌ No           | ✅ Yes (Gzip)         |
| Console.log | ✅ Kept         | ❌ Removed            |
| ETags       | ❌ Disabled     | ✅ Enabled            |
| HMR         | ✅ Fast Refresh | ❌ N/A                |
| Build Time  | 🚀 Fast         | 🔨 Slower (optimized) |
| Bundle Size | Larger          | 📉 Minimal            |

### Troubleshooting

**Problem**: Changes tidak terlihat di dev

```bash
npm run dev:clean  # Clean cache dan restart
```

**Problem**: Slow hot reload

```bash
# Pastikan .env.local punya WATCHPACK_POLLING=false
npm run dev:fast
```

**Problem**: Production lambat

```bash
npm run build
npm start
# Check cache headers di DevTools Network tab
```

---

## 🐳 Deployment

### Docker Deployment

Aplikasi sudah dikonfigurasi untuk Docker dengan output `standalone`.

#### Build Docker Image:

```bash
docker build -t lms-platform-santosatechid .
```

#### Run Docker Container:

```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e BETTER_AUTH_SECRET="..." \
  lms-platform-santosatechid
```

### Environment for Production

Pastikan environment variables berikut di-set sebelum deploy:

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=<min 32 chars>
BETTER_AUTH_URL=https://yourdomain.com
MIDTRANS_SERVER_KEY=...
MIDTRANS_CLIENT_KEY=...
MIDTRANS_IS_PRODUCTION=true
```

### Deployment Checklist

- [ ] Update `.env` dengan production values
- [ ] Run `npm run build` - verify build successful
- [ ] Run `npm start` - test production locally
- [ ] Check cache headers di DevTools
- [ ] Test authentication flow
- [ ] Test payment gateway (Midtrans)
- [ ] Test API documentation endpoint
- [ ] Verify database migrations applied
- [ ] Set up monitoring/logging
- [ ] Configure backups untuk PostgreSQL

---

## 🤝 Contributing

Kami menerima kontribusi dari developer mana pun! Silakan follow guide di bawah:

### Development Workflow

1. **Fork & Clone**

```bash
git clone https://github.com/yourusername/pos-rahmany-new-2.git
cd pos-rahmany-new-2
npm install
```

2. **Create Feature Branch**

```bash
git checkout -b feature/your-feature-name
```

3. **Make Changes**

- Follow existing code style
- Pastikan TypeScript types lengkap
- Add comments untuk complex logic
- Update related tests

4. **Run Quality Checks**

```bash
npm run lint           # ESLint check
npm run format         # Format dengan Prettier
```

5. **Commit & Push**

```bash
git add .
git commit -m "feat: add new feature"
git push origin feature/your-feature-name
```

6. **Create Pull Request**

- Clear description of changes
- Reference related issues
- Include screenshots untuk UI changes

### Code Style

- **TypeScript**: Strict mode, full types required
- **Formatting**: Prettier configured
- **Imports**: Organized dengan absolute paths
- **Comments**: Clear dan meaningful
- **Naming**: camelCase untuk variables, PascalCase untuk components

### Commit Message Format

```
<type>: <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example:

```
feat: add payment receipt PDF generation

Implement PDF generation untuk payment receipts
Integrate dengan @react-pdf/renderer
Add receipt template design

Closes #123
```

---

## 📄 License

This project is proprietary software developed for lms-platform-santosatechid.

© 2024-2026 lms-platform-santosatechid. All rights reserved.

---

## 📞 Contact & Support

### Project Information

- **Project Name**: lms-platform-santosatechid - School Management System
- **Version**: 0.4.0
- **Last Updated**: June 2026
- **Next.js Version**: 16.2.7

### Technical Stack Versions

- **React**: 19.2.7
- **TypeScript**: 5.9.3
- **Tailwind CSS**: 4.3.0
- **Prisma**: 7.8.0
- **Node.js**: v26.0.0

### Support

Untuk pertanyaan teknis atau support, silakan hubungi tim development:

- Email: support@{COMPOSE_PROJECT_NAME}.sch.id
- GitHub Issues: [Report a bug](https://github.com/yourusername/pos-rahmany-new-2/issues)

---

## 🎯 Roadmap

### Upcoming Features

- [ ] Mobile App (React Native)
- [ ] E-learning Integration
- [ ] Advanced Analytics Dashboard
- [ ] Parent Mobile App
- [ ] WhatsApp Bot Enhancement
- [ ] Automated Report Cards
- [ ] Student Performance Prediction (AI)
- [ ] Multi-language Support (Bahasa & English)

### Recent Updates (v0.4.0)

- ✅ Next.js 16 upgrade dengan Turbopack
- ✅ React 19 migration
- ✅ Tailwind CSS 4 upgrade
- ✅ API Documentation dengan Swagger
- ✅ Payment Receipt PDF Generation
- ✅ Security headers optimization
- ✅ Build performance improvements
- ✅ Node.js v26 compatibility

---

## 🙏 Acknowledgments

Special thanks to:

- **Next.js Team** - Amazing framework
- **Vercel** - Deployment platform
- **Prisma** - Excellent ORM
- **Radix UI** - Accessible components
- **Tailwind CSS** - Utility-first CSS
- **Better Auth** - Modern authentication
- **Midtrans** - Payment gateway

---

## 📊 Project Stats

![GitHub last commit](https://img.shields.io/github/last-commit/yourusername/pos-rahmany-new-2)
![GitHub issues](https://img.shields.io/github/issues/yourusername/pos-rahmany-new-2)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/pos-rahmany-new-2)

---

## 🔗 Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Midtrans Documentation](https://docs.midtrans.com)

---

<div align="center">

**Built with ❤️ for lms-platform-santosatechid**

🎓 Empowering Education Through Technology 🎓

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://www.prisma.io/)

---

**[⬆ Back to Top](#-lms-platform-santosatechid---school-management-system)**

</div>
