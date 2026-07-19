"use client";

import { useEffect, useState } from "react";
import TransactionForm from "@/components/TransactionForm";
import PortfolioChart from "@/components/PortfolioChart";
import TransactionTable from "@/components/TransactionTable";
import FinancialJournal from "@/components/FinancialJournal";
import FinancialCalendar from "@/components/FinancialCalendar";
import ExpenseForm from "@/components/ExpenseForm";
import ExpenseChart from "@/components/ExpenseChart";
import ExpenseTable from "@/components/ExpenseTable";
import { Transaction, Expense, CalendarNote, ASSET_LABELS, CRYPTO_OPTIONS, FOREX_OPTIONS } from "@/lib/types";
import { addTransaction, deleteTransaction, loadTransactions, addExpense, deleteExpense, loadExpenses, addCalendarNote, deleteCalendarNote, loadCalendarNotes } from "@/lib/storage";
import { fetchLivePrices, getManualGoldPrice, setManualGoldPrice } from "@/lib/prices";
import { calculatePositions, calculateTransactionProfits, priceKey, PriceMap } from "@/lib/calculations";

function formatTRY(value: number): string {
  return value.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
}

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [calendarNotes, setCalendarNotes] = useState<CalendarNote[]>([]);
  const [prices, setPrices] = useState<PriceMap>({});
  const [goldPriceInput, setGoldPriceInput] = useState("");
  const [loadingPrices, setLoadingPrices] = useState(false);

  useEffect(() => {
    setTransactions(loadTransactions());
    setExpenses(loadExpenses());
    setCalendarNotes(loadCalendarNotes());
    const savedGold = getManualGoldPrice();
    if (savedGold) setGoldPriceInput(savedGold.toString());
  }, []);

  async function refreshPrices() {
    setLoadingPrices(true);
    try {
      const live = await fetchLivePrices();
      setPrices({ ...live, [priceKey("gold", "gram")]: getManualGoldPrice() });
    } catch {
      setPrices((prev) => ({ ...prev, [priceKey("gold", "gram")]: getManualGoldPrice() }));
    }
    setLoadingPrices(false);
  }

  useEffect(() => {
    refreshPrices();
  }, []);

  function handleAdd(t: Transaction) {
    setTransactions(addTransaction(t));
  }

  function handleDelete(id: string) {
    setTransactions(deleteTransaction(id));
  }

  function handleAddExpense(e: Expense) {
    setExpenses(addExpense(e));
  }

  function handleDeleteExpense(id: string) {
    setExpenses(deleteExpense(id));
  }

  function handleAddCalendarNote(n: CalendarNote) {
    setCalendarNotes(addCalendarNote(n));
  }

  function handleDeleteCalendarNote(id: string) {
    setCalendarNotes(deleteCalendarNote(id));
  }

  function handleGoldPriceSave() {
    const value = parseFloat(goldPriceInput);
    if (!value) return;
    setManualGoldPrice(value);
    setPrices((prev) => ({ ...prev, [priceKey("gold", "gram")]: value }));
  }

  const positions = calculatePositions(transactions, prices);
  const rows = calculateTransactionProfits(transactions, prices);
  const totalInvested = positions.reduce((sum, p) => sum + p.totalInvested, 0);
  const pricedPositions = positions.filter((p) => p.priceAvailable);
  const totalValue = pricedPositions.reduce((sum, p) => sum + p.currentValue, 0);
  const investedWithPrice = pricedPositions.reduce((sum, p) => sum + p.totalInvested, 0);
  const totalProfit = totalValue - investedWithPrice;
  const missingPricePositions = positions.filter((p) => !p.priceAvailable);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <header>
        <h1 className="text-2xl font-bold">Finansal Günlük</h1>
        <p className="text-sm text-zinc-500">Yatırım takibi ve otomatik kâr/zarar analizi</p>
      </header>

      {missingPricePositions.length > 0 && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          ⚠️ Şu varlıklar için güncel fiyat girilmedi, toplam hesaplamalara dahil edilmedi:{" "}
          {missingPricePositions.map((p) => `${ASSET_LABELS[p.assetType] ?? p.assetType} (${p.subType})`).join(", ")}.
          {" "}Altın için aşağıdaki "Güncel Fiziki Altın Alım Bedeli" alanına fiyat girip kaydet.
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm text-zinc-500">Toplam Yatırım</p>
          <p className="text-xl font-semibold">{formatTRY(totalInvested)}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm text-zinc-500">Güncel Değer</p>
          <p className="text-xl font-semibold">{formatTRY(totalValue)}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm text-zinc-500">Toplam Kâr/Zarar</p>
          <p className={`text-xl font-semibold ${totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatTRY(totalProfit)}
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2 text-sm">
            Güncel Fiziki Altın Alım Bedeli (gram, TL):
            <input
              type="number"
              step="any"
              value={goldPriceInput}
              onChange={(e) => setGoldPriceInput(e.target.value)}
              className="w-32 rounded border border-zinc-300 p-1 dark:border-zinc-700 dark:bg-zinc-900"
            />
            <button onClick={handleGoldPriceSave} className="rounded bg-zinc-900 px-3 py-1 text-white dark:bg-zinc-100 dark:text-black">
              Kaydet
            </button>
          </label>
          <button onClick={refreshPrices} disabled={loadingPrices} className="text-sm text-zinc-500 hover:underline">
            {loadingPrices ? "Fiyatlar güncelleniyor..." : "Kripto/döviz fiyatlarını yenile"}
          </button>
        </div>

        <div className="flex flex-wrap gap-4 border-t border-zinc-100 pt-3 text-sm dark:border-zinc-900">
          {CRYPTO_OPTIONS.map((c) => (
            <span key={c.id}>
              {c.label}: <strong>{formatTRY(prices[priceKey("crypto", c.id)] ?? 0)}</strong>
            </span>
          ))}
          {FOREX_OPTIONS.map((c) => (
            <span key={c.code}>
              {c.label}: <strong>{formatTRY(prices[priceKey("forex", c.code)] ?? 0)}</strong>
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="mb-2 text-lg font-semibold">Portföy Dağılımı</h2>
        <PortfolioChart positions={positions} />
      </section>

      <TransactionForm onAdd={handleAdd} />

      <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="mb-2 text-lg font-semibold">İşlemler</h2>
        <TransactionTable rows={rows} onDelete={handleDelete} />
      </section>

      <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="mb-2 text-lg font-semibold">Finansal Takvim</h2>
        <FinancialCalendar notes={calendarNotes} onAdd={handleAddCalendarNote} onDelete={handleDeleteCalendarNote} />
      </section>

      <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="mb-2 text-lg font-semibold">Finans Günlüğü</h2>
        <p className="mb-3 text-sm text-zinc-500">Yatırım kararlarının gerekçeleri, zaman akışı halinde.</p>
        <FinancialJournal transactions={transactions} />
      </section>

      <header className="mt-4 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <h1 className="text-2xl font-bold">Harcama Analizi</h1>
        <p className="text-sm text-zinc-500">Kategori bazlı harcama takibi</p>
      </header>

      <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <p className="text-sm text-zinc-500">Toplam Harcama</p>
        <p className="text-xl font-semibold">{formatTRY(totalExpenses)}</p>
      </section>

      <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="mb-2 text-lg font-semibold">Kategori Dağılımı</h2>
        <ExpenseChart expenses={expenses} />
      </section>

      <ExpenseForm onAdd={handleAddExpense} />

      <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="mb-2 text-lg font-semibold">Harcamalar</h2>
        <ExpenseTable expenses={expenses} onDelete={handleDeleteExpense} />
      </section>
    </div>
  );
}
