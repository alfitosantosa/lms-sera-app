-- Unik global diubah menjadi unik per-tenant (per yayasan / per jurusan)
-- agar yayasan kedua tidak bentrok membuat kode/tahun/role yang sama.

-- DropIndex
DROP INDEX "academic_years_year_key";

-- DropIndex
DROP INDEX "branchs_code_key";

-- DropIndex
DROP INDEX "roles_name_key";

-- DropIndex
DROP INDEX "subjects_code_key";

-- Backfill terkunci: user.foundationId diisi dari user_data-nya sendiri (aman multi-yayasan)
UPDATE "user" u
SET "foundationId" = ud."foundationId"
FROM user_data ud
WHERE ud."userId" = u.id
  AND u."foundationId" IS NULL
  AND ud."foundationId" IS NOT NULL;

-- Backfill warisan single-tenant: hanya jalan bila database hanya punya SATU yayasan.
-- Database dengan banyak yayasan tidak diubah (tidak ada cara aman menebak pemiliknya).
UPDATE "branchs" SET "foundationId" = (SELECT id FROM "foundation" LIMIT 1)
WHERE "foundationId" IS NULL AND (SELECT count(*) FROM "foundation") = 1;

UPDATE "academic_years" SET "foundationId" = (SELECT id FROM "foundation" LIMIT 1)
WHERE "foundationId" IS NULL AND (SELECT count(*) FROM "foundation") = 1;

UPDATE "roles" SET "foundationId" = (SELECT id FROM "foundation" LIMIT 1)
WHERE "foundationId" IS NULL AND (SELECT count(*) FROM "foundation") = 1;

UPDATE user_data SET "foundationId" = (SELECT id FROM "foundation" LIMIT 1)
WHERE "foundationId" IS NULL AND (SELECT count(*) FROM "foundation") = 1;

-- CreateIndex
CREATE UNIQUE INDEX "academic_years_foundationId_year_key" ON "academic_years"("foundationId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "foundation_foundationCode_key" ON "foundation"("foundationCode");

-- CreateIndex
CREATE UNIQUE INDEX "branchs_foundationId_code_key" ON "branchs"("foundationId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "roles_foundationId_name_key" ON "roles"("foundationId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_branchId_code_key" ON "subjects"("branchId", "code");
