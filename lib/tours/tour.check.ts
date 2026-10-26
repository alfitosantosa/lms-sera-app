/**
 * Self-check untuk logika murni tur onboarding.
 *
 * Jalankan: `bun run lib/tours/tour.check.ts`
 *
 * Sengaja tanpa framework: repo ini belum punya test runner, dan `bun:test` butuh
 * @types/bun (belum terpasang) yang membuat `tsc --noEmit` gagal.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import type { Tour } from "nextstepjs";

import { getRoleMenuKey } from "../ui/roleKey";
import {
  FIELD_SELECTOR,
  SELECTORS,
  TOUR_ATTR,
  TOUR_CREATE,
  TOUR_DIALOG_VALUE,
  TOUR_FIELD_VALUE,
  TOUR_HEADER,
  type TourDialogKey,
  type TourFieldKey,
} from "./selectors";
import { isTourKey, storageKey, tourKeyForMenuKey } from "./tourModel";
import {
  ALL_TOUR_ROUTES,
  buildTours,
  TOUR_ROUTES,
  type DialogStep,
} from "./tours";

// role -> menu key: perilaku hasil ekstraksi dari appSidebar, tidak boleh berubah.
assert.equal(getRoleMenuKey("Admin Yayasan"), "admin");
assert.equal(getRoleMenuKey("admin school"), "schooladministrator");
assert.equal(getRoleMenuKey("Admin Yayasan", "br_1"), "schooladministrator");
assert.equal(getRoleMenuKey("Admin Yayasan", "all"), "admin");
assert.equal(getRoleMenuKey("bendahara"), "treasurer");
assert.equal(getRoleMenuKey("Treasurer"), "treasurer");
assert.equal(getRoleMenuKey("Guru"), "teacher");
assert.equal(getRoleMenuKey("Kepala Sekolah"), "teacher");
assert.equal(getRoleMenuKey("Siswa"), "student");
assert.equal(getRoleMenuKey("Orang Tua"), "parent");
assert.equal(getRoleMenuKey("Tanpa Role"), "null");

// menu key -> tur
assert.equal(tourKeyForMenuKey("admin"), "admin");
assert.equal(tourKeyForMenuKey("schooladministrator"), "admin");
assert.equal(tourKeyForMenuKey("treasurer"), "treasurer");
assert.equal(tourKeyForMenuKey("teacher"), "teacher");
assert.equal(tourKeyForMenuKey("student"), "student");
assert.equal(tourKeyForMenuKey("parent"), "parent");
assert.equal(tourKeyForMenuKey("null"), null);
assert.equal(tourKeyForMenuKey(""), null);

// nama tur yang datang dari callback nextstepjs hanya diterima kalau memang kunci kita
assert.equal(isTourKey("admin"), true);
assert.equal(isTourKey("adminn"), false);
assert.equal(isTourKey(""), false);

// bentuk kunci penyimpanan: per user, per tur, berversi
assert.equal(storageKey("u1", "admin"), "lms.tour.v1.u1.admin");
assert.equal(storageKey("u2", "parent"), "lms.tour.v1.u2.parent");

// `data-tour` di header dipasang lewat konstanta ini; pastikan tidak tertukar.
assert.equal(SELECTORS.header, `[${TOUR_ATTR}="${TOUR_HEADER}"]`);
assert.equal(SELECTORS.createButton, `[${TOUR_ATTR}="${TOUR_CREATE}"]`);

// Setiap rute yang dipakai tur harus punya page.tsx — kalau tidak, tur menabrak 404.
const pagesDir = fileURLToPath(
  new URL("../../app/(dashboard)", import.meta.url),
);
assert.ok(
  ALL_TOUR_ROUTES.length >= 19,
  `rute tur mengecil tak terduga: ${ALL_TOUR_ROUTES.length}`,
);
for (const route of ALL_TOUR_ROUTES) {
  assert.ok(
    existsSync(join(pagesDir, `${route}/page.tsx`)),
    `rute tur tanpa halaman: ${route}`,
  );
}

// Rantai navigasi MAJU: nextstepjs berpindah halaman lewat `nextRoute` langkah sebelum
// langkah yang ditampilkan, jadi rantai ini harus menyentuh setiap halaman berurutan.
// Assertion `includes` terlalu lemah — bug rute halaman pertama yang tidak pernah
// dinavigasi lolos dari `includes`, jadi yang diperiksa adalah urutannya.
const forwardRoutes = (tour: Tour): string[] =>
  tour.steps
    .map((step) => step.nextRoute)
    .filter((route): route is string => typeof route === "string");
const adminTour = buildTours({ desktop: true, menuKey: "admin" }).find(
  (tour) => tour.tour === "admin",
);
const schoolTour = buildTours({
  desktop: true,
  menuKey: "schooladministrator",
}).find((tour) => tour.tour === "admin");
assert.ok(adminTour);
assert.ok(schoolTour);
assert.deepEqual(forwardRoutes(adminTour), [
  TOUR_ROUTES.admin.academicYear,
  TOUR_ROUTES.admin.branchs,
  TOUR_ROUTES.admin.users,
  TOUR_ROUTES.admin.classes,
  TOUR_ROUTES.admin.attendance,
]);
// Admin sekolah tidak punya menu tingkat yayasan, jadi rantainya lebih pendek.
assert.deepEqual(forwardRoutes(schoolTour), [
  TOUR_ROUTES.admin.classes,
  TOUR_ROUTES.admin.attendance,
]);

// Desktop memakai anchor sidebar; mobile menggantinya dengan tombol pembuka sidebar.
const desktopAdmin = adminTour.steps.map((step) => step.selector);
assert.ok(desktopAdmin.includes(SELECTORS.sidebarNav));
assert.ok(desktopAdmin.includes(SELECTORS.sidebarFooter));
const mobileAdmin = buildTours({ desktop: false, menuKey: "admin" })
  .find((tour) => tour.tour === "admin")!
  .steps.map((step) => step.selector);
assert.ok(mobileAdmin.includes(SELECTORS.sidebarTrigger));
assert.ok(!mobileAdmin.includes(SELECTORS.sidebarNav));
assert.ok(!mobileAdmin.includes(SELECTORS.sidebarFooter));

// Empat halaman master menyorot tombol buatnya supaya pengguna mengisi satu data pertama.
// Keempat langkah itu harus memakai sisi `left`: tombolnya ada di kanan, dan `left` adalah
// satu-satunya sisi yang tidak dibalik library demi ruang tepi layar.
const createSteps = adminTour.steps.filter(
  (step) => step.selector === SELECTORS.createButton,
);
assert.deepEqual(
  createSteps.map((step) => step.title),
  [
    "Mulai dari Tahun Ajaran",
    "Daftarkan tiap sekolah",
    "Undang guru, siswa, dan orang tua",
    "Susun kelas",
  ],
);
// Sisi `left` berlaku untuk setiap langkah tombol buat, bukan hanya empat di tur admin:
// kartu di sisi lain pernah terpotong tepi layar pada tombol yang ada di kanan.
for (const step of buildTours({ desktop: true, menuKey: "student" })
  .flatMap((tour) => tour.steps)
  .filter((step) => step.selector === SELECTORS.createButton)) {
  assert.equal(step.side, "left", `sisi salah pada langkah: ${step.title}`);
}
// Di mobile tombol buat sering di luar layar, jadi langkah-langkah itu tanpa selector.
assert.ok(!mobileAdmin.includes(SELECTORS.createButton));

// Tombol buat di berkas halaman harus benar-benar ditandai; selector yang tidak ketemu
// diam-diam berubah jadi kartu tengah, jadi jangan andalkan runtime untuk menangkapnya.
const CREATE_ROUTES = [
  TOUR_ROUTES.admin.academicYear,
  TOUR_ROUTES.admin.branchs,
  TOUR_ROUTES.admin.users,
  TOUR_ROUTES.admin.classes,
  TOUR_ROUTES.treasurer.paymentType,
  TOUR_ROUTES.treasurer.billing,
  TOUR_ROUTES.treasurer.payment,
  TOUR_ROUTES.teacher.violations,
];
for (const route of CREATE_ROUTES) {
  const file = join(pagesDir, `${route}/page.tsx`);
  assert.ok(
    readFileSync(file, "utf8").includes("data-tour={TOUR_CREATE}"),
    `tombol buat tanpa data-tour: ${route}`,
  );
}

// Langkah penutup menyorot blok akun dari ATAS: blok itu menempel di dasar viewport, jadi
// kartu di sisi `right`/`left` selalu terpotong tepi bawah (bug yang pernah terjadi).
const closingStep = adminTour.steps[adminTour.steps.length - 1];
assert.equal(closingStep.selector, SELECTORS.sidebarFooter);
assert.equal(closingStep.side, "top-left");

// Lima tur, semua berisi langkah berjudul dan berisi teks.
const semuaTur = buildTours({ desktop: true, menuKey: "student" });
assert.deepEqual(
  semuaTur.map((tour) => tour.tour),
  ["admin", "treasurer", "teacher", "student", "parent"],
);
for (const tour of semuaTur) {
  assert.ok(tour.steps.length > 0, `tur kosong: ${tour.tour}`);
  for (const step of tour.steps) {
    assert.ok(step.title.length > 0, `langkah tanpa judul di ${tour.tour}`);
    assert.ok(
      String(step.content).length > 0,
      `langkah tanpa isi di ${tour.tour}`,
    );
  }
}

/**
 * Blok dialog: tur masuk ke dalam dialog tambah-data, dan `TourDialogSync` memindahkannya
 * berdasarkan penanda `data-tour` yang ada di DOM. Penanda yang salah ketik tidak error di
 * runtime — langkahnya diam-diam berubah jadi kartu tengah — jadi setiap penanda diperiksa
 * di sini terhadap berkas yang benar-benar memasangnya.
 */
