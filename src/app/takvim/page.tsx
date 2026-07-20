"use client";

import FinancialCalendar from "@/components/FinancialCalendar";
import { useCalendarNotes } from "@/hooks/useCalendarNotes";

export default function TakvimPage() {
  const { calendarNotes, handleAddCalendarNote, handleDeleteCalendarNote } = useCalendarNotes();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <header>
        <h1 className="text-2xl font-bold">Finansal Takvim</h1>
        <p className="text-sm text-zinc-500">Düzenli tekrar eden ekonomik olaylar ve kendi eklediğin tarihler</p>
      </header>

      <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <FinancialCalendar notes={calendarNotes} onAdd={handleAddCalendarNote} onDelete={handleDeleteCalendarNote} />
      </section>
    </div>
  );
}
