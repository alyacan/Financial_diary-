const GOLD_PRICE_KEY = "financial-diary-gold-price";

export async function fetchLivePrices(): Promise<Record<string, number>> {
  const res = await fetch("/api/prices");
  if (!res.ok) throw new Error("Fiyatlar alınamadı");
  return res.json();
}

export function getManualGoldPrice(): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(GOLD_PRICE_KEY);
  return raw ? parseFloat(raw) : 0;
}

export function setManualGoldPrice(price: number): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GOLD_PRICE_KEY, price.toString());
}
