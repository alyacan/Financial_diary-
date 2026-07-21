import { ArchivedPeriod, CalendarNote, Expense, Transaction } from "./types";

const STORAGE_KEY = "financial-diary-transactions";
const EXPENSES_STORAGE_KEY = "financial-diary-expenses";
const CALENDAR_STORAGE_KEY = "financial-diary-calendar-notes";
const ARCHIVED_PERIODS_STORAGE_KEY = "financial-diary-archived-periods";

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
// yoksa aktif harcamaların en erkeni); bitiş tarihi = bugün.
export function closePeriod(currentExpenses: Expense[]): {
  archivedPeriods: ArchivedPeriod[];
  expenses: Expense[];
} {
  const archivedPeriods = loadArchivedPeriods();
  const todayIso = new Date().toISOString().slice(0, 10);

  const lastPeriod = archivedPeriods[archivedPeriods.length - 1];
  let startDate: string;
  if (lastPeriod) {
    const nextDay = new Date(lastPeriod.endDate);
    nextDay.setDate(nextDay.getDate() + 1);
    startDate = nextDay.toISOString().slice(0, 10);
  } else if (currentExpenses.length > 0) {
    startDate = currentExpenses.reduce((min, e) => (e.date < min ? e.date : min), currentExpenses[0].date);
  } else {
    startDate = todayIso;
  }

  const newPeriod: ArchivedPeriod = {
    id: crypto.randomUUID(),
    startDate,
    endDate: todayIso,
    createdAt: new Date().toISOString(),
    expenses: currentExpenses,
  };

  const updatedPeriods = [...archivedPeriods, newPeriod];
  saveArchivedPeriods(updatedPeriods);
  saveExpenses([]);

  return { archivedPeriods: updatedPeriods, expenses: [] };
}
