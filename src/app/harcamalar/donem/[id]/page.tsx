"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArchivedPeriod, ASSET_LABELS, Transaction } from "@/lib/types";
import { loadArchivedPeriods, loadTransactions } from "@/lib/storage";
import { computePeriodStats, transactionsInPeriod } from "@/lib/periodStats";
import ExpenseChart from "@/components/ExpenseChart";
import ExpenseTable from "@/components/ExpenseTable";
import AiAnalysisPackage from "@/components/AiAnalysisPackage";

function formatTRY(value: number): string {
  return value.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
}

function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  return `${d}.${m}.${y}`;
}

export default function ArchivedPeriodPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [allPeriods, setAllPeriods] = useState<ArchivedPeriod[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setAllPeriods(loadArchivedPeriods());
    setTransactions(loadTransactions());
    setLoaded(true);
  }, []);

  const period = allPeriods.find((p) => p.id === id);

  if (!loaded) return null;

  if (!period) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-4 p-6">
        <p className="text-sm text-zinc-500">Bu dönem bulunamadı.</p>
        <Link href="/harcamalar" className="text-sm underline">
          Harcamalar sayfasına dön
        </Link>
      </div>
    );
  }

  const stats = computePeriodStats(period, allPeriods);
  const periodTransactions = transactionsInPeriod(transactions, period);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <Link href="/harcamalar" className="text-sm text-zinc-500 hover:underline">
          ← Harcamalar
        </Link>
        <h1 className="text-2xl font-bold">
          {formatDate(period.startDate)} - {formatDate(period.endDate)}
        </h1>
        <p className="text-sm text-zinc-500">Arşivlenen dönem detayı</p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm text-zinc-500">Toplam Harcama</p>
          <p className="text-xl font-semibold">{formatTRY(stats.totalExpense)}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm text-zinc-500">Harcama Sayısı</p>
          <p className="text-xl font-semibold">{stats.expenseCount}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm text-zinc-500">Ortalama Harcama</p>
          <p className="text-xl font-semibold">{formatTRY(stats.averageExpense)}</p>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="mb-2 text-lg font-semibold">Kategori Dağılımı</h2>
        <ExpenseChart expenses={period.expenses} />
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="mb-2 text-lg font-semibold">En Büyük Harcamalar</h2>
          {stats.biggestExpenses.length === 0 ? (
            <p className="text-sm text-zinc-500">Kayıt yok.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {stats.biggestExpenses.map((e) => (
                <li key={e.id} className="flex justify-between border-b border-zinc-100 pb-1 dark:border-zinc-900">
                  <span>{formatDate(e.date)} — {e.category}{e.note ? ` (${e.note})` : ""}</span>
                  <span className="font-medium">{formatTRY(e.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="mb-2 text-lg font-semibold">Tekrarlayan Harcamalar</h2>
          <p className="mb-2 text-xs text-zinc-400">
            Yaklaşık bir tahmindir: aynı açıklamanın önceki dönemlerde veya bu dönemde birden fazla kez geçmesine dayanır.
          </p>
          {stats.recurringExpenses.length === 0 ? (
            <p className="text-sm text-zinc-500">Tespit edilmedi.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {stats.recurringExpenses.map((e) => (
                <li key={e.id} className="flex justify-between border-b border-zinc-100 pb-1 dark:border-zinc-900">
                  <span>{formatDate(e.date)} — {e.category}{e.note ? ` (${e.note})` : ""}</span>
                  <span className="font-medium">{formatTRY(e.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800 sm:col-span-2">
          <h2 className="mb-2 text-lg font-semibold">Beklenmeyen Harcamalar</h2>
          <p className="mb-2 text-xs text-zinc-400">
            Yaklaşık bir tahmindir: dönem ortalamasının belirgin üzerinde olan, tekrarlayan sayılmayan harcamalardır.
          </p>
          {stats.unexpectedExpenses.length === 0 ? (
            <p className="text-sm text-zinc-500">Tespit edilmedi.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {stats.unexpectedExpenses.map((e) => (
                <li key={e.id} className="flex justify-between border-b border-zinc-100 pb-1 dark:border-zinc-900">
                  <span>{formatDate(e.date)} — {e.category}{e.note ? ` (${e.note})` : ""}</span>
                  <span className="font-medium">{formatTRY(e.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="mb-2 text-lg font-semibold">Tüm Harcamalar</h2>
        <ExpenseTable expenses={period.expenses} />
      </section>

      {periodTransactions.length > 0 && (
        <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="mb-2 text-lg font-semibold">Yatırım İşlemleri</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left dark:border-zinc-800">
                  <th className="p-2">Tarih</th>
                  <th className="p-2">Varlık</th>
                  <th className="p-2">Miktar</th>
                  <th className="p-2">Alış Fiyatı</th>
                  <th className="p-2">Tutar</th>
                </tr>
              </thead>
              <tbody>
                {periodTransactions.map((t) => (
                  <tr key={t.id} className="border-b border-zinc-100 dark:border-zinc-900">
                    <td className="p-2">{formatDate(t.date)}</td>
                    <td className="p-2">{ASSET_LABELS[t.assetType] ?? t.assetType} ({t.subType})</td>
                    <td className="p-2">{t.quantity}</td>
                    <td className="p-2">{formatTRY(t.buyPrice)}</td>
                    <td className="p-2">{formatTRY(t.quantity * t.buyPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <AiAnalysisPackage period={period} allPeriods={allPeriods} periodTransactions={periodTransactions} />
    </div>
  );
}
