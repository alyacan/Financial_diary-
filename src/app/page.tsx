"use client";

import Link from "next/link";
import { useInvestments } from "@/hooks/useInvestments";
import { useExpenseData } from "@/hooks/useExpenseData";
import { ASSET_LABELS } from "@/lib/types";

function formatTRY(value: number): string {
  return value.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
}

const QUICK_LINKS = [
  { href: "/yatirimlar", label: "Yatırımlar", description: "İşlem ekle, portföyünü ve kâr/zararını gör" },
  { href: "/harcamalar", label: "Harcamalar", description: "Ekstre yükle, kategori bazlı harcamalarını takip et" },
  { href: "/gunluk", label: "Finans Günlüğüm 📓", description: "Finansal takvim ve yatırım kararlarının gerekçeleri" },
];

export default function Home() {
  const { totalInvested, totalValue, totalProfit, missingPricePositions } = useInvestments();
  const { totalExpenses } = useExpenseData();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <header>
        <h1 className="text-2xl font-bold">Finansal Günlük</h1>
        <p className="text-sm text-zinc-500">Yatırım ve harcama takibi, AI destekli analiz</p>
      </header>

      {missingPricePositions.length > 0 && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          ⚠️ Şu varlıklar için güncel fiyat girilmedi, toplam hesaplamalara dahil edilmedi:{" "}
          {missingPricePositions.map((p) => `${ASSET_LABELS[p.assetType] ?? p.assetType} (${p.subType})`).join(", ")}.
          {" "}Detaylar için <Link href="/yatirimlar" className="underline">Yatırımlar</Link> sayfasına bak.
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm text-zinc-500">Toplam Yatırım</p>
          <p className="text-xl font-semibold">{formatTRY(totalInvested)}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm text-zinc-500">Güncel Değer</p>
          <p className="text-xl font-semibold">{formatTRY(totalValue)}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm text-zinc-500">Toplam Kâr/Zarar</p>
          <p className={`text-xl font-semibold ${totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatTRY(totalProfit)}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm text-zinc-500">Toplam Harcama</p>
          <p className="text-xl font-semibold">{formatTRY(totalExpenses)}</p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {QUICK_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-lg border border-zinc-200 p-4 hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
          >
            <h2 className="text-lg font-semibold">{link.label}</h2>
            <p className="text-sm text-zinc-500">{link.description}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
