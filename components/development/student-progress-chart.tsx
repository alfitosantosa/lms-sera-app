"use client";

import { isLogEntry, type TimelineEntryDTO } from "@/app/(types)";
import { useGetScales } from "@/app/(hooks)/hooks/Development/useDevelopmentConfig";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CHART_GRID_STROKE, CHART_PALETTE } from "@/lib/charts";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type StudentProgressChartProps = {
  entries: TimelineEntryDTO[];
};

type MonthPoint = {
  period: string;
  sortKey: string;
} & Record<string, number | string>;

/**
 * Grafik perkembangan per area (PRD §59).
 *
 * Sumbu Y memakai `value` dari baris `AssessmentScale`, sehingga labelnya selalu
 * berasal dari database (bukan kode skala hardcode). Nilai per bulan diambil
 * dari observasi terakhir pada bulan itu.
 */
export function StudentProgressChart({ entries }: StudentProgressChartProps) {
  const { data: scales = [] } = useGetScales({ isActive: true });

  const valueByScaleId = new Map(scales.map((s) => [s.id, s.value] as const));
  const scaleLabelByValue = new Map(
    scales.map((s) => [s.value, s.label] as const),
  );

  const months = new Map<string, MonthPoint>();
  const areas = new Set<string>();

  // Observasi terakhir per area per bulan: iterasi dari yang terlama.
  const chronological = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  for (const entry of chronological) {
    if (!isLogEntry(entry)) continue;
    const date = new Date(entry.date);
    const key = format(date, "yyyy-MM");
    for (const observation of entry.observations) {
      if (!observation.scale) continue;
      const value = valueByScaleId.get(observation.scale.id);
      if (value === undefined) continue;
      const area = observation.area ?? "Umum";
      areas.add(area);

      const point = months.get(key) ?? {
        period: format(date, "MMM yyyy", { locale: localeId }),
        sortKey: key,
      };
      point[area] = value;
      months.set(key, point);
    }
  }

  const data = [...months.values()].sort((a, b) =>
    a.sortKey.localeCompare(b.sortKey),
  );
  const areaList = [...areas];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Grafik Perkembangan</CardTitle>
        <CardDescription className="text-xs">
          Nilai terakhir per area pengembangan setiap bulan
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 || areaList.length === 0 ? (
          <p className="text-muted-foreground py-10 text-center text-sm">
            Belum ada data perkembangan yang bisa digambarkan.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={data}
              margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
              <XAxis
                dataKey="period"
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={70}
                domain={["dataMin - 1", "dataMax + 1"]}
                tickFormatter={(value: number) =>
                  scaleLabelByValue.get(value) ?? String(value)
                }
              />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              {areaList.map((area, index) => (
                <Line
                  key={area}
                  type="monotone"
                  dataKey={area}
                  stroke={CHART_PALETTE[index % CHART_PALETTE.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
