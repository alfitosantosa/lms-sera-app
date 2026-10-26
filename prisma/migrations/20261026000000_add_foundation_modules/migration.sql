-- Modul opsional per yayasan. Default semua modul agar yayasan lama tidak
-- kehilangan fitur setelah migrasi.
ALTER TABLE "foundation"
  ADD COLUMN "modules" TEXT[] NOT NULL
  DEFAULT ARRAY['keuangan', 'absensi', 'pelanggaran', 'pembelajaran', 'tahfidz'];
