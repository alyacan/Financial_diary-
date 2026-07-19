"use client";

import { useState } from "react";
import { CalendarNote, RECURRING_CALENDAR_INFO } from "@/lib/types";

function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  return `${d}.${m}.${y}`;
}

interface Props {
  notes: CalendarNote[];
  onAdd: (note: CalendarNote) => void;
  onDelete: (id: string) => void;
}

export default function FinancialCalendar({ notes, onAdd, onDelete }: Props) {
  const [date, setDate] = useState("");
  const [text, setText] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date || !text) return;
    onAdd({ id: crypto.randomUUID(), date, text });
    setDate("");
    setText("");
  }

  const sortedNotes = [...notes].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="flex flex-col gap-4">
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
