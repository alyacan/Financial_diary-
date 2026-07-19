export type AssetType = "gold" | "crypto" | "forex";

export const ASSET_LABELS: Record<string, string> = {
  gold: "Altın",
  crypto: "Kripto",
  forex: "Döviz",
};

export const CRYPTO_OPTIONS = [
  { id: "bitcoin", label: "Bitcoin (BTC)" },
  { id: "ethereum", label: "Ethereum (ETH)" },
] as const;

export const FOREX_OPTIONS = [
  { code: "USD", label: "Amerikan Doları (USD)" },
  { code: "EUR", label: "Euro (EUR)" },
] as const;

export interface Transaction {
  id: string;
  assetType: AssetType;
  subType: string; // gold: "gram" | crypto coin id | forex currency code
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  quantity: number; // gram / adet / birim
  buyPrice: number; // TL per unit
  commission?: number;
  note?: string;
}

export const EXPENSE_CATEGORIES = [
  "Market",
  "Yemek",
  "Ulaşım",
  "Eğlence",
  "Spor",
  "Eğitim",
  "Kira",
  "Faturalar",
  "Sağlık",
  "Diğer",
] as const;

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  category: string;
  amount: number;
  note?: string;
}

export interface CalendarNote {
  id: string;
  date: string; // YYYY-MM-DD
  text: string;
}

export const RECURRING_CALENDAR_INFO = [
  "TCMB PPK (Para Politikası Kurulu) faiz kararı — genelde ayın ortasında, önceden ilan edilen bir Perşembe günü açıklanır.",
  "TÜİK enflasyon (TÜFE) verisi — genelde her ayın ilk haftasında açıklanır.",
  "FED (ABD Merkez Bankası) FOMC faiz kararı — yaklaşık 6 haftada bir toplanır.",
  "Bilanço/kâr açıklama dönemleri — çeyrek sonlarını takip eden birkaç hafta içinde yoğunlaşır.",
] as const;
