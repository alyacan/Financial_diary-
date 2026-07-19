const MANUAL_PRICES_KEY = "financial-diary-manual-prices";

export async function fetchLivePrices(): Promise<Record<string, number>> {
  const res = await fetch("/api/prices");
  if (!res.ok) throw new Error("Fiyatlar alınamadı");
  return res.json();
}

function loadManualPrices(): Record<string, number> {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(MANUAL_PRICES_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, number>;
  } catch {
    return {};
  }
}

export function getManualPrice(key: string): number {
  return loadManualPrices()[key] ?? 0;
}

export function setManualPrice(key: string, price: number): void {
  if (typeof window === "undefined") return;
  const prices = loadManualPrices();
  prices[key] = price;
  window.localStorage.setItem(MANUAL_PRICES_KEY, JSON.stringify(prices));
}
