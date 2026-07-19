import { NextResponse } from "next/server";
import { CRYPTO_OPTIONS, FOREX_OPTIONS } from "@/lib/types";
import { priceKey } from "@/lib/calculations";

export async function GET() {
  const prices: Record<string, number> = {};

  const cryptoIds = CRYPTO_OPTIONS.map((c) => c.id).join(",");
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoIds}&vs_currencies=try`
    );
    const data = await res.json();
    for (const c of CRYPTO_OPTIONS) {
      prices[priceKey("crypto", c.id)] = data[c.id]?.try ?? 0;
    }
  } catch {
    for (const c of CRYPTO_OPTIONS) prices[priceKey("crypto", c.id)] = 0;
  }

  await Promise.all(
    FOREX_OPTIONS.map(async (c) => {
      try {
        const res = await fetch(`https://api.frankfurter.app/latest?from=${c.code}&to=TRY`);
        const data = await res.json();
        prices[priceKey("forex", c.code)] = data.rates?.TRY ?? 0;
      } catch {
        prices[priceKey("forex", c.code)] = 0;
      }
    })
  );

  // Ons altın (USD) fiyatını çekip USD/TRY kuruyla gram başına TL'ye çeviriyoruz.
  // Not: Bu COMEX vadeli işlem fiyatıdır (spot'a çok yakın), kuyumcu satış fiyatındaki
  // işçilik/prim dahil değildir — referans niteliğindedir.
  try {
    const usdTry = prices[priceKey("forex", "USD")];
    const res = await fetch("https://query1.finance.yahoo.com/v8/finance/chart/GC=F", {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const data = await res.json();
    const ouncePriceUsd = data.chart?.result?.[0]?.meta?.regularMarketPrice;
    if (ouncePriceUsd && usdTry) {
      const GRAMS_PER_TROY_OUNCE = 31.1034768;
      prices[priceKey("gold", "gram")] = (ouncePriceUsd / GRAMS_PER_TROY_OUNCE) * usdTry;
    } else {
      prices[priceKey("gold", "gram")] = 0;
    }
  } catch {
    prices[priceKey("gold", "gram")] = 0;
  }

  return NextResponse.json(prices);
}
