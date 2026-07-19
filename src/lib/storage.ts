import { CalendarNote, Expense, Transaction } from "./types";

const STORAGE_KEY = "financial-diary-transactions";
const EXPENSES_STORAGE_KEY = "financial-diary-expenses";
const CALENDAR_STORAGE_KEY = "financial-diary-calendar-notes";

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
