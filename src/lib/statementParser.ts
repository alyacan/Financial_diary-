export interface ParsedStatementRow {
  date: string; // YYYY-MM-DD
  description: string;
  amount: number; // TL, only positive (actual purchases) rows are returned
}

// PDF metin çıkarımında sütunlar arası boşluk kaybolabiliyor (örn. "...TR40,00" veya
// "405,000,04" gibi tutar+maxipuan bitişik). Bu yüzden tutarı boşluk şartı koymadan,
// açıklamadan hemen sonraki ilk "sayı,İKİHANE" örüntüsü olarak yakalıyoruz; sonrası (maxipuan vb.) yok sayılır.
const LINE_REGEX = /^(\d{2})\/(\d{2})\/(\d{4})\s+(.+?)(-?[\d.]+,\d{2})/;

function parseTurkishNumber(raw: string): number {
  return parseFloat(raw.replace(/\./g, "").replace(",", "."));
}

// Ekstredeki "İşlem Tarihi | Açıklama | Tutar | Taksit Bilgisi | Maxipuan" formatındaki
// satırları ayrıştırır. Sadece pozitif tutarlı (gerçek harcama) satırlar döner —
// negatif tutarlar hesaba yapılan ödeme/aktarım veya iadedir, harcama değildir.
export function parseStatementText(text: string): ParsedStatementRow[] {
  const rows: ParsedStatementRow[] = [];

  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    const match = trimmed.match(LINE_REGEX);
    if (!match) continue;

    const [, dd, mm, yyyy, description, amountRaw] = match;
    const amount = parseTurkishNumber(amountRaw);
    if (amount <= 0) continue; // negatif = ödeme/iade, harcama değil

    rows.push({
      date: `${yyyy}-${mm}-${dd}`,
      description: description.trim(),
      amount,
    });
  }

  return rows;
}
