# PRD — LMS Satu Sekolah (Edisi Instalasi Mudah)

**Versi:** 1.0 (draft)
**Tanggal:** 25 Oktober 2026
**Status:** Usulan, belum diimplementasikan
**Basis kode:** repo `lms-sera-app` (commit saat PRD ini dibuat)
**Dokumen terkait:** `PRD.md` (versi multi-yayasan, tetap berlaku sebagai referensi fitur)

---

## 1. Ringkasan

Edisi ini mengubah LMS dari model **multi-yayasan → multi-cabang** menjadi **satu sekolah, satu instalasi**.
Tujuannya dua:

1. **Instalasi mudah** — sekolah bisa self-host dengan satu perintah, lima variabel environment wajib, tanpa RabbitMQ, Midtrans, WhatsApp, maupun Google OAuth.
2. **Pendaftaran tanpa yayasan** — pengguna mendaftar langsung ke sekolah; tidak ada input kode yayasan, tidak ada error `"Akun belum terhubung ke yayasan"`.

Seluruh modul fungsional (akademik, presensi, tahfidz, keuangan, pelanggaran, nilai/rapor, tugas, ujian, jurnal) **tidak dihapus**. Yang berubah adalah lapisan tenancy, alur registrasi, dan cara pasang.

---

## 2. Kondisi Saat Ini (temuan dari kode)

Fakta yang menjadi dasar PRD — bukan asumsi:

| # | Temuan | Bukti di repo |
|---|--------|----------------|
| 1 | Semua API ber-tenant memanggil `resolveFoundation()`; user tanpa `foundationId` langsung ditolak 403 `"Akun belum terhubung ke yayasan"`. | `lib/api/tenant.ts` |
| 2 | Halaman sign-up **tidak** meminta kode yayasan; akun dibuat tanpa `foundationId`, sehingga user baru tidak bisa memakai API sampai admin menautkannya. | `app/(frontend)/(auth)/auth/sign-up/page.tsx`, `lib/betterauth/auth.ts` |
| 3 | Pembuatan yayasan hanya lewat `POST /api/foundation`, yang menautkan yayasan ke user yang sedang login. Tidak ada wizard/skrip bootstrap admin pertama. | `app/(backend)/api/foundation/route.ts` |
| 4 | `Class.branchId` **wajib**; minimal satu baris `Branch` harus ada sebelum kelas bisa dibuat. `Subject.branchId` opsional. | `prisma/schema.prisma` |
| 5 | Google OAuth selalu didaftarkan; kredensialnya dibaca dengan `!` (non-null). Tanpa `GOOGLE_CLIENT_ID/SECRET`, konfigurasi auth tidak bersih. | `lib/betterauth/auth.ts` |
| 6 | Tidak ada `.env.example`, padahal README menyuruh `cp .env.example .env`. README juga masih memakai `npm` dan menyebut `DIRECT_URL` yang tidak dipakai kode. | root repo, `README.md` |
| 7 | Tidak ada seed Prisma. Tabel `roles`, `surah_quran`, `grade_scales`, `academic_years` kosong pada instalasi baru. | `prisma/` (tanpa `seed.ts`), `prisma.config.ts` (`seed` dikomentari) |
| 8 | `docker-compose.yml` hanya berisi `app`, `worker` (RabbitMQ), dan `docker-cleanup`. Tidak ada layanan PostgreSQL. `setup.sh` adalah skrip rebuild produksi manual, bukan installer. | `docker-compose.yml`, `setup.sh` |
| 9 | Integrasi dianggap wajib di env: Midtrans, Evolution API, RabbitMQ, file server. `NEXT_PUBLIC_MIDTRANS_SERVER_KEY` ada di env sisi klien (server key terekspos ke browser). | `.env` |
| 10 | Ada 13 migrasi; instalasi baru harus menjalankan seluruhnya sebelum aplikasi bisa dipakai. | `prisma/migrations/` |
| 11 | Salinan UI masih menyebut yayasan/cabang (landing FAQ, dialog foundation, halaman profil). | `components/landing/Faq.tsx`, `components/dialog/DialogEditFoundation.tsx`, `app/(frontend)/(dashboard)/dashboard/profile/page.tsx` |

