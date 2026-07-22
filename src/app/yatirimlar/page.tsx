"use client";

import TransactionForm from "@/components/TransactionForm";
import PortfolioChart from "@/components/PortfolioChart";
import TransactionTable from "@/components/TransactionTable";
import { useInvestments, MANUAL_GOLD_SUBTYPES } from "@/hooks/useInvestments";
import { ASSET_LABELS, CRYPTO_OPTIONS, FOREX_OPTIONS, tefasUrl } from "@/lib/types";
import { priceKey } from "@/lib/calculations";

function formatTRY(value: number): string {
  return value.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
}

export default function YatirimlarPage() {
  const {
    prices,
    manualGoldInputs,
    setManualGoldInputs,
    manualFundInputs,
    setManualFundInputs,
    manualFundReturnInputs,
    setManualFundReturnInputs,
    manualFundRiskInputs,
    setManualFundRiskInputs,
    fundMetadata,
    distinctFundCodes,
    loadingPrices,
    refreshPrices,
    handleAdd,
    handleDelete,
    handleManualGoldSave,
    handleManualFundSave,
    handleManualFundMetadataSave,
    positions,
    rows,
    totalInvested,
    totalValue,
    totalProfit,
    missingPricePositions,
    fundCategoryBreakdown,
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
          {" "}Çeyrek/Cumhuriyet altın ve Fon için aşağıdaki alanlara güncel fiyat girebilirsin; Hisse için henüz fiyat girişi yok.
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

        {distinctFundCodes.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-900">
            <p className="text-xs text-zinc-400">
              Fon fiyatları TEFAS&apos;ın bot korumasından dolayı otomatik çekilemiyor — linke tıklayıp gerçek güncel fiyatı gördükten sonra elle gir. Aynı TEFAS sayfasında fonun yıllık getirisi ve risk değeri (1-7) de yer alır, istersen onları da aşağıya girebilirsin.
            </p>
            <div className="flex flex-col gap-3">
              {distinctFundCodes.map((code) => {
                const meta = fundMetadata[code] ?? {};
                return (
                  <div key={code} className="flex flex-col gap-2 rounded border border-zinc-100 p-2 dark:border-zinc-900">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <a href={tefasUrl(code)} target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-900 dark:hover:text-zinc-100">
                        {code} ↗
                      </a>
                      Güncel Fiyat (TL):
                      <input
                        type="number"
                        step="any"
                        value={manualFundInputs[code] ?? ""}
                        onChange={(e) => setManualFundInputs((prev) => ({ ...prev, [code]: e.target.value }))}
                        className="w-28 rounded border border-zinc-300 p-1 dark:border-zinc-700 dark:bg-zinc-900"
                      />
                      <button onClick={() => handleManualFundSave(code)} className="rounded bg-zinc-900 px-3 py-1 text-white dark:bg-zinc-100 dark:text-black">
                        Kaydet
                      </button>
                      {(meta.annualReturnPercent !== undefined || meta.riskLevel !== undefined) && (
                        <span className="text-xs text-zinc-500">
                          {meta.annualReturnPercent !== undefined && `Yıllık Getiri: %${meta.annualReturnPercent}`}
                          {meta.annualReturnPercent !== undefined && meta.riskLevel !== undefined && " · "}
                          {meta.riskLevel !== undefined && `Risk: ${meta.riskLevel}/7`}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      Yıllık Getiri (%):
                      <input
                        type="number"
                        step="any"
                        value={manualFundReturnInputs[code] ?? ""}
                        onChange={(e) => setManualFundReturnInputs((prev) => ({ ...prev, [code]: e.target.value }))}
                        className="w-24 rounded border border-zinc-300 p-1 dark:border-zinc-700 dark:bg-zinc-900"
                      />
                      Risk Seviyesi (1-7):
                      <select
                        value={manualFundRiskInputs[code] ?? ""}
                        onChange={(e) => setManualFundRiskInputs((prev) => ({ ...prev, [code]: e.target.value }))}
                        className="rounded border border-zinc-300 p-1 dark:border-zinc-700 dark:bg-zinc-900"
                      >
                        <option value="">—</option>
                        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                      <button onClick={() => handleManualFundMetadataSave(code)} className="rounded bg-zinc-900 px-3 py-1 text-white dark:bg-zinc-100 dark:text-black">
                        Kaydet
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="mb-2 text-lg font-semibold">Portföy Dağılımı</h2>
        <PortfolioChart positions={positions} />
      </section>

      {fundCategoryBreakdown.length > 0 && (
        <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="mb-2 text-lg font-semibold">Fon Dağılımı (Kategoriye Göre)</h2>
          <p className="mb-3 text-sm text-zinc-500">
            Yatırılan tutara göre kategori dağılımı (kâr/zarar için yukarıdaki fon bazlı güncel fiyat girişini kullan).
          </p>
          <ul className="flex flex-col gap-2">
            {fundCategoryBreakdown.map((f) => {
              const percent = totalFundInvested > 0 ? (f.totalInvested / totalFundInvested) * 100 : 0;
              return (
                <li key={f.category} className="flex items-center justify-between rounded border border-zinc-200 p-2 text-sm dark:border-zinc-800">
                  <span>{f.category}</span>
                  <span>{formatTRY(f.totalInvested)} — %{percent.toFixed(1)}</span>
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
