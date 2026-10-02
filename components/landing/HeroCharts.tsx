"use client";

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

/* One place to change colors. If your theme does not expose tokens as
   `--color-*` variables, switch these to `var(--success-strong)` etc. */
const COLOR = {
  success: "var(--color-success-strong)",
  warning: "var(--color-warning-strong)",
  info: "var(--color-info-strong)",
  destructive: "var(--color-destructive-strong)",
};

const presensiConfig = {
  H: { label: "Hadir", color: COLOR.success },
  S: { label: "Sakit", color: COLOR.warning },
  I: { label: "Izin", color: COLOR.info },
  A: { label: "Alfa", color: COLOR.destructive },
} satisfies ChartConfig;

const sppConfig = {
  LUNAS: { label: "Lunas", color: COLOR.success },
  MENUNGGU: { label: "Menunggu", color: COLOR.warning },
  TUNGGAKAN: { label: "Tunggakan", color: COLOR.destructive },
} satisfies ChartConfig;

type PresensiDatum = { mark: "H" | "S" | "I" | "A"; count: number };
type SppDatum = {
  nama: string;
  spp: number;
  status: "LUNAS" | "MENUNGGU" | "TUNGGAKAN";
};

const rupiah = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

export function HeroCharts({
  presensi,
  spp,
}: {
  presensi: PresensiDatum[];
  spp: SppDatum[];
}) {
  const total = presensi.reduce((sum, d) => sum + d.count, 0);
  const hadir = presensi.find((d) => d.mark === "H")?.count ?? 0;

  const presensiData = presensi.map((d) => ({
    ...d,
    fill: `var(--color-${d.mark})`,
  }));
  const sppData = spp.map((d) => ({ ...d, fill: `var(--color-${d.status})` }));

  return (
    <div className="border-border grid gap-4 border-b p-4 md:grid-cols-5">
      <div className="border-border rounded-2xl border p-4 md:col-span-2">
        <h3 className="text-foreground text-sm font-semibold">
          Kehadiran pekan ini
        </h3>
        <p className="text-muted-foreground text-xs">
          Satu catatan per siswa per jadwal.
        </p>

        <div className="relative mt-2">
          <ChartContainer
            config={presensiConfig}
            className="mx-auto aspect-square h-[170px]"
          >
            <PieChart>
              <ChartTooltip
                content={<ChartTooltipContent nameKey="mark" hideLabel />}
              />
              <Pie
                data={presensiData}
                dataKey="count"
                nameKey="mark"
                innerRadius={50}
                outerRadius={78}
                paddingAngle={3}
                strokeWidth={0}
              />
            </PieChart>
          </ChartContainer>
          <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
            <span className="text-foreground text-xl font-semibold tabular-nums">
              {hadir}/{total}
            </span>
            <span className="text-muted-foreground text-xs">hadir</span>
          </div>
        </div>

        <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
          {presensi.map((d) => (
            <li key={d.mark} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="size-2.5 rounded-full"
                style={{ backgroundColor: presensiConfig[d.mark].color }}
              />
              <span className="text-muted-foreground">
                {presensiConfig[d.mark].label}
              </span>
              <span className="text-foreground ml-auto font-medium tabular-nums">
                {d.count}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-border rounded-2xl border p-4 md:col-span-3">
        <h3 className="text-foreground text-sm font-semibold">
          SPP bulan ini per siswa
        </h3>
        <p className="text-muted-foreground text-xs">
          Warna batang mengikuti status pembayaran.
        </p>

        <ChartContainer config={sppConfig} className="mt-3 h-[210px] w-full">
          <BarChart
            data={sppData}
            layout="vertical"
            margin={{ left: 0, right: 56 }}
          >
            <YAxis
              dataKey="nama"
              type="category"
              tickLine={false}
              axisLine={false}
              width={72}
              tick={{ fontSize: 12 }}
            />
            <XAxis type="number" dataKey="spp" hide />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideIndicator
                  formatter={(value, _name, item) => (
                    <span className="flex w-full items-center justify-between gap-4">
                      <span className="text-muted-foreground">
                        {
                          sppConfig[
                            (item.payload as SppDatum)
                              .status as keyof typeof sppConfig
                          ].label
                        }
                      </span>
                      <span className="font-medium tabular-nums">
                        {rupiah(Number(value))}
                      </span>
                    </span>
                  )}
                />
              }
            />
            <Bar dataKey="spp" radius={6} barSize={20}>
              {sppData.map((d) => (
                <Cell key={d.nama} fill={d.fill} />
              ))}
              <LabelList
                dataKey="spp"
                position="right"
                className="fill-foreground text-xs"
                formatter={(v) => {
                  const num = typeof v === "number" ? v : Number(v) || 0;
                  return `${Math.round(num / 1000)}rb`;
                }}
              />
            </Bar>
          </BarChart>
        </ChartContainer>

        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
          {(Object.keys(sppConfig) as (keyof typeof sppConfig)[]).map((key) => (
            <li key={key} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="size-2.5 rounded-full"
                style={{ backgroundColor: sppConfig[key].color }}
              />
              <span className="text-muted-foreground">
                {sppConfig[key].label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