---

## 3. Tujuan & Non-Tujuan

### Tujuan (terukur)

| ID | Tujuan | Ukuran keberhasilan |
|----|--------|---------------------|
| G1 | Instalasi baru selesai ≤ 10 menit di VPS 2 vCPU/2 GB | Dari `git clone` sampai admin bisa login |
| G2 | Hanya 5 env wajib | Sisanya opsional dan tidak memblokir startup |
| G3 | Registrasi tanpa yayasan | Sign-up berhasil lalu masuk alur persetujuan, tanpa 403 tenant |
| G4 | Integrasi opsional benar-benar opsional | Aplikasi lulus smoke test tanpa Midtrans/WhatsApp/RabbitMQ/Google |
| G5 | Tidak ada istilah "yayasan" di UI edisi ini | Copy UI menyebut "sekolah" |

### Non-tujuan

- Menghapus dukungan multi-yayasan dari skema database (cukup dinonaktifkan di lapisan aplikasi).
- Menambah modul baru (PPDB, e-learning, payroll, dan sejenisnya).
- Aplikasi mobile/Capacitor.
- Multi-sekolah dalam satu instalasi (dijual terpisah; lihat `PRD.md`).
- Migrasi otomatis data pelanggan lama (edisi ini untuk instalasi baru; jalur migrasi dicatat di §11).

---

## 4. Persona & Peran

Peran tetap memakai plugin `admin` Better Auth: `admin`, `teacher`, `student`, `parent`, `user` (default), ditambah peran domain `bendahara`.

| Peran | Kebutuhan utama di edisi ini |
|-------|------------------------------|
| Admin sekolah | Menyelesaikan setup awal, menyetujui pendaftar, mengelola master data |
| Bendahara | Tagihan, pembayaran manual/online (jika Midtrans aktif), kwitansi |
| Guru | Jadwal, presensi, nilai, tugas, tahfidz |
| Siswa | Jadwal, presensi, nilai, tagihan sendiri |
| Orang tua | Data anak, tagihan, pengumuman |
| Pendaftar baru | Mendaftar mandiri, menunggu persetujuan admin |

---

## 5. Alur Target

### 5.1 Instalasi (admin sistem)

```mermaid
flowchart TD
    A[git clone] --> B[bun run setup]
    B --> C{Env wajib lengkap?}
    C -- tidak --> C1[Isi .env dari .env.example<br/>DATABASE_URL, BETTER_AUTH_SECRET,<br/>BETTER_AUTH_URL, SCHOOL_NAME, ADMIN_EMAIL]
    C1 --> B
    C -- ya --> D[Start PostgreSQL<br/>docker compose up -d db]
    D --> E[prisma migrate deploy]
    E --> F[seed idempoten:<br/>sekolah, cabang utama, roles,<br/>tahun ajaran, skala nilai, 114 surah]
    F --> G[Buat admin pertama dari env<br/>+ password acak dicetak ke konsol]
    G --> H[bun run dev / docker compose up -d app]
    H --> I[Login admin → wizard profil sekolah]
```

`bun run setup` harus **idempoten**: dijalankan dua kali tidak menggandakan data dan tidak menimpa password admin yang sudah ada.

### 5.2 Pendaftaran (pengguna)

```mermaid
flowchart LR
    S[Sign-up: nama, email, kata sandi] --> U[Akun dibuat, role=user,<br/>status=pending, otomatis terhubung ke sekolah]
    U --> P[Halaman 'Menunggu persetujuan']
    P --> A{Admin menyetujui?}
    A -- ya --> R[Admin memilih peran<br/>guru/siswa/orang tua/bendahara]
    R --> D[Dashboard sesuai peran]
    A -- tidak --> X[Ditolak, akun dinonaktifkan]
```