const repoRoot = fileURLToPath(new URL("../../", import.meta.url));

const DIALOG_TARGETS: {
  file: string;
  dialog: TourDialogKey;
  fields: TourFieldKey[];
}[] = [
  {
    file: "app/(dashboard)/dashboard/admin/master/academicyear/page.tsx",
    dialog: "academicYear",
    fields: ["academicYearName", "academicYearRange", "academicYearActive"],
  },
  {
    file: "app/(dashboard)/dashboard/admin/master/branchs/page.tsx",
    dialog: "sekolah",
    fields: ["sekolahCode", "sekolahName", "sekolahAdmin"],
  },
  {
    // Form tambah pengguna tinggal di komponen bersama, bukan di halaman users.
    file: "components/dialog/DialogUser.tsx",
    dialog: "pengguna",
    fields: ["penggunaName", "penggunaEmail", "penggunaRole"],
  },
  {
    file: "app/(dashboard)/dashboard/admin/master/classes/page.tsx",
    dialog: "kelas",
    fields: ["kelasName", "kelasGrade", "kelasBranch"],
  },
  {
    file: "app/(dashboard)/dashboard/treasurer/paymenttype/page.tsx",
    dialog: "paymentType",
    fields: ["paymentTypeOwner", "paymentTypeName", "paymentTypeAmount"],
  },
  {
    file: "app/(dashboard)/dashboard/treasurer/billing/page.tsx",
    dialog: "billing",
    fields: ["billingStudent", "billingType", "billingName"],
  },
  {
    file: "app/(dashboard)/dashboard/treasurer/payment/page.tsx",
    dialog: "payment",
    fields: ["paymentStudent", "paymentBank", "paymentDate"],
  },
  {
    file: "app/(dashboard)/dashboard/teacher/violations/page.tsx",
    dialog: "violation",
    fields: ["violationStudent", "violationType", "violationNotes"],
  },
];

