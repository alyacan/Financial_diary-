import { NextRequest, NextResponse } from "next/server";
import { createRequire } from "module";
import { GoogleGenAI } from "@google/genai";
import { parseKnownBankStatement, ParsedStatementRow } from "@/lib/statementParser";
import { EXPENSE_CATEGORIES } from "@/lib/types";

const require = createRequire(import.meta.url);

// pdf-parse metin çıkaramadığında (ör. ekran görüntüsünden oluşturulmuş, seçilebilir
// metni olmayan PDF'ler) bu eşiğin altında kalır — bu durumda AI'nin görüntüyü
// doğrudan "görüp" işlemleri okuması istenir.
const MIN_TEXT_LENGTH_FOR_TEXT_MODE = 50;

const EXTRACTION_INSTRUCTIONS = `Sadece GERÇEK HARCAMA (para çıkışı, üçüncü tarafa yapılan ödeme/satın alma) işlemlerini listele.
Şunları KESİNLİKLE HARİÇ TUT:
- Hesaba gelen para (gelen EFT/havale, maaş, iade, tahsilat)
- Hesaplar arası transfer/aktarım (örn. "HESAPTAN AKTARIM", "Vadeli Hesaba Para Yatırma", "Hesap Açılış")
- Banka tarafından yapılan faiz/komisyon tahsilatı işlemleri (senin harcaman değil)
Sadece market, restoran, fatura ödemesi, ATM'den nakit çekme gibi gerçek üçüncü taraf harcamalarını dahil et.
ÖNEMLİ: Bazı hesap türlerinde (kredi kartı) harcamalar pozitif, bazılarında (vadesiz/mevduat hesabı) negatif
tutarla gösterilir — hangi işlemin gerçek bir harcama olduğuna bağlamdan (işlem açıklamasından) karar ver,
sadece işaretin pozitif/negatif olmasına güvenme.

Her harcama için:
- date: YYYY-MM-DD formatında (kaynaktaki tarih formatı ne olursa olsun)
- description: işlem açıklaması (kısa, orijinal dile sadık)
- amount: pozitif sayı (TL), ondalık ayracı nokta olacak şekilde normalize et

Sadece şu şekilde bir JSON dizisi döndür, başka hiçbir açıklama ekleme:
[{"date": "2024-01-15", "description": "...", "amount": 123.45}, ...]
Hiç harcama bulamazsan boş dizi [] döndür.`;

function parseGeminiRows(text: string | undefined): ParsedStatementRow[] {
  const parsed = JSON.parse(text ?? "[]");
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter((r) => r && typeof r.date === "string" && typeof r.description === "string" && typeof r.amount === "number")
    .map((r) => ({ date: r.date, description: r.description, amount: r.amount }));
}

async function extractViaGeminiVision(buffer: Buffer, apiKey: string): Promise<ParsedStatementRow[]> {
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Bu bir banka/kredi kartı hesap ekstresi görüntüsüdür. ${EXTRACTION_INSTRUCTIONS}`;

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

  return parseGeminiRows(response.text);
}

async function extractViaGeminiText(statementText: string, apiKey: string): Promise<ParsedStatementRow[]> {
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Aşağıda bir banka/kredi kartı hesap ekstresinden çıkarılmış ham metin var (format tanınamadı, sütun hizalaması bozulmuş olabilir). ${EXTRACTION_INSTRUCTIONS}

Ham metin:
"""
${statementText}
"""`;

  const response = await ai.models.generateContent({
    model: "gemini-flash-latest",
    contents: prompt,
    config: { responseMimeType: "application/json" },
  });

  return parseGeminiRows(response.text);
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

  const knownBank = parseKnownBankStatement(text);

  try {
    if (knownBank) {
      rows = knownBank.rows;
      bankLabel = knownBank.bankLabel;
    } else if (text.trim().length >= MIN_TEXT_LENGTH_FOR_TEXT_MODE) {
      rows = await extractViaGeminiText(text, apiKey);
      bankLabel = "AI ile metinden okundu (banka formatı tanınmadı)";
      formatWarning = "Bu bankanın formatı tanınmadı, işlemler AI ile metinden çıkarıldı. Tutarları ve tarihleri mutlaka kontrol et.";
    } else {
      rows = await extractViaGeminiVision(buffer, apiKey);
      bankLabel = "AI ile görüntüden okundu";
      formatWarning = "Bu PDF'te seçilebilir metin yoktu (muhtemelen ekran görüntüsü), işlemler AI ile görüntüden okundu. Tutarları ve tarihleri mutlaka kontrol et.";
    }
  } catch (err) {
    return NextResponse.json(
      { error: "Ekstre işlenemedi: " + (err instanceof Error ? err.message : "bilinmeyen hata") },
      { status: 400 }
    );
  }

  if (rows.length === 0) {
    return NextResponse.json({ error: "Ekstrede tanınabilir işlem bulunamadı." }, { status: 400 });
  }

  try {
    const categories = await categorize(rows.map((r) => r.description), apiKey);
    const categorized = rows.map((r, i) => ({ ...r, category: categories[i] ?? "Diğer" }));
    return NextResponse.json({ rows: categorized, bankLabel, warning: formatWarning });
  } catch {
    // AI kategorizasyonu başarısız olsa bile ayrıştırılan işlemleri "Diğer" ile dönebiliriz.
    const categorized = rows.map((r) => ({ ...r, category: "Diğer" }));
    const warning = [formatWarning, "AI kategorizasyon başarısız oldu, tümü 'Diğer' olarak işaretlendi."]
      .filter(Boolean)
      .join(" ");
    return NextResponse.json({ rows: categorized, bankLabel, warning });
  }
}