Mode pendaftaran diatur env:

| `SIGNUP_MODE` | Perilaku |
|---------------|----------|
| `open` (default) | Siapa pun boleh daftar → antrean persetujuan |
| `invite` | Wajib kode undangan yang dibuat admin |
| `closed` | Hanya admin yang membuat akun |

---

## 6. Keputusan Desain

| ID | Keputusan | Alasan | Konsekuensi |
|----|-----------|--------|-------------|
| D1 | Tabel `Foundation` dipertahankan sebagai **profil sekolah tunggal** (satu baris). UI menyebutnya "Sekolah". | 34 model dan 13 migrasi mereferensikannya; drop = migrasi besar tanpa manfaat. | Tambah indeks unik singleton di DB: `CREATE UNIQUE INDEX foundation_singleton ON foundation ((true));` |
| D2 | `Branch` tetap ada, tetapi **satu baris otomatis** (`MAIN`) dibuat oleh seed. Menu "Cabang" disembunyikan; halaman menjadi bagian "Profil Sekolah". | `Class.branchId` NOT NULL, jadi baris cabang tidak bisa dihilangkan tanpa ubah skema. | Multi-cabang bisa diaktifkan lagi lewat flag `ENABLE_MULTI_BRANCH=true` tanpa migrasi. |
| D3 | Sign-up otomatis menautkan akun ke sekolah tunggal dengan `status=pending`, `role=user`. | Menghapus penyebab 403 tenant; tetap aman karena belum ada akses data. | Butuh halaman antrean persetujuan admin. |
| D4 | `resolveFoundation()` diganti `resolveSchool()` yang mengembalikan sekolah tunggal; parameter `foundationId` dari klien diabaikan. | Satu perubahan di lapisan bersama memperbaiki seluruh route API sekaligus (root cause, bukan per-route). | Route yang masih mengirim `foundationId` tetap jalan (diabaikan). Parameter dihapus bertahap. |
| D5 | Google OAuth, Midtrans, Evolution API, RabbitMQ, file server menjadi **opsional**. | Instalasi sekolah kecil tidak punya semuanya. | Provider/auth didaftarkan kondisional; UI menampilkan status "belum dikonfigurasi". |
| D6 | Bootstrap admin pertama lewat env + seed, bukan lewat UI "buat yayasan". | Saat ini tidak ada jalan membuat admin pertama selain `POST /api/foundation` atau edit DB manual. | Kredensial awal dicetak sekali ke konsol; wajib ganti setelah login. |
| D7 | Branding (nama, logo, favicon, nama sekolah) berasal dari env + baris `Foundation`. | Menghilangkan sisa merek lama di kode. | Tidak ada nama sekolah hardcoded di UI. |

---

## 7. Kebutuhan Fungsional

Prioritas: **P0** wajib untuk rilis, **P1** sebaiknya, **P2** opsional.

### 7.1 Instalasi & Setup

