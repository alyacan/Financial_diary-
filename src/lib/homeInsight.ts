import { ArchivedPeriod, Expense } from "./types";
import { categoryBreakdown } from "./periodStats";

export interface HomeInsight {
  title: string;
  detail: string;
}

function formatTRY(value: number): string {
  return value.toLocaleString("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });
}

// Ana sayfadaki "AI Analiz" bandı: yapay zekâ çağrısı yapmaz, mevcut dönemin
// kategori dağılımını en son kapatılan dönemle karşılaştıran basit, gerçek
// verilere dayalı bir kıyaslamadır (diğer "yaklaşık" istatistikler gibi).
export function computeHomeInsight(currentExpenses: Expense[], archivedPeriods: ArchivedPeriod[]): HomeInsight | null {
  const currentBreakdown = categoryBreakdown(currentExpenses);
  const lastPeriod = archivedPeriods[archivedPeriods.length - 1];

  if (!lastPeriod) {
    if (currentBreakdown.length === 0) return null;
    const top = currentBreakdown[0];
    return {
      title: `Bu dönem en çok ${top.category} kategorisinde harcadın`,
      detail: `${formatTRY(top.total)} · toplam harcamanın %${Math.round(top.percent)}'i — detaylar için Harcamalar sayfasına bak`,
    };
  }

  const lastBreakdown = categoryBreakdown(lastPeriod.expenses);
  const lastByCategory = new Map(lastBreakdown.map((c) => [c.category, c.total]));

  if (currentBreakdown.length === 0) return null;

  let biggestIncrease: { category: string; cur: number; prev: number; percent: number } | null = null;
  let biggestDecrease: { category: string; cur: number; prev: number; percent: number } | null = null;

  for (const c of currentBreakdown) {
    const prev = lastByCategory.get(c.category) ?? 0;
    if (prev <= 0) continue;
    const percent = ((c.total - prev) / prev) * 100;
    if (c.total > prev && (!biggestIncrease || c.total - prev > biggestIncrease.cur - biggestIncrease.prev)) {
      biggestIncrease = { category: c.category, cur: c.total, prev, percent };
    }
    if (c.total < prev && (!biggestDecrease || prev - c.total > biggestDecrease.prev - biggestDecrease.cur)) {
      biggestDecrease = { category: c.category, cur: c.total, prev, percent };
    }
  }

  if (biggestIncrease) {
    return {
      title: `${biggestIncrease.category} harcaman önceki döneme göre %${Math.round(biggestIncrease.percent)} arttı`,
      detail: `${formatTRY(biggestIncrease.prev)} → ${formatTRY(biggestIncrease.cur)} — detaylı içgörü için Harcamalar sayfasına bak`,
    };
  }
  if (biggestDecrease) {
    return {
      title: `${biggestDecrease.category} harcaman önceki döneme göre %${Math.round(Math.abs(biggestDecrease.percent))} azaldı`,
      detail: `${formatTRY(biggestDecrease.prev)} → ${formatTRY(biggestDecrease.cur)} — detaylı içgörü için Harcamalar sayfasına bak`,
    };
  }

  const top = currentBreakdown[0];
  return {
    title: `Bu dönem en çok ${top.category} kategorisinde harcadın`,
    detail: `${formatTRY(top.total)} · toplam harcamanın %${Math.round(top.percent)}'i — detaylar için Harcamalar sayfasına bak`,
  };
}
