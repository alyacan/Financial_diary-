export interface ParsedStatementRow {
  date: string; // YYYY-MM-DD
  description: string;
  amount: number; // TL, only positive (actual purchases) rows are returned
}

export interface BankParser {
  id: string;
  label: string;
  // Verilen PDF metninin bu bankanın formatına ait olup olmadığını anlar.
  detect: (text: string) => boolean;
  parse: (text: string) => ParsedStatementRow[];
}

export function parseTurkishNumber(raw: string): number {
  return parseFloat(raw.replace(/\./g, "").replace(",", "."));
}
