import { BALANCE_ONLY_TYPES, Transaction } from "./types";

export type PriceMap = Record<string, number>; // key: `${assetType}:${subType}` -> current unit price TRY

export function priceKey(assetType: string, subType: string): string {
  return `${assetType}:${subType}`;
}

// Banka/Vadeli Hesap/Mevduat/Nakit için kâr/zarar hesaplanmaz — bakiye kendi başına "fiyat" kabul edilir.
function resolvePrice(assetType: string, key: string, prices: PriceMap): { currentPrice: number; priceAvailable: boolean } {
  if (BALANCE_ONLY_TYPES.includes(assetType as Transaction["assetType"])) {
    return { currentPrice: 1, priceAvailable: true };
  }
  const currentPrice = prices[key] ?? 0;
  return { currentPrice, priceAvailable: currentPrice > 0 };
}

export interface PositionSummary {
  assetType: string;
  subType: string;
  totalQuantity: number;
  totalInvested: number;
  averageCost: number;
  currentPrice: number;
  currentValue: number;
  totalProfit: number;
  profitPercent: number;
  priceAvailable: boolean;
}

export interface TransactionProfit {
  transaction: Transaction;
  currentPrice: number;
  currentValue: number;
  cost: number;
  profit: number;
  profitPercent: number;
  priceAvailable: boolean;
}

function transactionCost(t: Transaction): number {
  return t.quantity * t.buyPrice;
}

export function calculatePositions(
  transactions: Transaction[],
  prices: PriceMap
): PositionSummary[] {
  const groups = new Map<string, Transaction[]>();
  for (const t of transactions) {
    const key = priceKey(t.assetType, t.subType);
    groups.set(key, [...(groups.get(key) ?? []), t]);
  }

  return Array.from(groups.entries()).map(([key, txs]) => {
    const [assetType, subType] = key.split(":");
    const totalQuantity = txs.reduce((sum, t) => sum + t.quantity, 0);
    const totalInvested = txs.reduce((sum, t) => sum + transactionCost(t), 0);
    const averageCost = totalQuantity > 0 ? totalInvested / totalQuantity : 0;
    const { currentPrice, priceAvailable } = resolvePrice(assetType, key, prices);
    const currentValue = totalQuantity * currentPrice;
    const totalProfit = currentValue - totalInvested;
    const profitPercent = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

    return {
      assetType,
      subType,
      totalQuantity,
      totalInvested,
      averageCost,
      currentPrice,
      currentValue,
      totalProfit,
      profitPercent,
      priceAvailable,
    };
  });
}

export function calculateTransactionProfits(
  transactions: Transaction[],
  prices: PriceMap
): TransactionProfit[] {
  return transactions.map((t) => {
    const { currentPrice, priceAvailable } = resolvePrice(t.assetType, priceKey(t.assetType, t.subType), prices);
    const cost = transactionCost(t);
    const currentValue = t.quantity * currentPrice;
    const profit = currentValue - cost;
    const profitPercent = cost > 0 ? (profit / cost) * 100 : 0;
    return { transaction: t, currentPrice, currentValue, cost, profit, profitPercent, priceAvailable };
  });
}
