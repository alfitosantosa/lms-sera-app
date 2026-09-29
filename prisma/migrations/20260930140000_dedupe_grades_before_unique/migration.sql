-- Dedupe baris `grades` yang akan bentrok dengan unique
-- (studentId, scheduleId, gradeTypeId, title) sebelum indeks uniknya dipastikan
-- ada. Tanpa langkah ini, CREATE UNIQUE INDEX bisa membatalkan migrasi di
-- lingkungan yang tabelnya sudah berisi pasangan duplikat (tabel sebelumnya
-- tidak punya constraint apa pun).
-- Baris dengan `title` NULL tidak pernah bentrok (NULL bersifat distinct di
-- Postgres), jadi hanya baris ber-`title` terisi yang di-dedupe.
DELETE FROM "grades" a
USING "grades" b
WHERE a.ctid < b.ctid
  AND a."studentId" = b."studentId"
  AND a."scheduleId" = b."scheduleId"
  AND a."gradeTypeId" = b."gradeTypeId"
  AND a.title = b.title
  AND a.title IS NOT NULL
  AND b.title IS NOT NULL;

-- Indeks unik sudah dibuat pada 20260930120000_add_assignment_development_links;
-- dibuat ulang di sini agar dedupe selalu berjalan lebih dulu pada urutan
-- perubahan yang sama untuk semua lingkungan.
DROP INDEX IF EXISTS "grades_studentId_scheduleId_gradeTypeId_title_key";
CREATE UNIQUE INDEX "grades_studentId_scheduleId_gradeTypeId_title_key" ON "grades"("studentId", "scheduleId", "gradeTypeId", "title");
