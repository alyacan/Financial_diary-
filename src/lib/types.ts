export type AssetType =
  | "gold"
  | "crypto"
  | "forex"
  | "fund"
  | "stock"
  | "bank"
  | "time_deposit"
  | "deposit"
  | "cash";

export const ASSET_LABELS: Record<string, string> = {
  gold: "Altın",
  crypto: "Kripto",
  forex: "Döviz",
  fund: "Fon",
  stock: "Hisse",
  bank: "Banka",
  time_deposit: "Vadeli Hesap",
  deposit: "Mevduat",
  cash: "Nakit",
};

// Bunlar için kâr/zarar hesaplanmaz — sadece bakiye olarak portföye eklenir.
export const BALANCE_ONLY_TYPES: AssetType[] = ["bank", "time_deposit", "deposit", "cash"];

export const CRYPTO_OPTIONS = [
  { id: "bitcoin", label: "Bitcoin (BTC)" },
  { id: "ethereum", label: "Ethereum (ETH)" },
] as const;

export const FOREX_OPTIONS = [
  { code: "USD", label: "Amerikan Doları (USD)" },
  { code: "EUR", label: "Euro (EUR)" },
] as const;

export const GOLD_SUBTYPES = [
  { id: "gram", label: "Gram Altın" },
  { id: "ceyrek", label: "Çeyrek Altın" },
  { id: "cumhuriyet", label: "Cumhuriyet Altını" },
] as const;

export const FUND_CATEGORIES = [
  "Likit Fon",
  "Teknoloji Ağırlıklı",
  "Yabancı Hisse Ağırlıklı",
  "BIST 100",
  "BIST 30 Dışı",
  "Hisse Senedi Yoğun",
  "Bankacılık",
  "Yarı İletkenler",
  "Gayrimenkul",
  "Temiz Enerji",
  "Sağlık Hizmetleri",
  "Diğer",
] as const;

export interface Transaction {
  id: string;
  assetType: AssetType;
  subType: string; // gold: "gram" | crypto coin id | forex currency code
  date: string; // YYYY-MM-DD
  quantity: number; // gram / adet / birim
  buyPrice: number; // TL per unit
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
