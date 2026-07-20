import { BankParser, parseTurkishNumber } from "./types";

// Hiçbir spesifik banka formatı eşleşmediğinde son çare olarak denenir.
// Tarih ayracı olarak "/" veya "." kabul eder (Türkiye'deki bankaların çoğu
// GG/AA/YYYY ya da GG.AA.YYYY kullanır). Gerçek bir örnekle doğrulanmadığı için
// her bankada çalışacağı garanti değildir — sonuçları mutlaka kontrol et.
const LINE_REGEX = /^(\d{2})[./](\d{2})[./](\d{4})\s+(.+?)(-?[\d.]+,\d{2})/;

export const generic: BankParser = {
  id: "generic",
  label: "Genel format (banka tanınamadı — sonuçları kontrol et)",
  detect: () => true,
  parse: (text) => {
    const rows = [];
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      const match = trimmed.match(LINE_REGEX);
      if (!match) continue;

      const [, dd, mm, yyyy, description, amountRaw] = match;
      const amount = parseTurkishNumber(amountRaw);
      if (amount <= 0) continue;

      rows.push({ date: `${yyyy}-${mm}-${dd}`, description: description.trim(), amount });
    }
    return rows;
  },
};