| ID | Kebutuhan | Prioritas | Kriteria terima |
|----|-----------|-----------|------------------|
| SETUP-1 | Tersedia `.env.example` dengan 5 variabel wajib dan semua variabel opsional (dikomentari). | P0 | `cp .env.example .env` + isi 5 nilai → server jalan |
| SETUP-2 | Skrip `bun run setup` melakukan: validasi env, tunggu DB siap, `prisma generate`, `prisma migrate deploy`, seed, buat admin pertama. | P0 | Sekali jalan pada DB kosong menghasilkan sistem siap login |
| SETUP-3 | `docker compose up -d` menyediakan PostgreSQL + app (+ worker hanya lewat profile). | P0 | Tanpa Postgres eksternal, aplikasi hidup dan `/api/health` 200 |
| SETUP-4 | Seed idempoten: sekolah, cabang `MAIN`, 5 peran Better Auth + peran domain `bendahara` beserta permission default, tahun ajaran aktif, skala nilai, 114 surah. | P0 | Dijalankan 2x: jumlah baris tidak berubah |
| SETUP-5 | Admin pertama dibuat dari `ADMIN_EMAIL` + `ADMIN_PASSWORD` (atau password acak yang dicetak). | P0 | Login admin berhasil; tidak ada endpoint "buat yayasan" yang perlu dipanggil |
| SETUP-6 | Wizard pasca-install 3 langkah: Profil Sekolah (nama, alamat, telepon, logo), Tahun Ajaran, Kelas pertama. Bisa dilewati. | P1 | Admin baru diarahkan ke wizard; setelah selesai dashboard normal |
| SETUP-7 | Perintah `bun run db:backup` membuat dump `pg_dump` bertimestamp ke `./backups`. | P2 | File dump dapat direstore ke DB kosong |

### 7.2 Registrasi & Persetujuan

| ID | Kebutuhan | Prioritas | Kriteria terima |
|----|-----------|-----------|------------------|
| AUTH-1 | Form sign-up tidak memuat field yayasan/kode yayasan. | P0 | Form hanya: nama, email, kata sandi, konfirmasi, foto opsional |
| AUTH-2 | Akun baru otomatis terhubung ke sekolah tunggal, `status=pending`, `role=user`. | P0 | Baris `user` + `user_data` punya `foundationId` sekolah |
| AUTH-3 | Pengguna `pending` diarahkan ke halaman "Menunggu persetujuan", tidak bisa membuka dashboard. | P0 | Akses `/dashboard/*` → halaman status, bukan 403 mentah |
| AUTH-4 | Admin punya antrean persetujuan (setujui/tolak + pilih peran) di Master → Pengguna. | P0 | Setujui → user bisa login ke dashboard sesuai peran |
| AUTH-5 | `SIGNUP_MODE` (`open`/`invite`/`closed`) berfungsi. | P1 | Mode `closed`: endpoint sign-up menolak dengan pesan Bahasa Indonesia |
| AUTH-6 | Google OAuth hanya muncul jika `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` diisi. | P0 | Tanpa env tersebut, tombol Google tidak tampil dan auth tidak error |
| AUTH-7 | Reset kata sandi lewat email hanya aktif bila SMTP dikonfigurasi; jika tidak, admin dapat mereset dari panel. | P2 | Tanpa SMTP, tidak ada tautan mati di UI |

### 7.3 Tenancy Tunggal

| ID | Kebutuhan | Prioritas | Kriteria terima |
|----|-----------|-----------|------------------|
| TEN-1 | `resolveSchool()` mengembalikan satu baris `Foundation`; tidak ada 403 "belum terhubung ke yayasan" untuk user yang sudah disetujui. | P0 | Semua route yang memakai resolver lama tetap 200 untuk admin |
| TEN-2 | Parameter `foundationId` dari klien diabaikan/diabaikan-aman (tidak bisa dipakai lintas tenant). | P0 | Mengirim `foundationId` acak tidak mengubah data yang dibaca |
| TEN-3 | UI tidak menampilkan pemilih yayasan/cabang. Copy memakai "Sekolah". | P0 | Tidak ada teks "yayasan" di navigasi/dialog/halaman profil |
| TEN-4 | `ENABLE_MULTI_BRANCH=false` menyembunyikan master Cabang; `true` memunculkannya kembali. | P1 | Toggle env mengubah menu tanpa perubahan kode |
| TEN-5 | Profil Sekolah dapat diedit admin: nama, alamat, telepon, logo, kepala sekolah. | P0 | Perubahan tersimpan dan tampil di kop kwitansi/rapor |

### 7.4 Integrasi Opsional

