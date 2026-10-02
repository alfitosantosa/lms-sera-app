"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function FinanceSection() {
  const router = useRouter();

  const handleRegisterFoundation = () => {
    router.push("/landing/register/foundation");
  };

  const chain = [
    {
      model: "PaymentType",
      isi: "Jenis tagihan: SPP bulanan (isMonthly), uang gedung, seragam, ujian — beserta tarif amount.",
    },
    {
      model: "PaymentItems",
      isi: "Rincian komponen yang menyusun satu tagihan, termasuk jumlah dan subtotal per item.",
    },
    {
      model: "Payment",
      isi: "Tagihan per siswa: amount, month, dueDate, status, accountBankId, dan receiptNumber.",
    },
    {
      model: "AccountBank",
      isi: "Rekening kas penerima. Satu cabang punya rekeningnya sendiri lewat branchId.",
    },
    {
      model: "PaymentTransaction",
      isi: "Jejak transaksi gateway: orderId, grossAmount, transactionStatus, fraudStatus, transactionTime.",
    },
  ];

  const lifecycle = [
    {
      key: "pending",
      label: "Menunggu",
      card: "border-warning-border bg-warning-surface",
      chip: "border-warning-border bg-background text-warning-strong",
      bar: "bg-warning-strong",
      note: "Tagihan terbit, belum ada pembayaran masuk.",
    },
    {
      key: "transfer",
      label: "Terverifikasi",
      card: "border-info-border bg-info-surface",
      chip: "border-info-border bg-background text-info-strong",
      bar: "bg-info-strong",
      note: "Bendahara mencocokkan transfer lewat bankRef dan transferDate sebelum menandai lunas.",
    },
    {
      key: "paid",
      label: "Lunas",
      card: "border-success-border bg-success-surface",
      chip: "border-success-border bg-background text-success-strong",
      bar: "bg-success-strong",
      note: "Kwitansi PDF terbit dengan receiptNumber unik.",
    },
    {
      key: "overdue",
      label: "Terlambat",
      card: "border-destructive-border bg-destructive-surface",
      chip: "border-destructive-border bg-background text-destructive-strong",
      bar: "bg-destructive-strong",
      note: "Lewat dueDate; pengingat WhatsApp dikirim ke orang tua.",
    },
  ];

  return (
    <section id="keuangan" className="bg-background py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-[68ch]">
          <h2 className="text-foreground text-3xl font-semibold tracking-tight">
            Keuangan cabang: tagihan, transfer, dan kwitansi dalam satu buku.
          </h2>
          <p className="text-secondary-foreground mt-3 text-base leading-relaxed">
            Bendahara tidak lagi mencocokkan mutasi bank dengan spreadsheet.
            Setiap tagihan lahir dari jenis tagihan cabang, dibayar lewat
            Midtrans atau transfer manual, lalu ditutup dengan kwitansi
            bernomor.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Rantai tagihan */}
          <div className="border-border bg-card rounded-3xl border p-6 lg:col-span-7 lg:p-8">
            <h3 className="text-foreground text-lg font-semibold tracking-tight">
              Rantai tagihan
            </h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Lima catatan yang saling terhubung, dari tarif sampai transaksi.
            </p>

            <ol className="border-primary/30 mt-8 ml-4 border-l-2">
              {chain.map((row, idx) => (
                <li key={row.model} className="relative pb-7 pl-9 last:pb-0">
                  <span
                    aria-hidden="true"
                    className="bg-primary text-primary-foreground absolute top-0 -left-4 flex size-8 items-center justify-center rounded-full text-sm font-semibold tabular-nums"
                  >
                    {idx + 1}
                  </span>
                  <span className="bg-accent text-foreground inline-block rounded-md px-2 py-0.5 font-mono text-xs">
                    {row.model}
                  </span>
                  <p className="text-secondary-foreground mt-2 max-w-[56ch] text-sm leading-relaxed">
                    {row.isi}
                  </p>
                </li>
              ))}
            </ol>

            <p className="text-muted-foreground border-border mt-8 border-t pt-4 text-xs leading-relaxed">
              Pembayaran online diproses Midtrans (Snap dan CoreApi);
              kwitansinya dirender sebagai PDF dengan{" "}
              <span className="font-mono">@react-pdf/renderer</span>.
            </p>
          </div>

          {/* Status pembayaran */}
          <div className="border-border bg-card rounded-3xl border p-6 lg:col-span-5 lg:p-8">
            <h3 className="text-foreground text-lg font-semibold tracking-tight">
              Status pembayaran
            </h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Setiap tagihan berpindah warna sesuai posisinya.
            </p>

            <div
              aria-hidden="true"
              className="mt-6 flex h-2 gap-1 overflow-hidden rounded-full"
            >
              {lifecycle.map((stage) => (
                <span key={stage.key} className={`flex-1 ${stage.bar}`} />
              ))}
            </div>

            <ul className="mt-6 space-y-3">
              {lifecycle.map((stage) => (
                <li
                  key={stage.key}
                  className={`rounded-2xl border p-4 ${stage.card}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${stage.chip}`}
                    >
                      {stage.label}
                    </span>
                    <span className="text-muted-foreground font-mono text-xs">
                      {stage.key}
                    </span>
                  </div>
                  <p className="text-foreground/80 mt-2 text-sm leading-relaxed">
                    {stage.note}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-primary mt-6 flex flex-wrap items-center justify-between gap-6 rounded-3xl p-8 lg:p-10">
          <div className="max-w-[52ch]">
            <p className="text-primary-foreground text-xl font-semibold tracking-tight">
              Rekening kas, jenis tagihan, dan kwitansi terpisah per cabang.
            </p>
            <p className="text-primary-foreground/80 mt-2 text-sm leading-relaxed">
              Yayasan tetap melihat rekap gabungannya.
            </p>
          </div>
          <Button
            onClick={handleRegisterFoundation}
            className="bg-background text-foreground hover:bg-background/90 h-11 px-6 text-sm font-semibold"
          >
            Daftarkan yayasan Anda
          </Button>
        </div>
      </div>
    </section>
  );
}
