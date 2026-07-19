"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Expense } from "@/lib/types";

const COLORS = ["#eab308", "#f97316", "#3b82f6", "#22c55e", "#a855f7", "#ef4444", "#06b6d4", "#ec4899", "#84cc16", "#6b7280"];

function formatTRY(value: number): string {
  return value.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
}

interface Props {
  expenses: Expense[];
}

export default function ExpenseChart({ expenses }: Props) {
  const byCategory = new Map<string, number>();
  for (const e of expenses) {
    byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + e.amount);
  }
  const data = Array.from(byCategory.entries()).map(([name, value]) => ({ name, value }));

  if (data.length === 0) {
    return <p className="text-sm text-zinc-500">Henüz harcama eklenmedi.</p>;
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => formatTRY(Number(value))} />
        <Legend
          formatter={(value) => {
            const entry = data.find((d) => d.name === value);
            const percent = entry ? ((entry.value / total) * 100).toFixed(1) : "0";
            return `${value} — %${percent}`;
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
