import { ParsedStatementRow } from "./bankParsers/types";
import { isBankasiMaximum } from "./bankParsers/isBankasiMaximum";
import { generic } from "./bankParsers/generic";

export type { ParsedStatementRow };

// Yeni banka desteği eklemek için: bankParsers/ altına bir dosya ekleyip buraya kaydet.
// Sıra önemli — ilk `detect()` true dönen kullanılır, hiçbiri eşleşmezse `generic` devreye girer.
const BANK_PARSERS = [isBankasiMaximum];

export interface ParseResult {
  rows: ParsedStatementRow[];
  bankLabel: string;
  isGenericFallback: boolean;
}

export function parseStatementText(text: string): ParseResult {
  for (const parser of BANK_PARSERS) {
    if (parser.detect(text)) {
      return { rows: parser.parse(text), bankLabel: parser.label, isGenericFallback: false };
    }
  }
  return { rows: generic.parse(text), bankLabel: generic.label, isGenericFallback: true };
}
