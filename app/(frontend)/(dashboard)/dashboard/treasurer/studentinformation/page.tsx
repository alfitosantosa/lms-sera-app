"use client";

import {
  useGetPaymentByStudentId,
  usePaymentItemsByStudentId,
} from "@/app/(hooks)/hooks/Payments/usePaymentItems";
import { useGetStudentByIdMajor } from "@/app/(hooks)/hooks/Users/useGetStudentById";
import { useGetUserByIdBetterAuth } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import Loading from "@/components/loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StudentCombobox } from "@/components/ui/student-combobox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/lib/authClients";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  AlertCircle,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  GraduationCap,
  Hash,
  MapPin,
  MessageCircle,
  Phone,
  Receipt,
  TrendingUp,
  User,
  XCircle,
} from "lucide-react";
import { unauthorized } from "next/navigation";
import * as React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type PaymentItem = {
  id: string;
  paymentId: string | null;
  studentId: string;
  paymentTypeId: string;
  quantity: string;
  amount: string;
  subtotal: string;
  isPaid: boolean;
  month: string;
  name: string;
  year: string;
  skuType: string;
  createdAt: string;
  PaymentType?: { name: string; owner: string };
  payment?: any;
};

type Payment = {
  id: string;
  studentId: string;
  amount: string;
  status: string;
  notes?: string;
  createdAt: string;
  paymentDate: string;
  receiptNumber: string;
  accountBankId: string;
  majorId: string;
  month: string;
  bendaharaId: string;
  bankRef: string;
  student?: { name: string; nisn?: string };
};

type Student = {
  id: string;
  name: string;
  email?: string;
  nisn?: string;
  gender?: string;
  birthPlace?: string;
  birthDate?: string;
  address?: string;
  parentPhone?: string;
  status?: string;
  enrollmentDate?: string;
  class?: { id: string; name: string; grade: number };
  major?: { id: string; name: string };
  academicYear?: { id: string; year: string };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatRupiah(value: string | number) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num);
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "-";
  try {
    return format(new Date(dateStr), "dd MMM yyyy", { locale: localeId });
  } catch {
    return "-";
  }
}

