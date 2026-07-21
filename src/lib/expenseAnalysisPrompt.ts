import { ArchivedPeriod, ASSET_LABELS, Transaction } from "./types";
import { computePeriodStats } from "./periodStats";

export const ANALYSIS_TYPES = [
  "Genel finans analizi",
  "Tasarruf önerileri",
  "Harcama alışkanlıkları",
  "Finansal hedef planı",
  "Yatırım odaklı değerlendirme",
  "Gereksiz harcamaları tespit et",
] as const;

export const AI_ROLES = [
  "Finans danışmanı",
  "Bütçe koçu",
  "Davranışsal finans uzmanı",
  "CFO",
  "Sert ve eleştirel",
] as const;

export const DETAIL_LEVELS = ["Kısa", "Orta", "Çok detaylı"] as const;

export interface PromptWizardAnswers {
  analysisType: string;
  role: string;
  detailLevel: string;
  focus: string;
}

const DETAIL_LEVEL_INSTRUCTIONS: Record<string, string> = {
  "Kısa": "Yanıtın kısa ve öz olsun: en fazla 3-4 madde, gereksiz açıklama yapma.",
  "Orta": "Yanıtın orta uzunlukta olsun: ana bulguları madde madde açıkla, kısa gerekçelerle destekle.",
  "Çok detaylı": "Yanıtın çok detaylı olsun: her bulguyu sayısal verilerle destekle, alt başlıklar kullan, mümkünse aksiyon adımları ve öncelik sıralaması ekle.",
};

function formatTRY(value: number): string {
  return value.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
}

function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  return `${d}.${m}.${y}`;
}

export function buildExpenseAnalysisPrompt(
  answers: PromptWizardAnswers,
  period: ArchivedPeriod,
  allPeriods: ArchivedPeriod[],
  periodTransactions: Transaction[]
): string {
  const stats = computePeriodStats(period, allPeriods);
  const detailInstruction = DETAIL_LEVEL_INSTRUCTIONS[answers.detailLevel] ?? DETAIL_LEVEL_INSTRUCTIONS["Orta"];

  const lines: string[] = [];
  lines.push(`Sen deneyimli bir ${answers.role.toLowerCase()} gibi davran.`);
  lines.push(
    `Görevin: ${formatDate(period.startDate)} - ${formatDate(period.endDate)} tarihleri arasındaki finansal verilerimi "${answers.analysisType.toLowerCase()}" odağıyla analiz etmek.`
  );
  lines.push(`Ekte paylaştığım Word dosyasında bu döneme ait tüm harcama kayıtlarını, kategori dağılımını, yatırım işlemlerini ve temel istatistikleri bulacaksın. Analizini bu gerçek verilere dayandır, veri yoksa varsayımda bulunma.`);
  lines.push(detailInstruction);

  lines.push("");
  lines.push("Dönem özeti:");
  lines.push(`- Toplam harcama: ${formatTRY(stats.totalExpense)} (${stats.expenseCount} kayıt, ortalama ${formatTRY(stats.averageExpense)})`);
  if (stats.categoryBreakdown.length > 0) {
    const topCategories = stats.categoryBreakdown
      .slice(0, 3)
      .map((c) => `${c.category} (%${c.percent.toFixed(1)})`)
      .join(", ");
    lines.push(`- En yüksek harcama kategorileri: ${topCategories}`);
  }
  if (periodTransactions.length > 0) {
    lines.push(`- Bu dönemde ${periodTransactions.length} yatırım işlemi yapıldı (${Array.from(new Set(periodTransactions.map((t) => ASSET_LABELS[t.assetType] ?? t.assetType))).join(", ")}).`);
  }

  if (answers.focus.trim()) {
    lines.push("");
    lines.push(`Özellikle şu konuya odaklan: ${answers.focus.trim()}`);
  }

  lines.push("");
  lines.push("Not: Sadece harcama ve yatırım verilerini analiz et; bu pakette gelir/tasarruf verisi bulunmuyor.");

  return lines.join("\n");
}
