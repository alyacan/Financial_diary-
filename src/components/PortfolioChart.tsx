"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { PositionSummary } from "@/lib/calculations";

const COLORS = ["#eab308", "#f97316", "#3b82f6", "#22c55e", "#a855f7", "#ef4444"];

const ASSET_LABELS: Record<string, string> = {
  gold: "Altın",
  crypto: "Kripto",
  forex: "Döviz",
};

interface Props {
  positions: PositionSummary[];
}

export default function PortfolioChart({ positions }: Props) {
  const data = positions
    .filter((p) => p.currentValue > 0)
    .map((p) => ({
      name: `${ASSET_LABELS[p.assetType] ?? p.assetType} (${p.subType})`,
      value: p.currentValue,
    }));

  if (data.length === 0) {
    return <p className="text-sm text-zinc-500">Henüz görüntülenecek pozisyon yok.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => Number(value).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
