"use client";

import { Document, Image, Page, pdf, StyleSheet, Text, View } from "@react-pdf/renderer";
import React from "react";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type PaymentItem = {
  id: string;
  name: string;
  amount: number;
  subtotal: number;
  quantity: number;
  month: string;
  year: string;
  skuType: string;
  isPaid: boolean;
};

export type KwitansiPDFData = {
  id: string;
  receiptNumber: string;
  amount: number;
  status: string;
  paymentDate: string;
  month: string;
  bankRef?: string;
  notes?: string | null;
  student?: {
    name: string;
    nisn?: string;
    address?: string;
    parentPhone?: string;
    email?: string;
    classId?: string;
    class: { name: string };
  };
  major?: {
    name: string;
    code?: string;
    phone?: string;
    address?: string;
    unitName?: string;
    fax?: string;
    adminName: string;
    signatureUrl: string;
  };
  accountBank?: {
    accountName: string;
    accountBank: string;
    accountNumber: string;
  };
  createdBy?: { name: string };
  paymentItems?: PaymentItem[];
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const fmt = (v: number) => new Intl.NumberFormat("id-ID", { minimumFractionDigits: 0 }).format(v);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const fmtDateTime = (d: string) =>
  new Date(d).toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const terbilang = (n: number): string => {
  const satuan = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"];
  if (n < 12) return satuan[n];
  if (n < 20) return satuan[n - 10] + " belas";
  if (n < 100) return satuan[Math.floor(n / 10)] + " puluh" + (n % 10 ? " " + satuan[n % 10] : "");
  if (n < 200) return "seratus" + (n % 100 ? " " + terbilang(n % 100) : "");
  if (n < 1_000) return satuan[Math.floor(n / 100)] + " ratus" + (n % 100 ? " " + terbilang(n % 100) : "");
  if (n < 2_000) return "seribu" + (n % 1_000 ? " " + terbilang(n % 1_000) : "");
  if (n < 1_000_000) return terbilang(Math.floor(n / 1_000)) + " ribu" + (n % 1_000 ? " " + terbilang(n % 1_000) : "");
  if (n < 1_000_000_000) return terbilang(Math.floor(n / 1_000_000)) + " juta" + (n % 1_000_000 ? " " + terbilang(n % 1_000_000) : "");
  return terbilang(Math.floor(n / 1_000_000_000)) + " miliar" + (n % 1_000_000_000 ? " " + terbilang(n % 1_000_000_000) : "");
};

const toTerbilang = (v: number) => {
  if (!v || v === 0) return "Nol Rupiah";
  const str = terbilang(Math.floor(v));
  return str.charAt(0).toUpperCase() + str.slice(1) + " Rupiah";
};

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────

// A5 portrait
const PW = 420;
const PH = 595;
const PH_MARGIN = 20; // horizontal page margin

const C = {
  // Navy palette — formal
  navy: "#0F2D4A",
  navyMid: "#1A4570",
  navyLt: "#2260A0",
  navyFade: "#EBF2FA",

  // Text
  ink: "#111827",
  sub: "#374151",
  muted: "#6B7280",
  faint: "#9CA3AF",

  // Surface
  white: "#FFFFFF",
  offWhite: "#F8FAFC",
  stripe: "#F1F5F9",
  border: "#CBD5E1",
  borderLt: "#E2E8F0",

  // Status
  green: "#065F46",
  greenBg: "#ECFDF5",
  amber: "#92400E",
  amberBg: "#FFFBEB",
  red: "#991B1B",
  redBg: "#FEF2F2",

  // Gold accent line
  gold: "#2260A0",
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 7,
    color: C.ink,
    backgroundColor: C.white,
  },

  // ── HEADER ─────────────────────────────────────────────────────────────────

  // Gold rule at very top
  goldRule: {
    height: 3,
    backgroundColor: C.gold,
  },

  header: {
    backgroundColor: C.navy,
    paddingHorizontal: PH_MARGIN,
    paddingTop: 10,
    paddingBottom: 0,
  },
  headerInner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 10,
  },

  // Left: institution
  instBlock: { flex: 1, paddingRight: 16 },
  instName: {
    color: C.white,
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  instUnit: {
    color: "#93C5FD",
    fontSize: 6.5,
    marginBottom: 3,
    letterSpacing: 0.2,
  },
  instDivider: {
    height: 0.5,
    backgroundColor: "#2D6EA8",
    marginBottom: 4,
    width: 60,
  },
  instAddr: {
    color: "#94A3B8",
    fontSize: 5.5,
    lineHeight: 1.7,
  },

  // Right: document identity
  docBlock: { alignItems: "flex-end", minWidth: 130 },
  docType: {
    color: "#93C5FD",
    fontSize: 5.5,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  docTitle: {
    color: C.white,
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    marginBottom: 3,
  },
  docNoLabel: { color: "#94A3B8", fontSize: 5.5, marginBottom: 1 },
  docNo: {
    color: "#BFDBFE",
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
  },

  // Meta strip below header
  metaStrip: {
    backgroundColor: C.navyMid,
    paddingHorizontal: PH_MARGIN,
    paddingVertical: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 3 },
  metaLabel: { color: "#93C5FD", fontSize: 6 },
  metaValue: { color: C.white, fontSize: 6, fontFamily: "Helvetica-Bold" },

  // Status badge
  badge: { borderRadius: 2, paddingHorizontal: 5, paddingVertical: 2 },
  badgePaid: { backgroundColor: C.green },
  badgePending: { backgroundColor: C.amber },
  badgeOverdue: { backgroundColor: C.red },
  badgeText: { color: C.white, fontSize: 5.5, fontFamily: "Helvetica-Bold", letterSpacing: 0.3 },

  // ── STUDENT INFO BAR ───────────────────────────────────────────────────────

  studentBar: {
    marginHorizontal: PH_MARGIN,
    marginTop: 9,
    marginBottom: 9,
    borderWidth: 0.75,
    borderColor: C.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  studentBarHeader: {
    backgroundColor: C.navyFade,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderBottomWidth: 0.75,
    borderBottomColor: C.border,
  },
  studentBarHeaderText: {
    fontSize: 5.5,
    color: C.navyLt,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  studentBarBody: {
    flexDirection: "row",
    backgroundColor: C.white,
  },
  studentCell: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRightWidth: 0.75,
    borderRightColor: C.borderLt,
  },
  studentCellLast: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  cellLabel: {
    fontSize: 5,
    color: C.faint,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  cellValue: {
    fontSize: 6.5,
    color: C.ink,
    fontFamily: "Helvetica-Bold",
  },

  // ── TABLE ──────────────────────────────────────────────────────────────────

  tableWrap: {
    marginHorizontal: PH_MARGIN,
  },
  tableHead: {
    flexDirection: "row",
    backgroundColor: C.navy,
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  th: {
    color: C.white,
    fontSize: 5.5,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  tableRowEven: {
    flexDirection: "row",
    backgroundColor: C.white,
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: C.borderLt,
  },
  tableRowOdd: {
    flexDirection: "row",
    backgroundColor: C.stripe,
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: C.borderLt,
  },
  td: { fontSize: 6.5, color: C.sub },
  tdBold: { fontSize: 6.5, color: C.ink, fontFamily: "Helvetica-Bold" },
  tdMono: { fontSize: 6.5, color: C.navyLt, fontFamily: "Helvetica-Bold" },

  // Column widths
  colNo: { width: "5%" },
  colName: { width: "36%" },
  colPeriod: { width: "17%", textAlign: "center" as const },
  colType: { width: "15%", textAlign: "center" as const },
  colQty: { width: "8%", textAlign: "center" as const },
  colAmt: { width: "19%", textAlign: "right" as const },

  // Gold rule below table body
  tableBottomRule: {
    marginHorizontal: PH_MARGIN,
    height: 1.5,
    backgroundColor: C.gold,
  },

  // ── TOTALS SECTION ─────────────────────────────────────────────────────────

  totalsWrap: {
    marginHorizontal: PH_MARGIN,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  // Terbilang box
  terbilangBox: {
    flex: 1,
    borderWidth: 0.75,
    borderColor: C.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  terbilangHeader: {
    backgroundColor: C.navyFade,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderBottomWidth: 0.75,
    borderBottomColor: C.border,
  },
  terbilangHeaderText: {
    fontSize: 5.5,
    color: C.navyLt,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  terbilangBody: {
    paddingHorizontal: 7,
    paddingVertical: 5,
  },
  terbilangText: {
    fontSize: 6.5,
    color: C.ink,
    fontFamily: "Helvetica-Oblique",
    lineHeight: 1.6,
  },
  notesLabel: {
    fontSize: 5,
    color: C.faint,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 5,
    marginBottom: 1,
  },
  notesText: {
    fontSize: 6.5,
    color: C.sub,
    lineHeight: 1.5,
  },

  // Total box
  totalBox: {
    width: 155,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: C.borderLt,
  },
  totalRowAlt: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: C.borderLt,
    backgroundColor: C.stripe,
  },
  totalLabel: { fontSize: 6, color: C.muted },
  totalValue: { fontSize: 6, color: C.sub },
  grandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: C.navy,
    paddingVertical: 7,
    paddingHorizontal: 8,
    marginTop: 3,
    borderRadius: 2,
  },
  grandLabel: { fontSize: 8, fontFamily: "Helvetica-Bold", color: C.white, letterSpacing: 0.3 },
  grandValue: { fontSize: 8, fontFamily: "Helvetica-Bold", color: C.white },

  // ── FOOTER ─────────────────────────────────────────────────────────────────

  footerWrap: {
    marginTop: 10,
    marginHorizontal: PH_MARGIN,
    borderWidth: 0.75,
    borderColor: C.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  footerHeader: {
    backgroundColor: C.navyFade,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderBottomWidth: 0.75,
    borderBottomColor: C.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerHeaderText: {
    fontSize: 5.5,
    color: C.navyLt,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  footerHeaderValid: {
    fontSize: 5.5,
    color: C.green,
    fontFamily: "Helvetica-Oblique",
  },
  footerBody: {
    flexDirection: "row",
    backgroundColor: C.white,
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 0,
  },

  footerCol: {
    flex: 1,
    paddingRight: 10,
    borderRightWidth: 0.5,
    borderRightColor: C.borderLt,
    marginRight: 10,
  },
  footerColLast: {
    alignItems: "center" as const,
    width: 80,
  },
  footerColMid: {
    alignItems: "center" as const,
    width: 80,
    paddingRight: 10,
    borderRightWidth: 0.5,
    borderRightColor: C.borderLt,
    marginRight: 10,
  },
  footerColLabel: {
    fontSize: 5.5,
    color: C.navyLt,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
    paddingBottom: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: C.borderLt,
  },
  footerText: { fontSize: 6, color: C.sub, lineHeight: 1.8 },
  footerTextBold: { fontSize: 6, color: C.ink, fontFamily: "Helvetica-Bold" },

  sigSpace: { height: 44 },
  sigLine: {
    borderBottomWidth: 0.75,
    borderBottomColor: C.ink,
    marginBottom: 3,
    width: "100%",
  },
  sigImage: {
    width: "100%",
    height: 44,
    objectFit: "contain" as const,
    marginBottom: 3,
  },
  sigName: {
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    color: C.ink,
    textAlign: "center" as const,
  },
  sigRole: {
    fontSize: 5.5,
    color: C.muted,
    textAlign: "center" as const,
    marginTop: 1,
  },

  // ── OPERATOR STRIP ─────────────────────────────────────────────────────────
  operatorStrip: {
    marginTop: 0,
    backgroundColor: C.navy,
    paddingHorizontal: PH_MARGIN,
    paddingVertical: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  operatorText: { fontSize: 5, color: "#94A3B8" },

  // ── PAGE FOOTER (fixed, every page) ───────────────────────────────────────
  pageFooter: {
    paddingHorizontal: PH_MARGIN,
    paddingTop: 5,
    paddingBottom: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 0.5,
    borderTopColor: C.borderLt,
  },
  pageFooterText: { fontSize: 5, color: C.faint },

  // ── CONTINUATION BANNER (page 2+) ─────────────────────────────────────────
  continuationBar: {
    backgroundColor: C.navyFade,
    paddingHorizontal: PH_MARGIN,
    paddingVertical: 4,
    borderBottomWidth: 0.75,
    borderBottomColor: C.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  continuationText: { fontSize: 5.5, color: C.navyLt, fontFamily: "Helvetica-Oblique" },
});

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const INSTITUTION = {
  name: `YAYASAN PENDIDIKAN ${process.env.NEXT_PUBLIC_CLIENT_NAME?.toUpperCase()}`,
  address: "Jl. Lapangan Member, Blok C No. 11, Sukmajaya, Depok 16412",
  phone: "(021) 77833598",
  fax: "(021) 77835420",
};

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const isPaid = s === "paid" || s === "lunas";
  const isOverdue = s === "overdue" || s === "terlambat";
  const badgeStyle =
    isPaid ? S.badgePaid
    : isOverdue ? S.badgeOverdue
    : S.badgePending;
  const label =
    isPaid ? "LUNAS"
    : isOverdue ? "TERLAMBAT"
    : "MENUNGGU";
  return (
    <View style={[S.badge, badgeStyle]}>
      <Text style={S.badgeText}>{label}</Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT
// ─────────────────────────────────────────────────────────────────────────────

function KwitansiDocument({ data }: { data: KwitansiPDFData }) {
  const items = data.paymentItems ?? [];
  const total = Number(data.amount);
  const unitName = data.major?.unitName ?? data.major?.name ?? "";
  const phone = data.major?.phone ?? INSTITUTION.phone;
  const fax = data.major?.fax ?? INSTITUTION.fax;
  const address = data.major?.address ?? INSTITUTION.address;

  return (
    <Document>
      <Page size={[PW, PH]} style={S.page} wrap>
        {/* ══════════════════════════════════════════
            GOLD TOP RULE — fixed, every page
        ══════════════════════════════════════════ */}
        <View style={S.goldRule} fixed />

        {/* ══════════════════════════════════════════
            HEADER — fixed, every page
        ══════════════════════════════════════════ */}
        <View style={S.header} fixed>
          <View style={S.headerInner}>
            {/* Left: institution identity */}
            <View style={S.instBlock}>
              <Text style={S.instName}>{unitName || INSTITUTION.name}</Text>
              {unitName ?
                <Text style={S.instUnit}>{INSTITUTION.name}</Text>
              : null}
              <View style={S.instDivider} />
              <Text style={S.instAddr}>
                {address}
                {"\n"}
                Telp. {phone}
                {fax ? `  ·  Fax. ${fax}` : ""}
              </Text>
            </View>

            {/* Right: document identity */}
            <View style={S.docBlock}>
              <Text style={S.docType}>Bukti Transaksi</Text>
              <Text style={S.docTitle}>KWITANSI</Text>
              <Text style={S.docNoLabel}>Nomor Dokumen</Text>
              <Text style={S.docNo}>{data.receiptNumber}</Text>
            </View>
          </View>
        </View>

        {/* Meta strip — fixed, every page */}
        <View style={S.metaStrip} fixed>
          <View style={S.metaItem}>
            <Text style={S.metaLabel}>Tanggal Bayar :</Text>
            <Text style={S.metaValue}>{fmtDate(data.paymentDate)}</Text>
          </View>
          <View style={S.metaItem}>
            <Text style={S.metaLabel}>Bulan Tagihan :</Text>
            <Text style={S.metaValue}>{data.month}</Text>
          </View>
          <View style={S.metaItem}>
            <Text style={S.metaLabel}>Metode / Ref :</Text>
            <Text style={S.metaValue}>{data.bankRef ?? "-"}</Text>
          </View>
          <View style={S.metaItem}>
            <Text style={S.metaLabel}>Status :</Text>
            <StatusBadge status={data.status} />
          </View>
        </View>

        {/* ══════════════════════════════════════════
            BODY
        ══════════════════════════════════════════ */}

        {/* Student info bar */}
        <View style={S.studentBar}>
          <View style={S.studentBarHeader}>
            <Text style={S.studentBarHeaderText}>Data Siswa</Text>
          </View>
          <View style={S.studentBarBody}>
            <View style={S.studentCell}>
              <Text style={S.cellLabel}>NIS / NISN</Text>
              <Text style={S.cellValue}>{data.student?.nisn ?? "-"}</Text>
            </View>
            <View style={S.studentCell}>
              <Text style={S.cellLabel}>Nama Lengkap</Text>
              <Text style={S.cellValue}>{data.student?.name ?? "-"}</Text>
            </View>
            <View style={S.studentCell}>
              <Text style={S.cellLabel}>Kelas</Text>
              <Text style={S.cellValue}>{data.student?.class?.name ?? "-"}</Text>
            </View>
            <View style={S.studentCell}>
              <Text style={S.cellLabel}>No. HP Orang Tua / Wali</Text>
              <Text style={S.cellValue}>{data.student?.parentPhone ?? "-"}</Text>
            </View>
            <View style={S.studentCellLast}>
              <Text style={S.cellLabel}>Email</Text>
              <Text style={S.cellValue}>{data.student?.email ?? "-"}</Text>
            </View>
          </View>
        </View>

        {/* ── Payment Items Table ── */}
        <View style={S.tableWrap}>
          {/* Table header — fixed so it repeats on every page */}
          <View style={S.tableHead} fixed>
            <Text style={[S.th, S.colNo]}>#</Text>
            <Text style={[S.th, S.colName]}>Keterangan / Nama Tagihan</Text>
            <Text style={[S.th, S.colPeriod]}>Periode</Text>
            <Text style={[S.th, S.colType]}>Jenis</Text>
            <Text style={[S.th, S.colQty]}>Qty</Text>
            <Text style={[S.th, S.colAmt]}>Jumlah (Rp)</Text>
          </View>

          {/* Rows — wrap={false} prevents a row from splitting across pages */}
          {items.map((item, i) => (
            <View key={item.id} style={i % 2 === 0 ? S.tableRowEven : S.tableRowOdd} wrap={false}>
              <Text style={[S.td, S.colNo]}>{i + 1}</Text>
              <Text style={[S.tdBold, S.colName]}>{item.name}</Text>
              <Text style={[S.td, S.colPeriod]}>
                {item.month} / {item.year}
              </Text>
              <Text style={[S.td, S.colType]}>{item.skuType}</Text>
              <Text style={[S.td, S.colQty]}>{item.quantity}</Text>
              <Text style={[S.tdMono, S.colAmt]}>{fmt(item.subtotal)}</Text>
            </View>
          ))}
        </View>

        {/* Gold rule after table */}
        <View style={S.tableBottomRule} />

        {/* ── Totals & Terbilang — wrap={false}: moves as a unit to next page ── */}
        <View style={S.totalsWrap} wrap={false}>
          {/* Terbilang box */}
          <View style={S.terbilangBox}>
            <View style={S.terbilangHeader}>
              <Text style={S.terbilangHeaderText}>Terbilang</Text>
            </View>
            <View style={S.terbilangBody}>
              <Text style={S.terbilangText}>{toTerbilang(total)}</Text>
              {data.notes ?
                <>
                  <Text style={S.notesLabel}>Catatan</Text>
                  <Text style={S.notesText}>{data.notes}</Text>
                </>
              : null}
            </View>
          </View>

          {/* Breakdown + Grand Total */}
          <View style={S.totalBox}>
            <View style={S.totalRow}>
              <Text style={S.totalLabel}>Jumlah Item</Text>
              <Text style={S.totalValue}>{items.length} tagihan</Text>
            </View>
            <View style={S.totalRowAlt}>
              <Text style={S.totalLabel}>Bank / Rekening</Text>
              <Text style={S.totalValue}>{data.accountBank?.accountBank ?? "-"}</Text>
            </View>
            {data.bankRef ?
              <View style={S.totalRow}>
                <Text style={S.totalLabel}>Referensi Bank</Text>
                <Text style={S.totalValue}>{data.bankRef}</Text>
              </View>
            : null}
            <View style={S.grandRow}>
              <Text style={S.grandLabel}>TOTAL BAYAR</Text>
              <Text style={S.grandValue}>Rp {fmt(total)}</Text>
            </View>
          </View>
        </View>

        {/* ── Footer: rekening + tanda tangan — wrap={false} ── */}
        <View style={S.footerWrap} wrap={false}>
          <View style={S.footerHeader}>
            <Text style={S.footerHeaderText}>Tanda Tangan &amp; Informasi</Text>
            <Text style={S.footerHeaderValid}>Dokumen ini sah apabila tercatat dalam sistem keuangan sekolah.</Text>
          </View>

          <View style={S.footerBody}>
            {/* Rekening */}
            <View style={S.footerCol}>
              <Text style={S.footerColLabel}>Informasi Rekening</Text>
              <Text style={S.footerText}>
                <Text>Bank</Text>
                {"\n"}
                <Text style={S.footerTextBold}>{data.accountBank?.accountBank ?? "-"}</Text>
                {"\n"}
                <Text>No. Rekening</Text>
                {"\n"}
                <Text style={S.footerTextBold}>{data.accountBank?.accountNumber ?? "-"}</Text>
                {"\n"}
                <Text> Atas Nama</Text>
                {"\n"}
                <Text style={S.footerTextBold}>{data.accountBank?.accountName ?? "-"}</Text>
              </Text>
            </View>

            {/* Keterangan */}
            <View style={S.footerCol}>
              <Text style={S.footerColLabel}>Validitas</Text>
              <Text style={S.footerText}>Kwitansi ini merupakan bukti pembayaran resmi yang diterbitkan oleh bagian keuangan. Harap disimpan sebagai arsip pribadi.</Text>
            </View>

            {/* Sig: pemberi */}
            <View style={S.footerColMid}>
              <Text style={S.footerColLabel}>Pemberi</Text>
              <View style={S.sigSpace} />
              <View style={S.sigLine} />
              <Text style={S.sigName}>{data.student?.name?.split(" ").slice(0, 2).join(" ") ?? ""}</Text>
              <Text style={S.sigRole}>Siswa / Wali Murid</Text>
            </View>

            {/* Sig: penerima */}
            <View style={S.footerColLast}>
              <Text style={S.footerColLabel}>Penerima</Text>
              {data.major?.signatureUrl ?
                <Image src={data.major?.signatureUrl} style={S.sigImage} />
              : <>
                  <View style={S.sigSpace} />
                  <View style={S.sigLine} />
                </>
              }
              <Text style={S.sigName}>{data.major?.adminName ?? ""}</Text>
              <Text style={S.sigRole}>Bendahara</Text>
            </View>
          </View>
        </View>

        {/* ── Operator strip ── */}
        <View style={S.operatorStrip} wrap={false}>
          <Text style={S.operatorText}>
            Dicetak oleh: {data.createdBy?.name ?? "-"}
            {"  ·  "}
            {fmtDateTime(data.paymentDate)}
            {"  ·  "}
            {unitName || INSTITUTION.name}
          </Text>
          <Text style={S.operatorText}>
            Telp. {phone}
            {fax ? `  ·  Fax. ${fax}` : ""}
          </Text>
        </View>

        {/* ══════════════════════════════════════════
            PAGE FOOTER — fixed, every page
        ══════════════════════════════════════════ */}
        <View style={S.pageFooter} fixed>
          <Text style={S.pageFooterText} render={({ pageNumber, totalPages }) => (totalPages > 1 ? `Halaman ${pageNumber} dari ${totalPages}` : " ")} />
          <Text style={S.pageFooterText}>{data.receiptNumber}</Text>
          <Text style={S.pageFooterText}>{INSTITUTION.name}</Text>
        </View>
      </Page>
    </Document>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export async function createPDFKwitansi(data: KwitansiPDFData) {
  const blob = await pdf(<KwitansiDocument data={data} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Kwitansi-${data.receiptNumber}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
