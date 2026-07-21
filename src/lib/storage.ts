import { ArchivedPeriod, CalendarNote, Expense, PortfolioSnapshot, Transaction } from "./types";

const STORAGE_KEY = "financial-diary-transactions";
const EXPENSES_STORAGE_KEY = "financial-diary-expenses";
const CALENDAR_STORAGE_KEY = "financial-diary-calendar-notes";
const ARCHIVED_PERIODS_STORAGE_KEY = "financial-diary-archived-periods";
const PORTFOLIO_SNAPSHOTS_STORAGE_KEY = "financial-diary-portfolio-snapshots";
const MAX_PORTFOLIO_SNAPSHOTS = 90;

export function loadTransactions(): Transaction[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Transaction[];
  } catch {
    return [];
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

export function addTransaction(transaction: Transaction): Transaction[] {
  const transactions = [...loadTransactions(), transaction];
  saveTransactions(transactions);
  return transactions;
}

export function deleteTransaction(id: string): Transaction[] {
  const transactions = loadTransactions().filter((t) => t.id !== id);
  saveTransactions(transactions);
  return transactions;
}

export function loadExpenses(): Expense[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(EXPENSES_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Expense[];
  } catch {
    return [];
  }
}

export function saveExpenses(expenses: Expense[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
}

export function addExpense(expense: Expense): Expense[] {
  const expenses = [...loadExpenses(), expense];
  saveExpenses(expenses);
  return expenses;
}

export function deleteExpense(id: string): Expense[] {
  const expenses = loadExpenses().filter((e) => e.id !== id);
  saveExpenses(expenses);
  return expenses;
}

export function addExpenses(newExpenses: Expense[]): Expense[] {
  const expenses = [...loadExpenses(), ...newExpenses];
  saveExpenses(expenses);
  return expenses;
}

export function loadCalendarNotes(): CalendarNote[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(CALENDAR_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as CalendarNote[];
  } catch {
    return [];
  }
}

export function saveCalendarNotes(notes: CalendarNote[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(notes));
}

export function addCalendarNote(note: CalendarNote): CalendarNote[] {
  const notes = [...loadCalendarNotes(), note];
  saveCalendarNotes(notes);
  return notes;
}

export function deleteCalendarNote(id: string): CalendarNote[] {
  const notes = loadCalendarNotes().filter((n) => n.id !== id);
  saveCalendarNotes(notes);
  return notes;
}

export function loadArchivedPeriods(): ArchivedPeriod[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(ARCHIVED_PERIODS_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ArchivedPeriod[];
  } catch {
    return [];
  }
}

export function saveArchivedPeriods(periods: ArchivedPeriod[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ARCHIVED_PERIODS_STORAGE_KEY, JSON.stringify(periods));
}

// Dönemi Kapat: aktif harcamaları silmeden arşivler, aktif listeyi boşaltır.
// Başlangıç tarihi = önceki dönemin bitişinden bir gün sonrası (önceki dönem
// yoksa aktif harcamaların en erkeni); bitiş tarihi = bugün. Aynı gün içinde
// art arda birden fazla dönem kapatılırsa (ör. geçmişe dönük klasörleme)
// başlangıç bitişi geçemez — bu durumda tek günlük bir dönem oluşur.
export function closePeriod(currentExpenses: Expense[]): {
  archivedPeriods: ArchivedPeriod[];
  expenses: Expense[];
} {
  const archivedPeriods = loadArchivedPeriods();
  const endDate = new Date().toISOString().slice(0, 10);

  const lastPeriod = archivedPeriods[archivedPeriods.length - 1];
  let startDate: string;
  if (lastPeriod) {
    const nextDay = new Date(lastPeriod.endDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const candidateStart = nextDay.toISOString().slice(0, 10);
    startDate = candidateStart > endDate ? endDate : candidateStart;
  } else if (currentExpenses.length > 0) {
    const earliest = currentExpenses.reduce((min, e) => (e.date < min ? e.date : min), currentExpenses[0].date);
    startDate = earliest > endDate ? endDate : earliest;
  } else {
    startDate = endDate;
  }

  const newPeriod: ArchivedPeriod = {
    id: crypto.randomUUID(),
    startDate,
    endDate,
    createdAt: new Date().toISOString(),
    expenses: currentExpenses,
  };

  const updatedPeriods = [...archivedPeriods, newPeriod];
  saveArchivedPeriods(updatedPeriods);
  saveExpenses([]);

  return { archivedPeriods: updatedPeriods, expenses: [] };
}

export function loadPortfolioSnapshots(): PortfolioSnapshot[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(PORTFOLIO_SNAPSHOTS_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as PortfolioSnapshot[];
  } catch {
    return [];
  }
}

// Portföy Değeri trend grafiği: geriye dönük veri yoktu, bu yüzden geçmiş
// üretilmez — bugünden itibaren her ziyarette günün değeri kaydedilir/güncellenir
// ve grafik zamanla gerçek verilerle birikir.
export function recordPortfolioSnapshot(value: number): PortfolioSnapshot[] {
  if (typeof window === "undefined") return [];
  const today = new Date().toISOString().slice(0, 10);
  const existing = loadPortfolioSnapshots().filter((s) => s.date !== today);
  const updated = [...existing, { date: today, value }]
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .slice(-MAX_PORTFOLIO_SNAPSHOTS);
  window.localStorage.setItem(PORTFOLIO_SNAPSHOTS_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