// Setiap blok dialog di tur mana pun, bukan hanya tur admin: nama dialog unik se-aplikasi,
// jadi satu daftar datar cukup untuk memeriksa urutan blok di semua tur.
const allSteps = semuaTur.flatMap((tour) => tour.steps);
const dialogIndex = allSteps
  .map((step, index) => ({ dialog: (step as DialogStep).dialog, index }))
  .filter((entry) => entry.dialog !== undefined);

const coveredDialogs = DIALOG_TARGETS.map((target) => target.dialog);
assert.ok(
  dialogIndex.every((entry) => coveredDialogs.includes(entry.dialog!)),
  "ada blok dialog di tur yang tidak diperiksa di sini",
);

for (const target of DIALOG_TARGETS) {
  // Berkas yang memiliki dialog benar-benar memasang penandanya.
  const source = readFileSync(join(repoRoot, target.file), "utf8");
  assert.ok(
    source.includes(`data-tour={TOUR_DIALOG_VALUE.${target.dialog}}`),
    `isi dialog tanpa data-tour: ${target.file}`,
  );
  assert.ok(
    source.includes("data-tour={TOUR_SUBMIT}"),
    `tombol simpan tanpa data-tour: ${target.file}`,
  );
  for (const field of target.fields) {
    assert.ok(
      source.includes(`data-tour={TOUR_FIELD_VALUE.${field}}`),
      `kolom ${field} tanpa data-tour: ${target.file}`,
    );
  }

  // Langkahnya berurutan — `TourDialogSync` membacanya sebagai satu rentang indeks.
  const indices: number[] = dialogIndex
    .filter((entry) => entry.dialog === target.dialog)
    .map((entry) => entry.index);
  assert.ok(indices.length > 0, `blok dialog tidak ada di tur: ${target.dialog}`);
  assert.equal(
    indices.at(-1)! - indices[0] + 1,
    indices.length,
    `langkah dialog ${target.dialog} tidak berurutan`,
  );

  // Blok selalu diawali langkah tombol buat: tanpa itu tidak ada yang membuka dialognya.
  assert.equal(
    allSteps[indices[0] - 1]?.selector,
    SELECTORS.createButton,
    `blok ${target.dialog} tidak didahului langkah tombol buat`,
  );

  // Setiap kolom punya langkahnya, dan blok diakhiri tombol simpan.
  const blockSelectors: (string | undefined)[] = indices.map(
    (index) => allSteps[index]?.selector,
  );
  for (const field of target.fields) {
    assert.ok(
      blockSelectors.includes(FIELD_SELECTOR[field]),
      `langkah kolom ${field} hilang dari blok ${target.dialog}`,
    );
  }
  assert.equal(
    blockSelectors.at(-1),
    SELECTORS.submit,
    `blok ${target.dialog} tidak diakhiri tombol simpan`,
  );
}

// Di mobile blok dialog dilewati seluruhnya: formulirnya sering lebih tinggi dari layar,
// dan tombol simpannya di luar pandangan.
for (const tour of buildTours({ desktop: false, menuKey: "student" })) {
  const mobileDialogSteps = tour.steps.filter(
    (step) => (step as DialogStep).dialog !== undefined,
  );
  assert.equal(
    mobileDialogSteps.length,
    0,
    `blok dialog harus kosong di mobile: ${tour.tour}`,
  );
}

console.log("tour.check.ts: semua assert lolos");
