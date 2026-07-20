"use client";

import { useEffect, useState } from "react";
import { Transaction, GOLD_SUBTYPES } from "@/lib/types";
import { addTransaction, deleteTransaction, loadTransactions } from "@/lib/storage";
import { fetchLivePrices, getManualPrice, setManualPrice } from "@/lib/prices";
import { calculatePositions, calculateTransactionProfits, priceKey, PriceMap } from "@/lib/calculations";

// Ons altından otomatik çekilen "gram" dışındaki fiziki altın türleri: kuyumcu primi/likidite
// farkı içerdiği için canlı veri yerine manuel giriş kullanılır.
export const MANUAL_GOLD_SUBTYPES = GOLD_SUBTYPES.filter((g) => g.id !== "gram");

export function useInvestments() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [prices, setPrices] = useState<PriceMap>({});
  const [manualGoldInputs, setManualGoldInputs] = useState<Record<string, string>>({});
  const [loadingPrices, setLoadingPrices] = useState(false);

  useEffect(() => {
    setTransactions(loadTransactions());
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
  const fundPositions = positions.filter((p) => p.assetType === "fund");
  const totalFundInvested = fundPositions.reduce((sum, p) => sum + p.totalInvested, 0);

  return {
    transactions,
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
  };
}
