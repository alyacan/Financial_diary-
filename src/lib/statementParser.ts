import { BankParser, ParsedStatementRow } from "./bankParsers/types";
import { isBankasiMaximum } from "./bankParsers/isBankasiMaximum";

export type { ParsedStatementRow };

// Yeni banka desteği eklemek için: bankParsers/ altına gerçek bir örnekle test edilmiş
// bir dosya ekleyip buraya kaydet. Tanınmayan formatlar artık kör bir regex'e değil,
// Gemini'nin metni okumasına düşer (bkz. /api/parse-statement/route.ts).
const BANK_PARSERS: BankParser[] = [isBankasiMaximum];

export interface ParseResult {
  rows: ParsedStatementRow[];
  bankLabel: string;
}

// Metin, bilinen bir banka formatına aitse ayrıştırıp döner; değilse null döner
// (çağıran taraf bu durumda AI tabanlı çıkarıma düşmeli).
export function parseKnownBankStatement(text: string): ParseResult | null {
  for (const parser of BANK_PARSERS) {
    if (parser.detect(text)) {
      return { rows: parser.parse(text), bankLabel: parser.label };
    }
  }
  return null;
}
