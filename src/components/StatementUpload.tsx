"use client";

import { useState } from "react";
import { EXPENSE_CATEGORIES, Expense } from "@/lib/types";

interface ParsedRow {
  date: string;
  description: string;
  amount: number;
  category: string;
  include: boolean;
}

function formatTRY(value: number): string {
  return value.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
}

interface Props {
  onImport: (expenses: Expense[]) => void;
}

export default function StatementUpload({ onImport }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setWarning(null);
    setRows([]);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/parse-statement", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Ekstre işlenemedi");
      setRows(data.rows.map((r: Omit<ParsedRow, "include">) => ({ ...r, include: true })));
      if (data.warning) setWarning(data.warning);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bir hata oluştu");
    }
    setLoading(false);
  }

  function updateRow(index: number, patch: Partial<ParsedRow>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function handleImport() {
    const toImport = rows
      .filter((r) => r.include)
      .map((r): Expense => ({
        id: crypto.randomUUID(),
        date: r.date,
        category: r.category,
        amount: r.amount,
        note: r.description,
      }));
    onImport(toImport);
    setRows([]);
    setFile(null);
  }

  return (
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <h2 className="mb-2 text-lg font-semibold">Hesap Ekstresi Yükle</h2>
      <p className="mb-3 text-sm text-zinc-500">
        Kredi kartı/banka ekstreni PDF olarak yükle, işlemler otomatik ayrıştırılıp AI ile kategorize edilir.
        Sadece harcama (pozitif tutarlı) işlemler listelenir — ödeme/aktarım/iade satırları dahil edilmez.
      </p>

      <div className="flex items-center gap-2">
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-sm"
        />
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="rounded bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-black"
        >
          {loading ? "İşleniyor..." : "Yükle ve Ayrıştır"}
        </button>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {warning && <p className="mt-2 text-sm text-amber-600">⚠️ {warning}</p>}

      {rows.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-sm text-zinc-500">{rows.length} işlem bulundu. Kategorileri kontrol et, istemediklerini işaretten kaldır.</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left dark:border-zinc-800">
                  <th className="p-2"></th>
                  <th className="p-2">Tarih</th>
                  <th className="p-2">Açıklama</th>
                  <th className="p-2">Tutar</th>
                  <th className="p-2">Kategori</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b border-zinc-100 dark:border-zinc-900">
                    <td className="p-2">
                      <input type="checkbox" checked={r.include} onChange={(e) => updateRow(i, { include: e.target.checked })} />
                    </td>
                    <td className="p-2 whitespace-nowrap">{r.date.split("-").reverse().join(".")}</td>
                    <td className="p-2 max-w-[220px] truncate" title={r.description}>{r.description}</td>
                    <td className="p-2 whitespace-nowrap">{formatTRY(r.amount)}</td>
                    <td className="p-2">
                      <select
                        value={r.category}
                        onChange={(e) => updateRow(i, { category: e.target.value })}
                        className="rounded border border-zinc-300 p-1 dark:border-zinc-700 dark:bg-zinc-900"
                      >
                        {EXPENSE_CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={handleImport} className="mt-3 rounded bg-zinc-900 px-4 py-2 text-white dark:bg-zinc-100 dark:text-black">
            Seçilenleri Harcamalara Aktar ({rows.filter((r) => r.include).length})
          </button>
        </div>
      )}
    </div>
  );
}