| ID | Kebutuhan | Prioritas | Kriteria terima |
|----|-----------|-----------|------------------|
| INT-1 | Midtrans nonaktif secara default; pembayaran manual tetap berfungsi penuh. | P0 | Tanpa kunci Midtrans, tagihan & kwitansi manual jalan; tombol online disabled dengan keterangan |
| INT-2 | Kunci server Midtrans hanya dibaca di server (bukan `NEXT_PUBLIC_*`). | P0 | Tidak ada server key di bundel klien (`grep` hasil build) |
| INT-3 | WhatsApp/RabbitMQ nonaktif secara default; worker hanya jalan di compose profile `worker`. | P0 | `docker compose up` tanpa profile tidak memulai worker; pengumuman in-app tetap jalan |
| INT-4 | File server opsional; unggah file memakai penyimpanan lokal bila `NEXT_PUBLIC_FILESERVER_URL` kosong. | P1 | Unggah logo/foto berhasil tanpa file server eksternal |

### 7.5 Branding & Data Awal

| ID | Kebutuhan | Prioritas | Kriteria terima |
|----|-----------|-----------|------------------|
| BRD-1 | Nama sekolah, logo, favicon, nama aplikasi dari env/DB — tidak ada merek lama di kode. | P0 | Cari `Santosatechid`/`Rahmaniyah` di `app/`, `components/`, `public/` → nol hasil yang tampil ke pengguna |
| BRD-2 | Seed 114 surah dari berkas statis `prisma/seed-data/surah.json`. | P0 | Tabel `surah_quran` berisi 114 baris setelah seed |
| BRD-3 | Seed skala nilai dan tipe penilaian default dapat diedit admin. | P1 | Halaman skala nilai menampilkan data awal |

---

## 8. Perubahan Teknis yang Diperlukan

Peta perubahan pada kode yang ada (bukan rencana membuat ulang aplikasi):

| Area | File | Perubahan |
|------|------|-----------|
| Skema | `prisma/schema.prisma` + migrasi baru | Indeks unik singleton `foundation`; `foundationCode` jadi opsional/tidak dipakai UI; kolom `status` user dipakai untuk `pending` |
| Seed | `prisma/seed.ts` (baru), `prisma/seed-data/surah.json` (baru), `prisma.config.ts` | Aktifkan `seed`; seed idempoten |
| Auth | `lib/betterauth/auth.ts` | Google kondisional; `databaseHooks.user.create` menautkan sekolah + `pending`; hormati `SIGNUP_MODE` |
| Tenant | `lib/api/tenant.ts` | `resolveSchool()`; resolver lama jadi alias tipis |
| API | `app/(backend)/api/foundation/route.ts` | `GET` profil sekolah, `PATCH` ubah profil; `POST` dihapus dari alur publik |
| API | `app/(backend)/api/admin/*` (baru) | Antrean persetujuan + set peran |
| UI auth | `app/(frontend)/(auth)/auth/sign-up/page.tsx`, halaman status | Alur pending; tombol Google kondisional |
| UI admin | `.../dashboard/admin/master/users/page.tsx` | Tab "Menunggu persetujuan" |
| UI profil | `components/dialog/DialogEditFoundation.tsx`, `.../dashboard/profile/page.tsx` | Copy "Profil Sekolah"; sembunyikan kode yayasan |
| Navigasi | `app/repository/menuGroupsSidebar.ts` | Sembunyikan Cabang bila `ENABLE_MULTI_BRANCH=false` |
| Copy | `components/landing/Faq.tsx`, landing pages | Ganti narasi yayasan → sekolah |
| Env | `.env.example` (baru), `.env` | 5 wajib + opsional |
| Deploy | `docker-compose.yml`, `Dockerfile`, `package.json` | Layanan `db`; app `depends_on: db healthy`; profile `worker`; skrip `setup`, `db:seed`, `db:backup` |
| Dokumentasi | `README.md` | Instalasi Bun + Docker, tanpa `DIRECT_URL`, tanpa `.env.local` ganda |

