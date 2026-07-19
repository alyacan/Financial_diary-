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
import StatementUpload from "@/components/StatementUpload";
import { Transaction, Expense, CalendarNote, ASSET_LABELS, CRYPTO_OPTIONS, FOREX_OPTIONS, GOLD_SUBTYPES } from "@/lib/types";
import { addTransaction, deleteTransaction, loadTransactions, addExpense, addExpenses, deleteExpense, loadExpenses, addCalendarNote, deleteCalendarNote, loadCalendarNotes } from "@/lib/storage";
import { fetchLivePrices, getManualPrice, setManualPrice } from "@/lib/prices";
import { calculatePositions, calculateTransactionProfits, priceKey, PriceMap } from "@/lib/calculations";

// Ons altından otomatik çekilen "gram" dışındaki fiziki altın türleri: kuyumcu primi/likidite
// farkı içerdiği için canlı veri yerine manuel giriş kullanılır.
const MANUAL_GOLD_SUBTYPES = GOLD_SUBTYPES.filter((g) => g.id !== "gram");

function formatTRY(value: number): string {
  return value.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
}

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [calendarNotes, setCalendarNotes] = useState<CalendarNote[]>([]);
  const [prices, setPrices] = useState<PriceMap>({});
  const [manualGoldInputs, setManualGoldInputs] = useState<Record<string, string>>({});
  const [loadingPrices, setLoadingPrices] = useState(false);

  useEffect(() => {
    setTransactions(loadTransactions());
    setExpenses(loadExpenses());
    setCalendarNotes(loadCalendarNotes());
    const initial: Record<string, string> = {};
    for (const g of MANUAL_GOLD_SUBTYPES) {
      const saved = getManualPrice(priceKey("gold", g.id));
      if (saved) initial[g.id] = saved.toString();
    }
    setManualGoldInputs(initial);
  }, []);

  function manualGoldPrices(): PriceMap {
    const result: PriceMap = {};
    for (const g of MANUAL_GOLD_SUBTYPES) {
      result[priceKey("gold", g.id)] = getManualPrice(priceKey("gold", g.id));
    }
    return result;
  }

  async function refreshPrices() {
    setLoadingPrices(true);
    try {
      const live = await fetchLivePrices();
      setPrices({ ...live, ...manualGoldPrices() });
    } catch {
      setPrices((prev) => ({ ...prev, ...manualGoldPrices() }));
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

  function handleImportExpenses(newExpenses: Expense[]) {
    setExpenses(addExpenses(newExpenses));
  }

  function handleAddCalendarNote(n: CalendarNote) {
    setCalendarNotes(addCalendarNote(n));
  }

  function handleDeleteCalendarNote(id: string) {
    setCalendarNotes(deleteCalendarNote(id));
  }

  function handleManualGoldSave(subTypeId: string) {
    const value = parseFloat(manualGoldInputs[subTypeId] ?? "");
    if (!value) return;
    setManualPrice(priceKey("gold", subTypeId), value);
    setPrices((prev) => ({ ...prev, [priceKey("gold", subTypeId)]: value }));
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
  const fundPositions = positions.filter((p) => p.assetType === "fund");
  const totalFundInvested = fundPositions.reduce((sum, p) => sum + p.totalInvested, 0);

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
          {" "}Çeyrek/Cumhuriyet altın için aşağıdaki alana, fon/hisse için ise henüz otomatik/manuel fiyat girişi bulunmuyor.
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
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Canlı Fiyatlar</h2>
          <button onClick={refreshPrices} disabled={loadingPrices} className="text-sm text-zinc-500 hover:underline">
            {loadingPrices ? "Fiyatlar güncelleniyor..." : "Yenile"}
          </button>
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <span>
            Gram Altın (referans, ons altından hesaplanır): <strong>{formatTRY(prices[priceKey("gold", "gram")] ?? 0)}</strong>
          </span>
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
        <p className="text-xs text-zinc-400">
          Not: Gram altın fiyatı uluslararası ons altın vadeli işlem fiyatından hesaplanan bir referanstır; kuyumcu satış fiyatından (işçilik/prim dahil) farklı olabilir.
        </p>

        <div className="flex flex-wrap gap-4 border-t border-zinc-100 pt-3 dark:border-zinc-900">
          {MANUAL_GOLD_SUBTYPES.map((g) => (
            <label key={g.id} className="flex items-center gap-2 text-sm">
              {g.label} Güncel Alım Bedeli (TL):
              <input
                type="number"
                step="any"
                value={manualGoldInputs[g.id] ?? ""}
                onChange={(e) => setManualGoldInputs((prev) => ({ ...prev, [g.id]: e.target.value }))}
                className="w-28 rounded border border-zinc-300 p-1 dark:border-zinc-700 dark:bg-zinc-900"
              />
              <button onClick={() => handleManualGoldSave(g.id)} className="rounded bg-zinc-900 px-3 py-1 text-white dark:bg-zinc-100 dark:text-black">
                Kaydet
              </button>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="mb-2 text-lg font-semibold">Portföy Dağılımı</h2>
        <PortfolioChart positions={positions} />
      </section>

      {fundPositions.length > 0 && (
        <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="mb-2 text-lg font-semibold">Fon Dağılımı</h2>
          <p className="mb-3 text-sm text-zinc-500">
            Fonlar için henüz canlı/manuel güncel fiyat girişi yok — bu yüzden yatırılan tutara göre dağılım gösteriliyor (kâr/zarar değil).
          </p>
          <ul className="flex flex-col gap-2">
            {fundPositions.map((p) => {
              const percent = totalFundInvested > 0 ? (p.totalInvested / totalFundInvested) * 100 : 0;
              return (
                <li key={p.subType} className="flex items-center justify-between rounded border border-zinc-200 p-2 text-sm dark:border-zinc-800">
                  <span>{p.subType}</span>
                  <span>{formatTRY(p.totalInvested)} — %{percent.toFixed(1)}</span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

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

      <StatementUpload onImport={handleImportExpenses} />

      <ExpenseForm onAdd={handleAddExpense} />

      <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="mb-2 text-lg font-semibold">Harcamalar</h2>
        <ExpenseTable expenses={expenses} onDelete={handleDeleteExpense} />
      </section>
    </div>
  );
}
