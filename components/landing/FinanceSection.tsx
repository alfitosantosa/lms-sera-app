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
      cls: "border-warning-border bg-warning-surface text-warning-strong",
      note: "Tagihan terbit, belum ada pembayaran masuk.",
    },
    {
      key: "transfer",
      label: "Terverifikasi",
      cls: "border-info-border bg-info-surface text-info-strong",
      note: "Bendahara mencocokkan transfer lewat bankRef dan transferDate sebelum menandai lunas.",
    },
    {
      key: "paid",
      label: "Lunas",
      cls: "border-success-border bg-success-surface text-success-strong",
      note: "Kwitansi PDF terbit dengan receiptNumber unik.",
    },
    {
      key: "overdue",
      label: "Terlambat",
      cls: "border-destructive-border bg-destructive-surface text-destructive-strong",
      note: "Lewat dueDate; pengingat WhatsApp dikirim ke orang tua.",
    },
  ];

  return (
    <section id="keuangan" className="bg-background py-24">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-muted-foreground text-sm">Keuangan cabang</p>

        <div className="mt-4 max-w-[68ch]">
          <h2 className="text-foreground text-3xl font-semibold tracking-tight">
            Tagihan, transfer, dan kwitansi dalam satu buku.
          </h2>
          <p className="text-secondary-foreground mt-3 max-w-[68ch] text-base leading-relaxed">
            Bendahara tidak lagi mencocokkan mutasi bank dengan spreadsheet.
            Setiap tagihan lahir dari jenis tagihan cabang, dibayar lewat
            Midtrans atau transfer manual, lalu ditutup dengan kwitansi bernomor.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="border-border bg-card rounded-3xl border p-6">
              <h3 className="text-foreground text-sm font-semibold">
                Rantai tagihan
              </h3>

              <table className="mt-5 w-full text-left text-sm">
                <thead>
                  <tr className="border-border text-muted-foreground border-b">
                    <th className="py-2.5 pr-4 text-xs font-medium">Tahap</th>
                    <th className="py-2.5 text-xs font-medium">Isi catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {chain.map((row, idx) => (
                    <tr
                      key={row.model}
                      className="border-border odd:bg-accent/60 border-b last:border-b-0 align-top"
                    >
                      <td className="py-3 pr-4 whitespace-nowrap">
                        <span className="text-muted-foreground tabular-nums">
                          {idx + 1}.
                        </span>{" "}
                        <span className="text-foreground font-mono text-xs">
                          {row.model}
                        </span>
                      </td>
                      <td className="text-secondary-foreground py-3 text-xs leading-relaxed">
                        {row.isi}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p className="text-muted-foreground mt-4 text-xs">
                Pembayaran online diproses Midtrans (Snap dan CoreApi);
                kwitansinya dirender sebagai PDF dengan{" "}
                <span className="font-mono">@react-pdf/renderer</span>.
              </p>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="border-border bg-card rounded-3xl border p-6">
              <h3 className="text-foreground text-sm font-semibold">
                Status pembayaran
              </h3>

              <ul className="mt-5 space-y-4">
                {lifecycle.map((stage) => (
                  <li
                    key={stage.key}
                    className="border-border border-b pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs font-medium ${stage.cls}`}
                      >
                        {stage.label}
                      </span>
                      <span className="text-muted-foreground font-mono text-xs">
                        {stage.key}
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                      {stage.note}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="border-border bg-card mt-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border p-6">
          <p className="text-muted-foreground max-w-[68ch] text-xs">
            Rekening kas, jenis tagihan, dan kwitansi terpisah per cabang —
            yayasan tetap melihat rekap gabungannya.
          </p>
          <Button
            onClick={handleRegisterFoundation}
            className="bg-primary hover:bg-primary-hover text-primary-foreground h-11 px-6 text-sm font-semibold"
          >
            Daftarkan yayasan Anda
          </Button>
        </div>
      </div>
    </section>
  );
}