### Environment wajib (target)

| Variabel | Contoh | Catatan |
|----------|--------|---------|
| `DATABASE_URL` | `postgresql://lms:lms@localhost:5432/lms` | Satu-satunya koneksi DB (drop `DIRECT_URL`) |
| `BETTER_AUTH_SECRET` | 32+ karakter acak | `bun run setup` dapat membuatkannya |
| `BETTER_AUTH_URL` | `http://localhost:3000` atau URL publik | Wajib untuk cookie |
| `SCHOOL_NAME` | `SMP Islam Contoh` | Mengisi baris sekolah saat seed |
| `ADMIN_EMAIL` | `admin@sekolah.sch.id` | Bootstrap admin pertama |

Opsional (semua boleh kosong): `ADMIN_PASSWORD`, `SCHOOL_CODE`, `SCHOOL_ADDRESS`, `SCHOOL_PHONE`, `SCHOOL_LOGO_URL`, `SIGNUP_MODE`, `ENABLE_MULTI_BRANCH`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXT_PUBLIC_MIDTRANS_*` (client key saja), `MIDTRANS_SERVER_KEY`, `MIDTRANS_IS_PRODUCTION`, `NEXT_PUBLIC_EVO_*`, `RABBITMQ_URL`, `NEXT_PUBLIC_FILESERVER_URL`, `PORT`.

---

## 9. Kebutuhan Non-Fungsional

| ID | Kebutuhan | Target |
|----|-----------|--------|
| NFR-1 | Instalasi baru | ≤ 10 menit, ≤ 5 perintah manual |
| NFR-2 | Kebutuhan resource minimum | 2 vCPU, 2 GB RAM, 10 GB disk (tanpa worker) |
| NFR-3 | Startup tanpa integrasi | Tidak ada error/warning yang menggagalkan boot |
| NFR-4 | Keamanan | Server key tidak pernah di `NEXT_PUBLIC_*`; password admin awal wajib diganti; cookie `httpOnly` (bawaan Better Auth) |
| NFR-5 | Persetujuan pendaftar | Aksi teraudit di `audit_logs` (setujui/tolak/ubah peran) |
| NFR-6 | Bahasa | 100% copy UI dan pesan error dalam Bahasa Indonesia |
| NFR-7 | Idempotensi | `setup` dan `seed` aman dijalankan berulang |
| NFR-8 | Aksesibilitas dasar | Form sign-up & halaman status memakai label, fokus terlihat, error terbaca pembaca layar |

---

## 10. Kriteria Penerimaan (Uji Manual Wajib)

Semua langkah dijalankan pada **database kosong**.

1. `git clone` → `cp .env.example .env` → isi 5 variabel → `bun install` → `bun run setup` → `bun run dev`.
2. Login `ADMIN_EMAIL` berhasil; dashboard admin terbuka tanpa memanggil endpoint pembuatan yayasan.
3. Jalankan `bun run setup` kedua kali → jumlah baris `foundation`, `roles`, `surah_quran` tidak berubah.
4. Sign-up akun baru di `/auth/sign-up` → tidak ada field yayasan → diarahkan ke "Menunggu persetujuan".
5. User pending membuka `/dashboard` → halaman status, bukan 403.
6. Admin menyetujui + memberi peran `teacher` → user login melihat menu guru.
7. `GET /api/foundation` sebagai admin → 200 dengan satu baris sekolah; mengirim `?foundationId=xxx` tetap 200 dengan sekolah yang sama.
8. Matikan semua env integrasi (Midtrans/WhatsApp/RabbitMQ/Google) → aplikasi tetap bisa: buat kelas, jadwal, presensi, tagihan manual, kwitansi.
9. `grep -r "NEXT_PUBLIC_MIDTRANS_SERVER_KEY\|MIDTRANS_SERVER_KEY"` pada output build → tidak ada nilai rahasia di bundel klien.
10. `bunx tsc --noEmit` dan `bun run build` lulus; `GET /api/health` → 200.
11. Tidak ada teks "yayasan" atau merek lama pada halaman publik, login, dashboard, dan dialog profil.

---

## 11. Migrasi dari Instalasi Multi-Yayasan

Untuk pelanggan lama (opsional, tidak memblokir rilis edisi ini):

1. Tetapkan sekolah aktif = `foundation` dengan jumlah user terbanyak (atau pilihan admin).
2. Nonaktifkan baris foundation lain (`isActive=false` — perlu kolom baru) **atau** ekspor dulu.
3. Jalankan backfill: seluruh `user.foundationId` / `user_data.foundationId` kosong diarahkan ke sekolah aktif.
4. Hapus parameter `foundationId` dari pemanggilan hook klien secara bertahap.

Catatan: indeks singleton (§6 D1) hanya cocok untuk instalasi satu sekolah. Untuk database multi-yayasan yang dimigrasikan, indeks dipasang **setelah** data dibersihkan, atau diganti constraint `isActive` parsial.

---

## 12. Risiko

| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| Seed surah/role menimpa data sekolah yang sudah berjalan | Kehilangan konfigurasi | Seed hanya `create` bila belum ada; tidak ada `update` pada data non-seed |
| `resolveSchool()` melonggarkan isolasi tenant | Data bocor antar sekolah (pada instalasi multi-yayasan) | Edisi ini hanya untuk satu sekolah; rilis multi-yayasan tetap memakai resolver lama lewat flag `MULTI_TENANT=true` |
| Pendaftaran terbuka disalahgunakan | Akun spam | Default `open` + persetujuan admin + rate limit endpoint sign-up; opsi `invite`/`closed` |
| Password admin awal tercetak di log | Akses tidak sah | Cetak sekali, wajib ganti saat login pertama, tidak disimpan di log file |
| Perubahan besar pada `lib/auth.ts` merusak sesi | Semua pengguna ter-logout | Uji login/sesi di smoke test; plugin `nextCookies()` tetap terakhir |
| Integrasi opsional memunculkan error runtime | Fitur gagal tanpa pesan jelas | Feature flag + state "belum dikonfigurasi" di UI, bukan exception |

---

## 13. Rencana Rilis (usulan)

| Fase | Isi | Hasil |
|------|-----|-------|
| 1. Fondasi | `.env.example`, `bun run setup`, seed idempoten, compose `db`, bootstrap admin | Instalasi satu perintah berhasil |
| 2. Tenancy tunggal | `resolveSchool()`, singleton index, copy "Sekolah", sembunyikan cabang | Tidak ada istilah yayasan di UI |
| 3. Registrasi | Auto-link + `pending`, halaman status, antrean persetujuan, `SIGNUP_MODE` | Sign-up tanpa yayasan end-to-end |
| 4. Integrasi opsional | Google kondisional, Midtrans server-side, worker profile, fallback file lokal | Smoke test tanpa integrasi lulus |
| 5. Polish | Wizard pasca-install, backup, dokumentasi | Rilis edisi satu sekolah |

---

## 14. Pertanyaan Terbuka

1. Apakah pendaftaran publik default `open` atau `invite`? PRD ini memilih `open` + persetujuan; ubah jika sekolah menginginkan tertutup.
2. Apakah `bendahara` perlu bisa melihat data guru, atau hanya keuangan? (Belum diputuskan di kode.)
3. Sumber data 114 surah: berkas statis yang disertakan repo, atau impor manual admin?
4. Apakah edisi ini tetap mempertahankan halaman landing pemasaran, atau dipangkas menjadi halaman login saja?
5. Format kop kwitansi/rapor: apakah memakai nama sekolah tunggal + tanda tangan kepala sekolah (kolom `branch.signatureUrl` sudah ada)?
