/**
 * Self-check registry modul (tanpa framework, tanpa DB).
 *
 * Jalankan: `bun run config/modules.check.ts`
 *
 * Menjaga tiga hal yang mudah rusak: setiap prefix hanya milik satu modul,
 * pencocokan memakai prefix terpanjang, dan setiap menu modul punya halaman.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { menuGroups } from "./menuGroupsSidebar";
import {
  ALL_MODULES,
  DEFAULT_MODULES,
  MODULES,
  moduleForApiPath,
  moduleForPath,
  normalizeModules,
  parseModules,
  type ModuleKey,
} from "./modules";

const repoRoot = fileURLToPath(new URL("../", import.meta.url));

// Default harus sama dengan daftar modul.
assert.deepEqual(DEFAULT_MODULES, ALL_MODULES);

// Omitted → semua; array kosong → core saja; key asing → ditolak.
assert.deepEqual(parseModules(undefined), ALL_MODULES);
assert.deepEqual(parseModules([]), []);
assert.deepEqual(parseModules(["keuangan", "keuangan"]), ["keuangan"]);
assert.equal(parseModules(["tidak-ada"]), null);
assert.equal(parseModules("keuangan"), null);
assert.deepEqual(normalizeModules(undefined), ALL_MODULES);
assert.deepEqual(normalizeModules([]), []);
assert.deepEqual(normalizeModules(["tahfidz", "asing"]), ["tahfidz"]);

// Satu prefix tidak boleh dimiliki dua modul.
for (const kind of ["pagePrefixes", "apiPrefixes"] as const) {
  const owner = new Map<string, ModuleKey>();
  for (const [module, definition] of Object.entries(MODULES)) {
    for (const prefix of definition[kind]) {
      assert.ok(
        !owner.has(prefix),
        `${kind}: prefix ${prefix} dimiliki ${owner.get(prefix)} dan ${module}`,
      );
      owner.set(prefix, module as ModuleKey);
    }
  }
}

// Prefix terpanjang menang; core tidak dipetakan.
assert.equal(moduleForApiPath("/api/students/by-ids/attendance"), "absensi");
assert.equal(moduleForApiPath("/api/students/by-ids/violations"), "pelanggaran");
assert.equal(moduleForApiPath("/api/students"), null);
assert.equal(moduleForApiPath("/api/payment/items"), "keuangan");
assert.equal(moduleForPath("/dashboard/admin/master/classes/tahfidz"), "tahfidz");
assert.equal(moduleForPath("/dashboard/admin/master/classes"), null);
assert.equal(moduleForPath("/dashboard/admin/academic/schedules"), null);
assert.equal(moduleForPath("/dashboard/profile"), null);
assert.equal(moduleForPath("/dashboard"), null);
assert.equal(moduleForPath("/dashboard/teacher/questionbank"), "pembelajaran");
// Pusat laporan mencakup semua domain, jadi tetap core.
assert.equal(moduleForPath("/dashboard/reports"), null);

// Setiap menu yang dipetakan harus punya page.tsx, dan tidak ada URL mati.
function collectUrls(items: { url: string; items?: unknown[] }[]): string[] {
  return items.flatMap((item) => [
    item.url,
    ...collectUrls((item.items ?? []) as { url: string; items?: unknown[] }[]),
  ]);
}

const dashboardDir = join(repoRoot, "app/(dashboard)/dashboard");
const allUrls = Object.values(menuGroups).flatMap((groups) =>
  collectUrls(groups.flatMap((group) => group.items)),
);
assert.ok(allUrls.length > 0, "menu kosong");

// Grup bernama modul hanya boleh berisi menu milik modul itu; Akademik murni core.
// Ini menjaga pemisahan SIAKAD vs Absensi/Tahfidz/Pembelajaran tidak tercampur lagi.
const MODULE_GROUPS: Record<string, ModuleKey | null> = {
  Akademik: null,
  Absensi: "absensi",
  Tahfidz: "tahfidz",
  Pembelajaran: "pembelajaran",
  Pelanggaran: "pelanggaran",
  Keuangan: "keuangan",
};

for (const [role, groups] of Object.entries(menuGroups)) {
  for (const group of groups) {
    if (!(group.title in MODULE_GROUPS)) continue;
    const expected = MODULE_GROUPS[group.title];
    for (const url of collectUrls(group.items)) {
      assert.equal(
        moduleForPath(url),
        expected,
        `${role}/${group.title}: ${url} bukan menu ${expected ?? "core"}`,
      );
    }
  }
}

for (const url of new Set(allUrls)) {
  if (!url.startsWith("/dashboard")) continue;
  const relative = url.replace("/dashboard", "");
  assert.ok(
    existsSync(join(dashboardDir, relative, "page.tsx")),
    `menu tanpa halaman: ${url}`,
  );
}

// Setiap prefix API harus menunjuk direktori route yang benar-benar ada.
for (const definition of Object.values(MODULES)) {
  for (const prefix of definition.apiPrefixes) {
    assert.ok(
      existsSync(join(repoRoot, "app", prefix)),
      `prefix API tanpa direktori: ${prefix}`,
    );
  }
}

// Default Prisma harus sama dengan ALL_MODULES.
const schema = readFileSync(join(repoRoot, "prisma/schema.prisma"), "utf8");
const expectedDefault = `@default([${ALL_MODULES.map((m) => `"${m}"`).join(", ")}])`;
assert.ok(
  schema.includes(expectedDefault),
  `default Prisma tidak sinkron dengan ALL_MODULES: cari ${expectedDefault}`,
);

console.log("modules.check.ts: semua assert lolos");
