"use client";

import { useState } from "react";
import Link from "next/link";
import { ArchivedPeriod } from "@/lib/types";

function formatTRY(value: number): string {
  return value.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
}

function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  return `${d}.${m}.${y}`;
}

interface Props {
  period: ArchivedPeriod;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Pick<ArchivedPeriod, "name" | "note" | "startDate" | "endDate">>) => void;
}

export default function ArchivedPeriodCard({ period, onDelete, onUpdate }: Props) {
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(period.name ?? "");
  const [startInput, setStartInput] = useState(period.startDate);
  const [endInput, setEndInput] = useState(period.endDate);

  function startEdit() {
    setNameInput(period.name ?? "");
    setStartInput(period.startDate);
    setEndInput(period.endDate);
    setEditing(true);
  }

  function saveEdit() {
    if (startInput > endInput) {
      window.alert("Başlangıç tarihi, bitiş tarihinden sonra olamaz.");
      return;
    }
    onUpdate(period.id, {
      name: nameInput.trim() ? nameInput.trim() : undefined,
      startDate: startInput,
      endDate: endInput,
    });
    setEditing(false);
  }

  function handleDelete() {
    const confirmed = window.confirm(
      "Bu arşivlenmiş dönemi tamamen silmek istediğine emin misin? Bu işlem geri alınamaz."
    );
    if (confirmed) onDelete(period.id);
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-zinc-300 p-3 text-left dark:border-zinc-700">
        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          İsim (opsiyonel)
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Örn: Temmuz ayı"
            className="rounded border border-zinc-300 p-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Başlangıç
          <input
            type="date"
            value={startInput}
            onChange={(e) => setStartInput(e.target.value)}
            className="rounded border border-zinc-300 p-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Bitiş
          <input
            type="date"
            value={endInput}
            onChange={(e) => setEndInput(e.target.value)}
            className="rounded border border-zinc-300 p-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <div className="flex gap-2">
          <button
            onClick={saveEdit}
            className="flex-1 rounded bg-zinc-900 px-2 py-1 text-xs text-white dark:bg-zinc-100 dark:text-black"
          >
            Kaydet
          </button>
          <button
            onClick={() => setEditing(false)}
            className="flex-1 rounded border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700"
          >
            Vazgeç
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative rounded-lg border border-zinc-200 p-3 text-center hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-600 dark:hover:bg-zinc-900">
      <div className="absolute top-1 right-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={startEdit}
          aria-label="Düzenle"
          title="İsim/tarih düzenle"
          className="flex h-6 w-6 items-center justify-center rounded-full text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700"
        >
          ✏️
        </button>
        <button
          onClick={handleDelete}
          aria-label="Sil"
          title="Dönemi sil"
          className="flex h-6 w-6 items-center justify-center rounded-full text-xs hover:bg-red-100 dark:hover:bg-red-950"
        >
          🗑️
        </button>
      </div>
      <Link href={`/harcamalar/donem/${period.id}`} className="flex flex-col items-center gap-1">
        <span className="text-4xl">📁</span>
        <span className="text-sm font-medium leading-tight">
          {period.name ? period.name : `${formatDate(period.startDate)} - ${formatDate(period.endDate)}`}
        </span>
        {period.name && (
          <span className="text-[11px] text-zinc-400">
            {formatDate(period.startDate)} - {formatDate(period.endDate)}
          </span>
        )}
        <span className="text-xs text-zinc-500">
          {period.expenses.length} harcama · {formatTRY(period.expenses.reduce((sum, e) => sum + e.amount, 0))}
        </span>
      </Link>
    </div>
  );
}