// ─── WA Reminder Builder ──────────────────────────────────────────────────────
function buildWAMessage(student: Student, unpaidItems: PaymentItem[]): string {
  const totalUnpaid = unpaidItems.reduce(
    (sum, item) => sum + parseFloat(item.subtotal || "0"),
    0,
  );

  const itemLines = unpaidItems
    .map(
      (item, i) =>
        `${i + 1}. ${item.name} (${item.month}/${item.year}) - ${formatRupiah(item.subtotal)}`,
    )
    .join("\n");

  const message = `Assalamu'alaikum Wr. Wb.

Yth. Orang Tua/Wali dari *${student.name}*
NISN: ${student.nisn ?? "-"} | Kelas: ${student.class?.name ?? "-"}

Kami menginformasikan bahwa terdapat tagihan yang belum dibayarkan:

${itemLines}

*Total Tagihan: ${formatRupiah(totalUnpaid)}*

Mohon segera melakukan pembayaran. Terima kasih atas perhatian dan kerjasamanya.

Wassalamu'alaikum Wr. Wb.
_Bagian Keuangan_`;

  return encodeURIComponent(message);
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function PaymentStatusBadge({ status }: { status: string }) {
  const cfg: Record<
    string,
    { label: string; className: string; icon: React.ReactNode }
  > = {
    paid: {
      label: "Lunas",
      className: "bg-success-solid text-white",
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
    pending: {
      label: "Menunggu",
      className: "bg-warning-solid text-white",
      icon: <Clock className="h-3 w-3" />,
    },
    overdue: {
      label: "Terlambat",
      className: "bg-destructive-solid text-white",
      icon: <XCircle className="h-3 w-3" />,
    },
  };
  const c = cfg[status] ?? {
    label: status,
    className: "bg-muted-foreground text-background",
    icon: null,
  };
  return (
    <Badge className={`${c.className} flex w-fit items-center gap-1 text-xs`}>
      {c.icon}
      {c.label}
    </Badge>
  );
}

// ─── Student Profile Card ─────────────────────────────────────────────────────
function StudentProfileCard({ student }: { student: Student }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <User className="text-info h-4 w-4" />
          Profil Siswa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Avatar & Name */}
        <div className="bg-muted/40 flex items-center gap-3 rounded-lg p-3">
          <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
            <span className="text-primary text-lg font-bold">
              {student.name?.charAt(0)?.toUpperCase() ?? "?"}
            </span>
          </div>
          <div>
            <p className="text-base font-semibold">{student.name}</p>
            <p className="text-muted-foreground text-xs">
              {student.email ?? "-"}
            </p>
            <Badge
              variant="outline"
              className={`mt-1 text-xs ${student.status === "active" ? "border-success text-success" : "border-border text-muted-foreground"}`}
            >
              {student.status === "active" ? "Aktif" : (student.status ?? "-")}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground flex items-center gap-1 text-xs">
              <Hash className="h-3 w-3" />
              NISN
            </p>
            <p className="font-mono font-medium">{student.nisn ?? "-"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground flex items-center gap-1 text-xs">
              <User className="h-3 w-3" />
              Jenis Kelamin
            </p>
            <p className="font-medium">
              {student.gender === "L"
                ? "Laki-laki"
                : student.gender === "P"
                  ? "Perempuan"
                  : "-"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground flex items-center gap-1 text-xs">
              <Calendar className="h-3 w-3" />
              Tgl Lahir
            </p>
            <p className="text-xs font-medium">
              {student.birthPlace ? `${student.birthPlace}, ` : ""}
              {formatDate(student.birthDate)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground flex items-center gap-1 text-xs">
              <Phone className="h-3 w-3" />
              No. HP Ortu
            </p>
            <p className="font-medium">{student.parentPhone ?? "-"}</p>
          </div>
          <div className="col-span-2 space-y-1">
            <p className="text-muted-foreground flex items-center gap-1 text-xs">
              <MapPin className="h-3 w-3" />
              Alamat
            </p>
            <p className="text-xs font-medium">{student.address ?? "-"}</p>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              <GraduationCap className="h-3 w-3" />
              Kelas
            </span>
            <span className="text-xs font-medium">
              {student.class?.name ?? "-"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              <Building2 className="h-3 w-3" />
              Branch
            </span>
            <span className="text-xs font-medium">
              {student.major?.name ?? "-"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              <BookOpen className="h-3 w-3" />
              Tahun Akademik
            </span>
            <span className="text-xs font-medium">
              {student.academicYear?.year ?? "-"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              <Calendar className="h-3 w-3" />
              Tgl Masuk
            </span>
            <span className="text-xs font-medium">
              {formatDate(student.enrollmentDate)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Summary Cards ────────────────────────────────────────────────────────────
function SummaryCards({
  billingItems,
  payments,
}: {
  billingItems: PaymentItem[];
  payments: Payment[];
}) {
  const unpaidItems = billingItems.filter((i) => !i.isPaid);
  const paidItems = billingItems.filter((i) => i.isPaid);
  const totalUnpaid = unpaidItems.reduce(
    (s, i) => s + parseFloat(i.subtotal || "0"),
    0,
  );
  const totalPaid = payments
    .filter((p) => p.status === "paid")
    .reduce((s, p) => s + parseFloat(p.amount || "0"), 0);

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <Card className="border-destructive-border">
        <CardContent className="pt-4 pb-3">
          <div className="mb-2 flex items-center gap-2">
            <AlertCircle className="text-destructive h-4 w-4 shrink-0" />
            <p className="text-muted-foreground text-xs font-medium">
              Belum Lunas
            </p>
          </div>
          <p className="text-destructive text-xl font-bold">
            {unpaidItems.length}
          </p>
          <p className="text-destructive mt-0.5 text-xs tabular-nums">
            {formatRupiah(totalUnpaid)}
          </p>
        </CardContent>
      </Card>

      <Card className="border-success-border">
        <CardContent className="pt-4 pb-3">
          <div className="mb-2 flex items-center gap-2">
            <CheckCircle2 className="text-success h-4 w-4 shrink-0" />
            <p className="text-muted-foreground text-xs font-medium">
              Sudah Lunas
            </p>
          </div>
          <p className="text-success text-xl font-bold">{paidItems.length}</p>
          <p className="text-success mt-0.5 text-xs tabular-nums">
            {formatRupiah(totalPaid)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="mb-2 flex items-center gap-2">
            <Receipt className="text-info h-4 w-4 shrink-0" />
            <p className="text-muted-foreground text-xs font-medium">
              Total Transaksi
            </p>
          </div>
          <p className="text-xl font-bold">{payments.length}</p>
          <p className="text-muted-foreground mt-0.5 text-xs">pembayaran</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="mb-2 flex items-center gap-2">
            <TrendingUp className="text-tertiary h-4 w-4 shrink-0" />
            <p className="text-muted-foreground text-xs font-medium">
              Total Terbayar
            </p>
          </div>
          <p className="text-tertiary text-xl font-bold tabular-nums">
            {formatRupiah(totalPaid)}
          </p>
          <p className="text-muted-foreground mt-0.5 text-xs">dari transaksi</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Billing Tab ──────────────────────────────────────────────────────────────
function BillingTab({
  billingItems,
  student,
}: {
  billingItems: PaymentItem[];
  student: Student;
}) {
  const unpaidItems = billingItems.filter((i) => !i.isPaid);
  const paidItems = billingItems.filter((i) => i.isPaid);
  const totalUnpaid = unpaidItems.reduce(
    (s, i) => s + parseFloat(i.subtotal || "0"),
    0,
  );

  const handleWAReminder = () => {
    if (!student.parentPhone || unpaidItems.length === 0) return;
    const phone = student.parentPhone.replace(/^0/, "62").replace(/\D/g, "");
    const message = buildWAMessage(student, unpaidItems);
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  const handleWAReminderManual = () => {
    if (unpaidItems.length === 0) return;
    const message = buildWAMessage(student, unpaidItems);
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  // Group by skuType
  const groupedUnpaid = React.useMemo(() => {
    const map = new Map<string, PaymentItem[]>();
    unpaidItems.forEach((item) => {
      const key = item.skuType || "Lainnya";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    });
    return map;
  }, [unpaidItems]);

  return (
    <div className="space-y-4">
      {/* Unpaid Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Tagihan Belum Lunas</h3>
            {unpaidItems.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unpaidItems.length} item
              </Badge>
            )}
          </div>

          {/* WA Reminder Buttons */}
          {unpaidItems.length > 0 && (
            <div className="flex gap-2">
              {student.parentPhone ? (
                <Button
                  size="sm"
                  variant="default"
                  className="bg-success-solid hover:bg-success-solid/90 h-8 gap-1.5 text-xs text-white"
                  onClick={handleWAReminder}
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Reminder WA
                  <span className="text-xs opacity-80">
                    ({student.parentPhone})
                  </span>
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-success text-success hover:bg-success-surface h-8 gap-1.5 text-xs"
                  onClick={handleWAReminderManual}
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Salin Pesan WA
                </Button>
              )}
            </div>
          )}
        </div>

        {unpaidItems.length === 0 ? (
          <div className="bg-success-surface flex flex-col items-center justify-center rounded-lg border py-8">
            <CheckCircle2 className="text-success mb-2 h-10 w-10" />
            <p className="text-success-strong text-sm font-medium">
              Semua tagihan sudah lunas!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Total unpaid summary */}
            <div className="bg-destructive-surface border-destructive-border flex items-center justify-between rounded-lg border px-4 py-2.5">
              <span className="text-destructive-strong text-sm font-medium">
                Total Tagihan Belum Lunas
              </span>
              <span className="text-destructive-strong font-bold tabular-nums">
                {formatRupiah(totalUnpaid)}
              </span>
            </div>

            {/* Grouped by SKU Type */}
            {Array.from(groupedUnpaid.entries()).map(([skuType, items]) => (
              <div key={skuType} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {skuType}
                  </Badge>
                  <span className="text-muted-foreground text-xs">
                    {items.length} tagihan ·{" "}
                    {formatRupiah(
                      items.reduce(
                        (s, i) => s + parseFloat(i.subtotal || "0"),
                        0,
                      ),
                    )}
                  </span>
                </div>
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-card hover:bg-muted/30 flex items-center justify-between rounded-lg border px-3 py-2.5 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {item.name}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Bulan {item.month}/{item.year} · Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="ml-3 shrink-0 text-right">
                      <p className="text-sm font-semibold tabular-nums">
                        {formatRupiah(item.subtotal)}
                      </p>
                      <Badge className="bg-destructive-chip text-destructive-strong mt-0.5 border-0 text-xs">
                        Belum Lunas
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Paid Section */}
      {paidItems.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">Tagihan Sudah Lunas</h3>
              <Badge variant="secondary" className="text-xs">
                {paidItems.length} item
              </Badge>
            </div>
            <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
              {paidItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-muted/20 flex items-center justify-between rounded-lg border px-3 py-2 opacity-70"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="text-muted-foreground text-xs">
                      Bulan {item.month}/{item.year} · {item.skuType}
                    </p>
                  </div>
                  <div className="ml-3 shrink-0 text-right">
                    <p className="text-sm tabular-nums">
                      {formatRupiah(item.subtotal)}
                    </p>
                    <Badge className="bg-success-chip text-success-strong mt-0.5 border-0 text-xs">
                      Lunas
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Transactions Tab ─────────────────────────────────────────────────────────
function TransactionsTab({ payments }: { payments: Payment[] }) {
  const totalPaid = payments
    .filter((p) => p.status === "paid")
    .reduce((s, p) => s + parseFloat(p.amount || "0"), 0);

  if (payments.length === 0) {
    return (
      <div className="bg-muted/20 flex flex-col items-center justify-center rounded-lg border py-10">
        <Receipt className="text-muted-foreground mb-2 h-10 w-10" />
        <p className="text-muted-foreground text-sm">
          Belum ada riwayat transaksi
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Total summary */}
      <div className="bg-info-surface border-info-border flex items-center justify-between rounded-lg border px-4 py-2.5">
        <span className="text-info-strong text-sm font-medium">
          Total Terbayar ({payments.filter((p) => p.status === "paid").length}{" "}
          transaksi lunas)
        </span>
        <span className="text-info-strong font-bold tabular-nums">
          {formatRupiah(totalPaid)}
        </span>
      </div>

      {/* Transaction list */}
      <div className="max-h-[500px] space-y-2 overflow-y-auto pr-1">
        {payments
          .slice()
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
          .map((payment) => (
            <div
              key={payment.id}
              className="bg-card hover:bg-muted/30 rounded-lg border px-4 py-3 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-mono text-sm font-semibold">
                      {payment.receiptNumber}
                    </p>
                    <PaymentStatusBadge status={payment.status} />
                    <Badge variant="outline" className="text-xs">
                      {payment.month}
                    </Badge>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                    <span className="text-muted-foreground flex items-center gap-1 text-xs">
                      <Calendar className="h-3 w-3" />
                      {formatDate(payment.paymentDate)}
                    </span>
                    <span className="text-muted-foreground flex items-center gap-1 text-xs">
                      <CreditCard className="h-3 w-3" />
                      Ref: {payment.bankRef || "-"}
                    </span>
                  </div>
                  {payment.notes && (
                    <p className="text-muted-foreground mt-1 text-xs italic">
                      {payment.notes}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-base font-bold tabular-nums">
                    {formatRupiah(payment.amount)}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {formatDate(payment.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
        <User className="text-muted-foreground h-8 w-8" />
      </div>
      <h3 className="mb-1 text-base font-semibold">Pilih Siswa</h3>
      <p className="text-muted-foreground max-w-xs text-sm">
        Gunakan pencarian di atas untuk memilih siswa dan melihat informasi
        tagihan serta riwayat pembayaran.
      </p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function StudentInformation({
  userDataMajor,
}: {
  userDataMajor: { id: string; name: string };
}) {
  const [selectedStudentId, setSelectedStudentId] = React.useState<string>("");

  const { data: allStudents = [], isLoading: isLoadingStudents } =
    useGetStudentByIdMajor(userDataMajor.id);
  const { data: rawBilling = [], isLoading: isLoadingBilling } =
    usePaymentItemsByStudentId(selectedStudentId);
  const { data: rawPayments = [], isLoading: isLoadingPayments } =
    useGetPaymentByStudentId(selectedStudentId);

  const billingItems: PaymentItem[] = Array.isArray(rawBilling)
    ? rawBilling.map((item) => ({
        ...item,
        createdAt: item.createdAt == null ? "" : String(item.createdAt),
        paymentId: item.paymentId ?? null,
        quantity: String(item.quantity),
        amount: String(item.amount),
        subtotal: String(item.subtotal),
      }))
    : [];
  const payments: Payment[] = Array.isArray(rawPayments)
    ? rawPayments.map((item) => {
        const payment = (item as any).payment ?? item;
        return {
          ...payment,
          id: String(payment.id),
          studentId: String(payment.studentId ?? selectedStudentId),
          amount: String(payment.amount ?? "0"),
          status: String(payment.status ?? "pending"),
          createdAt: String(payment.createdAt ?? payment.paymentDate ?? ""),
          paymentDate: String(payment.paymentDate ?? payment.createdAt ?? ""),
          receiptNumber: String(payment.receiptNumber ?? "-"),
          accountBankId: String(payment.accountBankId ?? ""),
          majorId: String(payment.majorId ?? ""),
          month: String(payment.month ?? "-"),
          bendaharaId: String(payment.bendaharaId ?? ""),
          bankRef: String(payment.bankRef ?? ""),
        };
      })
    : [];

  const selectedStudent: Student | undefined = React.useMemo(
    () => (allStudents as Student[]).find((s) => s.id === selectedStudentId),
    [allStudents, selectedStudentId],
  );

  const isLoadingDetail = isLoadingBilling || isLoadingPayments;

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-3xl font-bold">Informasi Siswa</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Branch:{" "}
          <span className="text-foreground font-medium">
            {userDataMajor.name}
          </span>
          {" · "}
          <span>{(allStudents as any[]).length} siswa terdaftar</span>
        </p>
      </div>

      {/* ── Search ── */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <Label className="mb-2 block text-sm font-medium">
            Cari & Pilih Siswa
          </Label>
          {isLoadingStudents ? (
            <div className="bg-muted h-10 animate-pulse rounded-md" />
          ) : (
            <StudentCombobox
              students={allStudents as any[]}
              value={selectedStudentId}
              onValueChange={(val) => setSelectedStudentId(val)}
              placeholder="Cari berdasarkan nama, NISN, atau kelas..."
            />
          )}
        </CardContent>
      </Card>

      {/* ── Content ── */}
      {!selectedStudentId ? (
        <EmptyState />
      ) : isLoadingDetail ? (
        <div className="flex items-center justify-center py-16">
          <div className="space-y-2 text-center">
            <div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-b-2" />
            <p className="text-muted-foreground text-sm">
              Memuat data siswa...
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* ── Left: Profile Card ── */}
          <div className="lg:col-span-1">
            {selectedStudent && (
              <StudentProfileCard student={selectedStudent} />
            )}
          </div>

          {/* ── Right: Tabs ── */}
          <div className="space-y-4 lg:col-span-2">
            {/* Summary Cards */}
            <SummaryCards billingItems={billingItems} payments={payments} />

            {/* Tabs */}
            <Tabs defaultValue="billing">
              <TabsList className="w-full">
                <TabsTrigger value="billing" className="flex-1 gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Tagihan
                  {billingItems.filter((i) => !i.isPaid).length > 0 && (
                    <Badge className="bg-destructive-solid ml-1 h-4 px-1.5 text-xs text-white">
                      {billingItems.filter((i) => !i.isPaid).length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="transactions" className="flex-1 gap-1.5">
                  <Receipt className="h-3.5 w-3.5" />
                  Transaksi
                  {payments.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1 h-4 px-1.5 text-xs"
                    >
                      {payments.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <Card className="mt-3">
                <CardContent className="pt-5 pb-4">
                  <TabsContent value="billing" className="mt-0">
                    {selectedStudent && (
                      <BillingTab
                        billingItems={billingItems}
                        student={selectedStudent}
                      />
                    )}
                  </TabsContent>
                  <TabsContent value="transactions" className="mt-0">
                    <TransactionsTab payments={payments} />
                  </TabsContent>
                </CardContent>
              </Card>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Auth Wrapper ─────────────────────────────────────────────────────────────
export default function StudentInformationPage() {
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id;
  const { data: userData, isLoading: isLoadingUserData } =
    useGetUserByIdBetterAuth(userId as string);
  const userRole = userData?.role?.name;
  const userDataMajor = userData?.major;

  if (isPending || isLoadingUserData) return <Loading />;

  if (userRole !== "Admin" && userRole !== "Treasurer") {
    unauthorized();
    return null;
  }

  if (!userDataMajor) {
    return (
      <div className="mx-auto my-8 flex min-h-screen max-w-7xl items-center justify-center p-6">
        <div className="space-y-2 text-center">
          <AlertCircle className="text-destructive mx-auto h-10 w-10" />
          <p className="font-semibold">Branch belum dikonfigurasi</p>
          <p className="text-muted-foreground text-sm">
            Bendahara belum memiliki branch yang ditugaskan. Hubungi
            administrator.
          </p>
        </div>
      </div>
    );
  }

  return <StudentInformation userDataMajor={userDataMajor} />;
}

// ─── Missing import helper ────────────────────────────────────────────────────
function Label({
  children,
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> & { className?: string }) {
  return (
    <label
      className={`text-sm leading-none font-medium ${className ?? ""}`}
      {...props}
    >
      {children}
    </label>
  );
}
