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
