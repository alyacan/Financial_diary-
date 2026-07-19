"use client";

import { useState } from "react";
import { CalendarNote, RECURRING_CALENDAR_INFO } from "@/lib/types";

const WEEKDAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const MONTH_NAMES = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  return `${d}.${m}.${y}`;
}

function toISODate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

interface Props {
  notes: CalendarNote[];
  onAdd: (note: CalendarNote) => void;
  onDelete: (id: string) => void;
}

export default function FinancialCalendar({ notes, onAdd, onDelete }: Props) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed
  const [date, setDate] = useState("");
  const [text, setText] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date || !text) return;
    onAdd({ id: crypto.randomUUID(), date, text });
    setDate("");
    setText("");
  }

  function goToMonth(offset: number) {
    const d = new Date(viewYear, viewMonth + offset, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }

  const notesByDate = new Map<string, CalendarNote[]>();
  for (const n of notes) {
    notesByDate.set(n.date, [...(notesByDate.get(n.date) ?? []), n]);
  }

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  // JS getDay(): 0=Sun..6=Sat. Convert to Monday-start offset (0=Mon..6=Sun).
  const leadingBlanks = (firstOfMonth.getDay() + 6) % 7;

  const todayISO = toISODate(today.getFullYear(), today.getMonth(), today.getDate());
  const cells: (number | null)[] = [
    ...Array(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const sortedNotes = [...notes].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <button onClick={() => goToMonth(-1)} className="rounded px-2 py-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">←</button>
          <span className="font-semibold">{MONTH_NAMES[viewMonth]} {viewYear}</span>
          <button onClick={() => goToMonth(1)} className="rounded px-2 py-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">→</button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs text-zinc-500">
          {WEEKDAYS.map((w) => (
            <div key={w} className="p-1 font-medium">{w}</div>
          ))}
          {cells.map((day, i) => {
            if (day === null) return <div key={i} />;
            const iso = toISODate(viewYear, viewMonth, day);
            const dayNotes = notesByDate.get(iso) ?? [];
            const isToday = iso === todayISO;
            return (
              <button
                key={i}
                onClick={() => setDate(iso)}
                className={`flex min-h-[3.5rem] flex-col items-center rounded border p-1 text-xs ${
                  isToday ? "border-zinc-900 dark:border-zinc-100" : "border-zinc-200 dark:border-zinc-800"
                } ${date === iso ? "bg-zinc-100 dark:bg-zinc-800" : ""} hover:bg-zinc-50 dark:hover:bg-zinc-900`}
              >
                <span className={isToday ? "font-bold" : ""}>{day}</span>
                {dayNotes.length > 0 && (
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500" title={dayNotes.map((n) => n.text).join(", ")} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-zinc-500">Genel Bilgi (spesifik tarih değil, düzenli tekrar eden olaylar)</h3>
        <ul className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
          {RECURRING_CALENDAR_INFO.map((info, i) => (
            <li key={i}>• {info}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-zinc-500">Senin Eklediğin Tarihler (resmi/gerçek ilan edilmiş tarihler)</h3>
        {sortedNotes.length === 0 ? (
          <p className="text-sm text-zinc-500">Henüz eklenmedi.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {sortedNotes.map((n) => (
              <li key={n.id} className="flex items-start justify-between gap-2 rounded border border-zinc-200 p-2 text-sm dark:border-zinc-800">
                <span><strong>{formatDate(n.date)}</strong> — {n.text}</span>
                <button onClick={() => onDelete(n.id)} className="shrink-0 text-zinc-400 hover:text-red-600">Sil</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="flex flex-col gap-1 text-sm">
          Tarih
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="rounded border border-zinc-300 p-2 dark:border-zinc-700 dark:bg-zinc-900" />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Not
          <input type="text" value={text} onChange={(e) => setText(e.target.value)}
            placeholder="Örn: TCMB PPK toplantısı"
            className="rounded border border-zinc-300 p-2 dark:border-zinc-700 dark:bg-zinc-900" />
        </label>
        <button type="submit" className="rounded bg-zinc-900 px-4 py-2 text-white dark:bg-zinc-100 dark:text-black">
          Ekle
        </button>
      </form>
    </div>
  );
}
