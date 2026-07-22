const MANUAL_PRICES_KEY = "financial-diary-manual-prices";
const FUND_METADATA_KEY = "financial-diary-fund-metadata";

// TEFAS canlı veri çekmeye karşı korumalı olduğu için (bkz. README), fon fiyatı gibi
// yıllık getiri/risk seviyesi de kullanıcı tarafından TEFAS sayfasına bakılarak elle girilir.
export interface FundMetadata {
  annualReturnPercent?: number;
  riskLevel?: number; // TEFAS/SPK risk değeri ölçeği: 1 (en düşük) - 7 (en yüksek)
}

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

function loadFundMetadataMap(): Record<string, FundMetadata> {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(FUND_METADATA_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, FundMetadata>;
  } catch {
    return {};
  }
}

export function getFundMetadata(fundCode: string): FundMetadata {
  return loadFundMetadataMap()[fundCode] ?? {};
}

export function setFundMetadata(fundCode: string, metadata: FundMetadata): void {
  if (typeof window === "undefined") return;
  const all = loadFundMetadataMap();
  all[fundCode] = metadata;
  window.localStorage.setItem(FUND_METADATA_KEY, JSON.stringify(all));
}
