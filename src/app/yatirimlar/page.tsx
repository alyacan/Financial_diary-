"use client";

import TransactionForm from "@/components/TransactionForm";
import PortfolioChart from "@/components/PortfolioChart";
import TransactionTable from "@/components/TransactionTable";
import { useInvestments, MANUAL_GOLD_SUBTYPES } from "@/hooks/useInvestments";
import { ASSET_LABELS, CRYPTO_OPTIONS, FOREX_OPTIONS } from "@/lib/types";
import { priceKey } from "@/lib/calculations";

function formatTRY(value: number): string {
  return value.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
}

export default function YatirimlarPage() {
  const {
    prices,
    manualGoldInputs,
    setManualGoldInputs,
    loadingPrices,
    refreshPrices,
    handleAdd,
    handleDelete,
    handleManualGoldSave,
    positions,
    rows,
    totalInvested,
    totalValue,
    totalProfit,
    missingPricePositions,
    fundPositions,
    totalFundInvested,
  } = useInvestments();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <header>
        <h1 className="text-2xl font-bold">Yatırımlar</h1>
        <p className="text-sm text-zinc-500">İşlem takibi ve otomatik kâr/zarar analizi</p>
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
    </div>
  );
}
