"use client";

import { useEffect, useState } from "react";
import { Transaction, GOLD_SUBTYPES } from "@/lib/types";
import { addTransaction, deleteTransaction, loadTransactions } from "@/lib/storage";
import { fetchLivePrices, getManualPrice, setManualPrice } from "@/lib/prices";
import { calculatePositions, calculateTransactionProfits, priceKey, PriceMap } from "@/lib/calculations";

// Ons altından otomatik çekilen "gram" dışındaki fiziki altın türleri: kuyumcu primi/likidite
// farkı içerdiği için canlı veri yerine manuel giriş kullanılır.
export const MANUAL_GOLD_SUBTYPES = GOLD_SUBTYPES.filter((g) => g.id !== "gram");

export interface FundCategoryBreakdown {
  category: string;
  totalInvested: number;
}

export function useInvestments() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [prices, setPrices] = useState<PriceMap>({});
  const [manualGoldInputs, setManualGoldInputs] = useState<Record<string, string>>({});
  const [manualFundInputs, setManualFundInputs] = useState<Record<string, string>>({});
  const [loadingPrices, setLoadingPrices] = useState(false);

  useEffect(() => {
    const loaded = loadTransactions();
    setTransactions(loaded);

    const initialGold: Record<string, string> = {};
    for (const g of MANUAL_GOLD_SUBTYPES) {
      const saved = getManualPrice(priceKey("gold", g.id));
      if (saved) initialGold[g.id] = saved.toString();
    }
    setManualGoldInputs(initialGold);

    const initialFund: Record<string, string> = {};
    for (const code of new Set(loaded.filter((t) => t.assetType === "fund").map((t) => t.subType))) {
      const saved = getManualPrice(priceKey("fund", code));
      if (saved) initialFund[code] = saved.toString();
    }
    setManualFundInputs(initialFund);
  }, []);

  function manualPrices(txs: Transaction[]): PriceMap {
    const result: PriceMap = {};
    for (const g of MANUAL_GOLD_SUBTYPES) {
      result[priceKey("gold", g.id)] = getManualPrice(priceKey("gold", g.id));
    }
    for (const code of new Set(txs.filter((t) => t.assetType === "fund").map((t) => t.subType))) {
      result[priceKey("fund", code)] = getManualPrice(priceKey("fund", code));
    }
    return result;
  }

  async function refreshPrices() {
    setLoadingPrices(true);
    try {
      const live = await fetchLivePrices();
      setPrices({ ...live, ...manualPrices(transactions) });
    } catch {
      setPrices((prev) => ({ ...prev, ...manualPrices(transactions) }));
    }
    setLoadingPrices(false);
  }

  useEffect(() => {
    refreshPrices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions.length]);

  function handleAdd(t: Transaction) {
    setTransactions(addTransaction(t));
  }

  function handleDelete(id: string) {
    setTransactions(deleteTransaction(id));
  }

  function handleManualGoldSave(subTypeId: string) {
    const value = parseFloat(manualGoldInputs[subTypeId] ?? "");
    if (!value) return;
    setManualPrice(priceKey("gold", subTypeId), value);
    setPrices((prev) => ({ ...prev, [priceKey("gold", subTypeId)]: value }));
  }

  function handleManualFundSave(fundCode: string) {
    const value = parseFloat(manualFundInputs[fundCode] ?? "");
    if (!value) return;
    setManualPrice(priceKey("fund", fundCode), value);
    setPrices((prev) => ({ ...prev, [priceKey("fund", fundCode)]: value }));
  }

  const positions = calculatePositions(transactions, prices);
  const rows = calculateTransactionProfits(transactions, prices);
  const totalInvested = positions.reduce((sum, p) => sum + p.totalInvested, 0);
  const pricedPositions = positions.filter((p) => p.priceAvailable);
  const totalValue = pricedPositions.reduce((sum, p) => sum + p.currentValue, 0);
  const investedWithPrice = pricedPositions.reduce((sum, p) => sum + p.totalInvested, 0);
  const totalProfit = totalValue - investedWithPrice;
  const missingPricePositions = positions.filter((p) => !p.priceAvailable);

  // Fon Dağılımı: fiyattan bağımsız, kategoriye göre yatırılan tutar (birden fazla farklı
  // fon aynı kategoride olabilir — bu yüzden positions'daki fon-kodu bazlı gruplamayı değil,
  // ham işlemleri kullanır).
  const fundTransactions = transactions.filter((t) => t.assetType === "fund");
  const distinctFundCodes = Array.from(new Set(fundTransactions.map((t) => t.subType)));
  const fundCategoryMap = new Map<string, number>();
  for (const t of fundTransactions) {
    const category = t.fundCategory ?? t.subType;
    fundCategoryMap.set(category, (fundCategoryMap.get(category) ?? 0) + t.quantity * t.buyPrice);
  }
  const fundCategoryBreakdown: FundCategoryBreakdown[] = Array.from(fundCategoryMap.entries()).map(
    ([category, totalInvested]) => ({ category, totalInvested })
  );
  const totalFundInvested = fundCategoryBreakdown.reduce((sum, f) => sum + f.totalInvested, 0);

  return {
    transactions,
    prices,
    manualGoldInputs,
    setManualGoldInputs,
    manualFundInputs,
    setManualFundInputs,
    distinctFundCodes,
    loadingPrices,
    refreshPrices,
    handleAdd,
    handleDelete,
    handleManualGoldSave,
    handleManualFundSave,
    positions,
    rows,
    totalInvested,
    totalValue,
    totalProfit,
    missingPricePositions,
    fundCategoryBreakdown,
    totalFundInvested,
  };
}
