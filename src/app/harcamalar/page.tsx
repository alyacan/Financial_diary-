"use client";

import Link from "next/link";
import ExpenseForm from "@/components/ExpenseForm";
import ExpenseChart from "@/components/ExpenseChart";
import ExpenseTable from "@/components/ExpenseTable";
import ExpenseHeatmapCalendar from "@/components/ExpenseHeatmapCalendar";
import StatementUpload from "@/components/StatementUpload";
import { useExpenseData } from "@/hooks/useExpenseData";

function formatTRY(value: number): string {
  return value.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
}

function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  return `${d}.${m}.${y}`;
}

export default function HarcamalarPage() {
  const {
    expenses,
    handleAddExpense,
    handleDeleteExpense,
    handleImportExpenses,
    totalExpenses,
    archivedPeriods,
    handleClosePeriod,
  } = useExpenseData();

  function onClosePeriod() {
    if (expenses.length === 0) return;
    const confirmed = window.confirm(
      "Mevcut dönemi kapatmak istediğine emin misin? Harcamaların silinmeyecek, arşive taşınacak ve ana ekran yeni dönem için temizlenecek."
    );
    if (confirmed) handleClosePeriod();
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Harcama Analizi</h1>
          <p className="text-sm text-zinc-500">Kategori bazlı harcama takibi</p>
        </div>
        <button
          onClick={onClosePeriod}
          disabled={expenses.length === 0}
          className="rounded border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          📁 Dönemi Kapat / Klasörle
        </button>
      </header>

      <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <p className="text-sm text-zinc-500">Toplam Harcama</p>
        <p className="text-xl font-semibold">{formatTRY(totalExpenses)}</p>
      </section>

      <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="mb-2 text-lg font-semibold">Kategori Dağılımı</h2>
        <ExpenseChart expenses={expenses} />
      </section>

      <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="text-lg font-semibold">Harcama Yoğunluk Takvimi</h2>
        <p className="mb-3 text-xs text-zinc-500">
          Finansal Takvim&apos;den bağımsızdır — yalnızca bu dönemin geçmiş harcamalarını, günlere göre tutar
          yoğunluğuyla (koyu = yüksek harcama, pastel = düşük harcama) gösterir. Bir güne tıklayarak o günün
          harcamalarını görebilirsin.
        </p>
        <ExpenseHeatmapCalendar expenses={expenses} />
      </section>

      <StatementUpload existingExpenses={expenses} onImport={handleImportExpenses} />

      <ExpenseForm onAdd={handleAddExpense} />

      <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="mb-2 text-lg font-semibold">Harcamalar</h2>
        <ExpenseTable expenses={expenses} onDelete={handleDeleteExpense} />
      </section>

      {archivedPeriods.length > 0 && (
        <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="mb-3 text-lg font-semibold">Arşivlenen Dönemler ({archivedPeriods.length})</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {[...archivedPeriods].reverse().map((period) => (
              <Link
                key={period.id}
                href={`/harcamalar/donem/${period.id}`}
                className="flex flex-col items-center gap-1 rounded-lg border border-zinc-200 p-3 text-center hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
              >
                <span className="text-4xl">📁</span>
                <span className="text-sm font-medium leading-tight">
                  {formatDate(period.startDate)} - {formatDate(period.endDate)}
                </span>
                <span className="text-xs text-zinc-500">
                  {period.expenses.length} harcama · {formatTRY(period.expenses.reduce((sum, e) => sum + e.amount, 0))}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
