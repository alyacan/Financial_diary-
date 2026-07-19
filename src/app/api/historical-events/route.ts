import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { buildDetailedPrompt, buildShortPrompt } from "@/lib/historicalEventsPrompt";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "buraya_key_yapistir") {
    return NextResponse.json(
      { error: "GEMINI_API_KEY tanımlı değil. .env.local dosyasına key'ini ekle ve sunucuyu yeniden başlat." },
      { status: 500 }
    );
  }

  const { date, assetLabel, quantity, note, mode } = await req.json();
  if (!date || !assetLabel || quantity === undefined) {
    return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });
  }

  const prompt =
    mode === "detailed"
      ? buildDetailedPrompt({ date, assetLabel, quantity, note })
      : buildShortPrompt({ date, assetLabel, quantity, note });

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
    });
    return NextResponse.json({ text: response.text });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI çağrısı başarısız oldu" },
      { status: 500 }
    );
  }
}
