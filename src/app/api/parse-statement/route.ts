import { NextRequest, NextResponse } from "next/server";
import { createRequire } from "module";
import { GoogleGenAI } from "@google/genai";
import { parseStatementText } from "@/lib/statementParser";
import { ParsedStatementRow } from "@/lib/bankParsers/types";
import { EXPENSE_CATEGORIES } from "@/lib/types";

const require = createRequire(import.meta.url);

// pdf-parse metin çıkaramadığında (ör. ekran görüntüsünden oluşturulmuş, seçilebilir
// metni olmayan PDF'ler) bu eşiğin altında kalır — bu durumda regex yerine Gemini'nin
// görüntüyü doğrudan "görüp" işlemleri okumasını isteriz.
const MIN_TEXT_LENGTH_FOR_REGEX = 50;

async function extractViaGeminiVision(buffer: Buffer, apiKey: string): Promise<ParsedStatementRow[]> {
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Bu bir banka/kredi kartı hesap ekstresi görüntüsüdür. Sadece GERÇEK HARCAMA (para çıkışı, üçüncü tarafa yapılan ödeme/satın alma) işlemlerini listele.
Şunları KESİNLİKLE HARİÇ TUT:
- Hesaba gelen para (gelen EFT/havale, maaş, iade, tahsilat)
- Hesaplar arası transfer/aktarım (örn. "HESAPTAN AKTARIM", "Vadeli Hesaba Para Yatırma", "Hesap Açılış")
- Banka tarafından yapılan faiz/komisyon tahsilatı işlemleri (senin harcaman değil)
Sadece market, restoran, fatura ödemesi, ATM'den nakit çekme gibi gerçek üçüncü taraf harcamalarını dahil et.

Her harcama için:
- date: YYYY-MM-DD formatında (görüntüdeki tarih formatı ne olursa olsun)
- description: işlem açıklaması (kısa, orijinal dile sadık)
- amount: pozitif sayı (TL), ondalık ayracı nokta olacak şekilde normalize et

Sadece şu şekilde bir JSON dizisi döndür, başka hiçbir açıklama ekleme:
[{"date": "2024-01-15", "description": "...", "amount": 123.45}, ...]
Hiç harcama bulamazsan boş dizi [] döndür.`;

  const response = await ai.models.generateContent({
    model: "gemini-flash-latest",
    contents: [
      {
        role: "user",
        parts: [{ inlineData: { mimeType: "application/pdf", data: buffer.toString("base64") } }, { text: prompt }],
      },
    ],
    config: { responseMimeType: "application/json" },
  });

  const parsed = JSON.parse(response.text ?? "[]");
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter((r) => r && typeof r.date === "string" && typeof r.description === "string" && typeof r.amount === "number")
    .map((r) => ({ date: r.date, description: r.description, amount: r.amount }));
}

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
  } catch {
    text = ""; // metin çıkarılamadıysa görüntü tabanlı PDF olabilir, aşağıda AI ile denenir
  }

  let rows: ParsedStatementRow[];
  let bankLabel: string;
  let formatWarning: string | undefined;

  if (text.trim().length >= MIN_TEXT_LENGTH_FOR_REGEX) {
    const result = parseStatementText(text);
    rows = result.rows;
    bankLabel = result.bankLabel;
    formatWarning = result.isGenericFallback
      ? "Banka formatı otomatik tanınamadı, genel bir ayrıştırma kullanıldı. Lütfen tarih/tutar/açıklamaları kontrol et."
      : undefined;
  } else {
    try {
      rows = await extractViaGeminiVision(buffer, apiKey);
    } catch (err) {
      return NextResponse.json(
        { error: "PDF'ten metin çıkarılamadı ve AI ile görüntü okuma da başarısız oldu: " + (err instanceof Error ? err.message : "bilinmeyen hata") },
        { status: 400 }
      );
    }
    bankLabel = "AI ile görüntüden okundu";
    formatWarning = "Bu PDF'te seçilebilir metin yoktu (muhtemelen ekran görüntüsü), işlemler AI ile görüntüden okundu. Tutarları ve tarihleri mutlaka kontrol et.";
  }

  if (rows.length === 0) {
    return NextResponse.json({ error: "Ekstrede tanınabilir işlem bulunamadı." }, { status: 400 });
  }

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
