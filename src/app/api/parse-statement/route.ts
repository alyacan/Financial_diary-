import { NextRequest, NextResponse } from "next/server";
import { createRequire } from "module";
import { GoogleGenAI } from "@google/genai";
import { parseStatementText } from "@/lib/statementParser";
import { EXPENSE_CATEGORIES } from "@/lib/types";

const require = createRequire(import.meta.url);

async function categorize(descriptions: string[], apiKey: string): Promise<string[]> {
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Aşağıdaki banka/kredi kartı ekstresi işlem açıklamalarının her birini şu kategorilerden birine ata: ${EXPENSE_CATEGORIES.join(", ")}.
Türkçe mağaza/marka isimlerini yorumla (örn. "BIM", "ÇAĞDAŞ MARKET" -> Market; "TRENDYOL YEMEK", kafe/restoran isimleri -> Yemek; "TT MOBIL" gibi operatör isimleri -> Faturalar; "WATSONS" gibi kişisel bakım -> Sağlık).
Emin olmadığında "Diğer" kullan.

İşlemler:
${descriptions.map((d, i) => `${i + 1}. ${d}`).join("\n")}

Yalnızca ${descriptions.length} elemanlı bir JSON dizisi döndür, sırası yukarıdaki listeyle birebir aynı olsun. Örnek: ["Market", "Yemek", ...]`;

  const response = await ai.models.generateContent({
    model: "gemini-flash-latest",
    contents: prompt,
    config: { responseMimeType: "application/json" },
  });

  try {
    const parsed = JSON.parse(response.text ?? "[]");
    if (Array.isArray(parsed) && parsed.length === descriptions.length) return parsed;
  } catch {
    // düşer, aşağıda "Diğer" ile doldurulur
  }
  return descriptions.map(() => "Diğer");
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "buraya_key_yapistir") {
    return NextResponse.json(
      { error: "GEMINI_API_KEY tanımlı değil." },
      { status: 500 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let text: string;
  try {
    const pdfParse = require("pdf-parse/lib/pdf-parse.js");
    const result = await pdfParse(buffer);
    text = result.text;
  } catch (err) {
    return NextResponse.json(
      { error: "PDF okunamadı: " + (err instanceof Error ? err.message : "bilinmeyen hata") },
      { status: 400 }
    );
  }

  const { rows, bankLabel, isGenericFallback } = parseStatementText(text);
  if (rows.length === 0) {
    return NextResponse.json({ error: "Ekstrede tanınabilir işlem bulunamadı." }, { status: 400 });
  }

  const formatWarning = isGenericFallback
    ? `Banka formatı otomatik tanınamadı, genel bir ayrıştırma kullanıldı. Lütfen tarih/tutar/açıklamaları kontrol et.`
    : undefined;

  try {
    const categories = await categorize(rows.map((r) => r.description), apiKey);
    const categorized = rows.map((r, i) => ({ ...r, category: categories[i] ?? "Diğer" }));
    return NextResponse.json({ rows: categorized, bankLabel, warning: formatWarning });
  } catch (err) {
    // AI kategorizasyonu başarısız olsa bile ayrıştırılan işlemleri "Diğer" ile dönebiliriz.
    const categorized = rows.map((r) => ({ ...r, category: "Diğer" }));
    const warning = [formatWarning, "AI kategorizasyon başarısız oldu, tümü 'Diğer' olarak işaretlendi."]
      .filter(Boolean)
      .join(" ");
    return NextResponse.json({ rows: categorized, bankLabel, warning });
  }
}
