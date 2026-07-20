import { BankParser, parseTurkishNumber } from "./types";

// PDF metin çıkarımında sütunlar arası boşluk kaybolabiliyor (örn. "...TR40,00" veya
// "405,000,04" gibi tutar+maxipuan bitişik). Bu yüzden tutarı boşluk şartı koymadan,
// açıklamadan hemen sonraki ilk "sayı,İKİHANE" örüntüsü olarak yakalıyoruz; sonrası
// (maxipuan vb.) yok sayılır. Gerçek bir İş Bankası Maximum ekstresi ile test edildi.
const LINE_REGEX = /^(\d{2})\/(\d{2})\/(\d{4})\s+(.+?)(-?[\d.]+,\d{2})/;

export const isBankasiMaximum: BankParser = {
  id: "isbankasi-maximum",
  label: "İş Bankası Maximum (Kredi Kartı)",
  detect: (text) => text.includes("MAXIPUAN") && /İŞLEM\s*\n?\s*TARİHİ/.test(text),
  parse: (text) => {
    const rows = [];
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      const match = trimmed.match(LINE_REGEX);
      if (!match) continue;

      const [, dd, mm, yyyy, description, amountRaw] = match;
      const amount = parseTurkishNumber(amountRaw);
      if (amount <= 0) continue; // negatif = ödeme/iade, harcama değil

      rows.push({ date: `${yyyy}-${mm}-${dd}`, description: description.trim(), amount });
    }
    return rows;
  },
};
