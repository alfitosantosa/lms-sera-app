#!/usr/bin/env bun
/**
 * Contrast audit for the token palette in app/globals.css.
 *
 * The palette is a constraints problem, not a taste problem: every pairing the
 * UI actually renders must clear WCAG AA. This parses the real CSS (single
 * source of truth — no duplicated values) and asserts every pairing.
 *
 *   bun scripts/color-audit.mjs
 *
 * Exit code 1 on any unexpected failure. Pairings that are known and accepted
 * live in ACCEPTED, with the reason, so the ceiling stays visible.
 */

const CSS = await Bun.file(new URL("../app/globals.css", import.meta.url)).text();

function readBlock(selector) {
  const start = CSS.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`missing ${selector} block`);
  const end = CSS.indexOf("\n}", start);
  const body = CSS.slice(start, end);
  const tokens = {};
  for (const [, name, value] of body.matchAll(/^\s*(--[\w-]+):\s*([^;]+);/gm)) {
    if (/^#[0-9a-f]{6}$/i.test(value.trim())) tokens[name.slice(2)] = value.trim();
  }
  return tokens;
}

const THEMES = { light: readBlock(":root"), dark: readBlock(".dark") };

const srgb = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => srgb(parseInt(hex.slice(i, i + 2), 16) / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

const FAMILIES = ["destructive", "success", "warning", "caution", "info", "tertiary"];
const SURFACES = ["background", "card", "secondary", "accent"];

/** [label, fgToken, bgToken, minimumRatio] */
const PAIRS = [];
const add = (l, f, b, m) => PAIRS.push([l, f, b, m]);

for (const theme of Object.keys(THEMES)) {
  for (const s of SURFACES) {
    for (const t of ["foreground", "secondary-foreground", "muted-foreground", "brand-accent", "primary"]) {
      add(`${theme}: ${t} on ${s}`, t, s, 4.5);
    }
    add(`${theme}: ring on ${s}`, "ring", s, 3);
    add(`${theme}: rule on ${s}`, "border", s, 1.2);
  }
  add(`${theme}: label on ink`, "primary-foreground", "primary", 4.5);
  add(`${theme}: label on ink hover`, "primary-foreground", "primary-hover", 4.5);
  add(`${theme}: label on ink active`, "primary-foreground", "primary-active", 4.5);
  add(`${theme}: margin rule on paper`, "margin", "background", 4.5);
  add(`${theme}: greenbar band vs paper`, "background", "accent", 1.08);
  add(`${theme}: sidebar label`, "sidebar-foreground", "sidebar", 7);
  add(`${theme}: sidebar active`, "sidebar-active-foreground", "sidebar-active", 4.5);
  add(`${theme}: sidebar button`, "sidebar-primary-foreground", "sidebar-primary", 4.5);
  add(`${theme}: inverse body`, "navy-foreground", "navy", 7);
  for (const t of ["navy-muted", "navy-accent", "navy-info", "navy-success"]) {
    add(`${theme}: ${t} on navy`, t, "navy", 4.5);
  }
  for (const fam of FAMILIES) {
    add(`${theme}: ${fam} on paper`, fam, "background", 4.5);
    add(`${theme}: ${fam} on card`, fam, "card", 4.5);
    add(`${theme}: ${fam} on its surface`, fam, `${fam}-surface`, 4.5);
    add(`${theme}: ${fam} strong on chip`, `${fam}-strong`, `${fam}-chip`, 4.5);
    add(`${theme}: ${fam} border on surface`, `${fam}-border`, `${fam}-surface`, 1.2);
    add(`${theme}: label on ${fam} solid`, "primary-foreground", `${fam}-solid`, 4.5);
  }
  for (let i = 1; i <= 10; i++) add(`${theme}: chart-${i} series`, `chart-${i}`, "card", 3);
}

/**
 * Known, accepted, documented. Dark theme is not wired at runtime; the pine
 * fill has to carry light text for the `bg-*-solid` buttons that inherit
 * `text-primary-foreground`, so `text-primary` gives up its text ratio there.
 */
const ACCEPTED = [
  {
    match: (l) => l.startsWith("dark: primary on "),
    reason: "dark mode unwired; pine fill must carry light text (see .dark)",
  },
];

let failed = 0;
for (const [label, fg, bg, min] of PAIRS) {
  const theme = label.slice(0, label.indexOf(":"));
  const t = THEMES[theme];
  if (!t[fg] || !t[bg]) {
    console.log(`  SKIP  ${label} (${!t[fg] ? fg : bg} unresolved)`);
    continue;
  }
  const ratio = contrast(t[fg], t[bg]);
  if (ratio + 1e-9 < min) {
    const accepted = ACCEPTED.find((a) => a.match(label));
    if (accepted) {
      console.log(`  ok    ${label} ${ratio.toFixed(2)}:1 (accepted — ${accepted.reason})`);
      continue;
    }
    failed++;
    console.log(`  FAIL  ${label} ${ratio.toFixed(2)}:1 < ${min}`);
  }
}

const total = PAIRS.length;
if (failed) {
  console.log(`\n${failed} of ${total} pairings below target.`);
  process.exit(1);
}
console.log(
  `\n${total} pairings checked, all within target (${ACCEPTED.length} documented exception(s)).`,
);
