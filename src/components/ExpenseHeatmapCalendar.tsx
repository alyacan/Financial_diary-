"use client";

import { useMemo, useState } from "react";
import { Expense } from "@/lib/types";

const WEEKDAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const MONTH_NAMES = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

function toISODate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatTRY(value: number): string {
  return value.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
}

function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  return `${d}.${m}.${y}`;
}

// Günlük toplam / o dönemdeki en yüksek günlük toplama oranına göre 5 kademeli
// yoğunluk. En yüksek harcamanın yapıldığı gün en koyu, azaldıkça daha pastel.
function bucketFor(dayTotal: number, maxDayTotal: number): 0 | 1 | 2 | 3 | 4 | 5 {
  if (dayTotal <= 0 || maxDayTotal <= 0) return 0;
  const ratio = dayTotal / maxDayTotal;
  if (ratio > 0.8) return 5;
  if (ratio > 0.6) return 4;
  if (ratio > 0.4) return 3;
  if (ratio > 0.2) return 2;
  return 1;
}

const BUCKET_BG: Record<number, string> = {
  0: "var(--viz-gridline)",
  1: "var(--heat-1)",
  2: "var(--heat-2)",
  3: "var(--heat-3)",
  4: "var(--heat-4)",
  5: "var(--heat-5)",
};

const BUCKET_FG: Record<number, string> = {
  0: "var(--viz-muted)",
  1: "var(--heat-fg-1)",
  2: "var(--heat-fg-2)",
  3: "var(--heat-fg-3)",
  4: "var(--heat-fg-4)",
  5: "var(--heat-fg-5)",
};

interface Props {
  expenses: Expense[];
}

export default function ExpenseHeatmapCalendar({ expenses }: Props) {
  const dailyTotals = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of expenses) {
      map.set(e.date, (map.get(e.date) ?? 0) + e.amount);
    }
    return map;
  }, [expenses]);

  const maxDayTotal = useMemo(() => Math.max(0, ...Array.from(dailyTotals.values())), [dailyTotals]);

  const latestDate = useMemo(() => {
    if (expenses.length === 0) return new Date();
    const latestIso = expenses.reduce((max, e) => (e.date > max ? e.date : max), expenses[0].date);
    const [y, m, d] = latestIso.split("-").map(Number);
    return new Date(y, m - 1, d);
  }, [expenses]);

  const [viewYear, setViewYear] = useState(latestDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(latestDate.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  function goToMonth(offset: number) {
    const d = new Date(viewYear, viewMonth + offset, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    setSelectedDate(null);
  }

  if (expenses.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        Bu dönemde henüz harcama yok — ilk harcamanı eklediğinde burada günlere göre yoğunluk haritası oluşacak.
      </p>
    );
  }

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const leadingBlanks = (firstOfMonth.getDay() + 6) % 7;
  const cells: (number | null)[] = [
    ...Array(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const selectedExpenses = selectedDate ? expenses.filter((e) => e.date === selectedDate) : [];

  return (
    <div className="flex flex-col gap-3">
      <div className="mb-1 flex items-center justify-between">
        <button
          onClick={() => goToMonth(-1)}
          aria-label="Önceki ay"
          className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          ←
        </button>
        <span className="text-sm font-semibold tracking-tight">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          onClick={() => goToMonth(1)}
          aria-label="Sonraki ay"
          className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((w) => (
          <div key={w} className="p-1 text-center text-[11px] font-semibold tracking-wide text-zinc-400 uppercase">
            {w}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;
          const iso = toISODate(viewYear, viewMonth, day);
          const dayTotal = dailyTotals.get(iso) ?? 0;
          const bucket = bucketFor(dayTotal, maxDayTotal);
          const isSelected = selectedDate === iso;
          return (
            <button
              key={i}
              onClick={() => setSelectedDate(isSelected ? null : iso)}
              title={dayTotal > 0 ? `${formatDate(iso)} — ${formatTRY(dayTotal)}` : formatDate(iso)}
              className="flex min-h-[3rem] flex-col items-center justify-center rounded-lg text-sm transition-transform"
              style={{
                background: BUCKET_BG[bucket],
                color: BUCKET_FG[bucket],
                outline: isSelected ? "2px solid var(--viz-sequential)" : "none",
                outlineOffset: "1px",
              }}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <span>Az</span>
        {[0, 1, 2, 3, 4, 5].map((b) => (
          <span key={b} className="h-3 w-3 rounded-sm" style={{ background: BUCKET_BG[b] }} />
        ))}
        <span>Çok</span>
      </div>

      {selectedDate && (
        <div className="rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800">
          <p className="mb-2 font-semibold">{formatDate(selectedDate)}</p>
          {selectedExpenses.length === 0 ? (
            <p className="text-zinc-500">Bu gün harcama yok.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {selectedExpenses.map((e) => (
                <li key={e.id} className="flex justify-between gap-3">
                  <span>
                    {e.category}
                    {e.note ? ` — ${e.note}` : ""}
                  </span>
                  <span className="font-medium">{formatTRY(e.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
