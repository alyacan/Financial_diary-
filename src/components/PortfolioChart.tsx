"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, Tooltip, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { PositionSummary } from "@/lib/calculations";
import { ASSET_LABELS } from "@/lib/types";

function formatCompactTRY(value: number): string {
  return `${Math.round(value).toLocaleString("tr-TR")} ₺`;
}

function formatTRY(value: number): string {
  return value.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
}

interface Props {
  positions: PositionSummary[];
}

export default function PortfolioChart({ positions }: Props) {
  const data = positions
    .filter((p) => p.currentValue > 0)
    .map((p) => ({
      name: `${ASSET_LABELS[p.assetType] ?? p.assetType} (${p.subType})`,
      value: p.currentValue,
    }))
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return <p className="text-sm text-zinc-500">Henüz görüntülenecek pozisyon yok.</p>;
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const chartHeight = Math.max(data.length * 40, 120);

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 56, left: 8, bottom: 4 }}>
        <CartesianGrid horizontal={false} stroke="var(--viz-gridline)" />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          width={160}
          tickLine={false}
          axisLine={{ stroke: "var(--viz-gridline)" }}
          tick={{ fill: "var(--viz-text-secondary)", fontSize: 12 }}
        />
        <Tooltip
          cursor={{ fill: "var(--viz-gridline)", opacity: 0.4 }}
          formatter={(value) => [
            `${formatTRY(Number(value))} (%${((Number(value) / total) * 100).toFixed(1)})`,
            "Değer",
          ]}
        />
        <Bar dataKey="value" fill="var(--viz-sequential)" barSize={20} radius={[0, 4, 4, 0]}>
          {data.map((_, i) => (
            <Cell key={i} />
          ))}
          <LabelList
            dataKey="value"
            position="right"
            formatter={(value) => formatCompactTRY(Number(value))}
            fill="var(--viz-text-secondary)"
            fontSize={12}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
