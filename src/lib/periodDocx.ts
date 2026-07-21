import { Document, Packer, Paragraph, HeadingLevel, Table, TableRow, TableCell, WidthType, PageBreak } from "docx";
import { ArchivedPeriod, ASSET_LABELS, Transaction } from "./types";
import { computePeriodStats } from "./periodStats";

function formatTRY(value: number): string {
  return value.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
}

function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  return `${d}.${m}.${y}`;
}

function heading(text: string, level: (typeof HeadingLevel)[keyof typeof HeadingLevel] = HeadingLevel.HEADING_2) {
  return new Paragraph({ text, heading: level, spacing: { before: 240, after: 120 } });
}

function paragraph(text: string) {
  return new Paragraph({ text, spacing: { after: 80 } });
}

function makeTable(headerCells: string[], rows: string[][]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: headerCells.map(
          (h) => new TableCell({ children: [new Paragraph({ text: h, run: { bold: true } })] })
        ),
      }),
      ...rows.map(
        (row) =>
          new TableRow({
            children: row.map((cell) => new TableCell({ children: [new Paragraph(cell)] })),
          })
      ),
    ],
  });
}

export async function buildPeriodDocx(
  period: ArchivedPeriod,
  allPeriods: ArchivedPeriod[],
  periodTransactions: Transaction[],
  aiPrompt?: string
): Promise<Blob> {
  const stats = computePeriodStats(period, allPeriods);

  const children: (Paragraph | Table)[] = [];

  children.push(
    new Paragraph({
      text: "Finansal Günlük — Dönem Raporu",
      heading: HeadingLevel.TITLE,
      spacing: { after: 120 },
    })
  );
  children.push(paragraph(`Dönem: ${formatDate(period.startDate)} - ${formatDate(period.endDate)}`));
  children.push(paragraph(`Rapor oluşturma tarihi: ${formatDate(new Date().toISOString().slice(0, 10))}`));

  children.push(heading("Harcama Özeti"));
  children.push(paragraph(`Toplam harcama: ${formatTRY(stats.totalExpense)}`));
  children.push(paragraph(`Harcama sayısı: ${stats.expenseCount}`));
  children.push(paragraph(`Ortalama harcama: ${formatTRY(stats.averageExpense)}`));

  children.push(heading("Kategori Dağılımı"));
  if (stats.categoryBreakdown.length > 0) {
    children.push(
      makeTable(
        ["Kategori", "Toplam", "Yüzde"],
        stats.categoryBreakdown.map((c) => [c.category, formatTRY(c.total), `%${c.percent.toFixed(1)}`])
      )
    );
  } else {
    children.push(paragraph("Bu dönemde harcama kaydı yok."));
  }

  children.push(heading("En Büyük Harcamalar"));
  if (stats.biggestExpenses.length > 0) {
    children.push(
      makeTable(
        ["Tarih", "Kategori", "Tutar", "Not"],
        stats.biggestExpenses.map((e) => [formatDate(e.date), e.category, formatTRY(e.amount), e.note ?? "-"])
      )
    );
  } else {
    children.push(paragraph("Kayıt yok."));
  }

  children.push(heading("Tekrarlayan Harcamalar (yaklaşık)"));
  children.push(paragraph("Not: Bu liste, aynı açıklamanın önceki dönemlerde veya bu dönem içinde birden fazla kez geçmesine dayanan basit bir yaklaşımdır, kesin bir örüntü analizi değildir."));
  if (stats.recurringExpenses.length > 0) {
    children.push(
      makeTable(
        ["Tarih", "Kategori", "Tutar", "Not"],
        stats.recurringExpenses.map((e) => [formatDate(e.date), e.category, formatTRY(e.amount), e.note ?? "-"])
      )
    );
  } else {
    children.push(paragraph("Tekrarlayan harcama tespit edilmedi."));
  }

  children.push(heading("Beklenmeyen Harcamalar (yaklaşık)"));
  children.push(paragraph("Not: Dönem ortalamasının belirgin üzerinde olan ve tekrarlayan sayılmayan harcamalardır, basit bir istatistiksel yaklaşımdır."));
  if (stats.unexpectedExpenses.length > 0) {
    children.push(
      makeTable(
        ["Tarih", "Kategori", "Tutar", "Not"],
        stats.unexpectedExpenses.map((e) => [formatDate(e.date), e.category, formatTRY(e.amount), e.note ?? "-"])
      )
    );
  } else {
    children.push(paragraph("Beklenmeyen harcama tespit edilmedi."));
  }

  children.push(heading("Tüm Harcama Kayıtları"));
  if (period.expenses.length > 0) {
    children.push(
      makeTable(
        ["Tarih", "Kategori", "Tutar", "Not"],
        [...period.expenses]
          .sort((a, b) => (a.date < b.date ? -1 : 1))
          .map((e) => [formatDate(e.date), e.category, formatTRY(e.amount), e.note ?? "-"])
      )
    );
  } else {
    children.push(paragraph("Kayıt yok."));
  }

  children.push(heading("Yatırım İşlemleri"));
  if (periodTransactions.length > 0) {
    children.push(
      makeTable(
        ["Tarih", "Varlık", "Miktar", "Alış Fiyatı", "Tutar", "Not"],
        periodTransactions.map((t) => [
          formatDate(t.date),
          `${ASSET_LABELS[t.assetType] ?? t.assetType} (${t.subType})`,
          String(t.quantity),
          formatTRY(t.buyPrice),
          formatTRY(t.quantity * t.buyPrice),
          t.note ?? "-",
        ])
      )
    );
  } else {
    children.push(paragraph("Bu dönemde yatırım işlemi yok."));
  }

  if (aiPrompt) {
    children.push(new Paragraph({ children: [new PageBreak()] }));
    children.push(heading("AI Analiz Promptu"));
    children.push(paragraph("Aşağıdaki metni, tercih ettiğin yapay zekâ platformuna (ChatGPT, Claude, Gemini vb.) bu dosyayla birlikte yapıştırabilirsin:"));
    for (const line of aiPrompt.split("\n")) {
      children.push(paragraph(line || " "));
    }
  }

  const doc = new Document({
    sections: [{ children }],
  });

  return Packer.toBlob(doc);
}
