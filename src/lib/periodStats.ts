import { ArchivedPeriod, Expense, Transaction } from "./types";

export interface CategoryBreakdown {
  category: string;
  total: number;
  percent: number;
}

export interface PeriodStats {
  totalExpense: number;
  expenseCount: number;
  averageExpense: number;
  categoryBreakdown: CategoryBreakdown[];
  biggestExpenses: Expense[];
  recurringExpenses: Expense[];
  unexpectedExpenses: Expense[];
}

function normalizedNote(e: Expense): string | null {
  const note = e.note?.trim().toLowerCase();
  return note ? note : null;
}

export function categoryBreakdown(expenses: Expense[]): CategoryBreakdown[] {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const map = new Map<string, number>();
  for (const e of expenses) {
    map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
  }
  return Array.from(map.entries())
    .map(([category, categoryTotal]) => ({
      category,
      total: categoryTotal,
      percent: total > 0 ? (categoryTotal / total) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

// Basit bir yaklaşım: notu, önceki arşivlenmiş dönemlerin herhangi birinde
// (veya bu dönem içinde birden fazla kez) geçen harcamalar "tekrarlayan" sayılır.
// Tam bir örüntü tanıma değildir — kesin eşleşme (küçük/büyük harf duyarsız,
// boşluklar kırpılmış) üzerine kurulu bir yaklaşımdır.
export function findRecurringExpenses(expenses: Expense[], previousPeriods: ArchivedPeriod[]): Expense[] {
  const previousNotes = new Set<string>();
  for (const period of previousPeriods) {
    for (const e of period.expenses) {
      const note = normalizedNote(e);
      if (note) previousNotes.add(note);
    }
  }

  const noteCountInPeriod = new Map<string, number>();
  for (const e of expenses) {
    const note = normalizedNote(e);
    if (note) noteCountInPeriod.set(note, (noteCountInPeriod.get(note) ?? 0) + 1);
  }

  return expenses.filter((e) => {
    const note = normalizedNote(e);
    if (!note) return false;
    return previousNotes.has(note) || (noteCountInPeriod.get(note) ?? 0) >= 2;
  });
}

// Basit istatistiksel aykırı değer yaklaşımı: dönem ortalamasının belirgin
// üzerinde olan ve tekrarlayan olarak işaretlenmemiş harcamalar "beklenmeyen"
// sayılır. Gerçek bir anomali/niyet tespiti değildir.
export function findUnexpectedExpenses(expenses: Expense[], recurring: Expense[]): Expense[] {
  if (expenses.length === 0) return [];
  const recurringIds = new Set(recurring.map((e) => e.id));
  const average = expenses.reduce((sum, e) => sum + e.amount, 0) / expenses.length;
  const threshold = average * 2;
  return expenses
    .filter((e) => !recurringIds.has(e.id) && e.amount > threshold)
    .sort((a, b) => b.amount - a.amount);
}

export function computePeriodStats(period: ArchivedPeriod, allPeriods: ArchivedPeriod[]): PeriodStats {
  const { expenses } = period;
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const previousPeriods = allPeriods.filter((p) => p.id !== period.id && p.endDate < period.startDate);
  const recurringExpenses = findRecurringExpenses(expenses, previousPeriods);
  const unexpectedExpenses = findUnexpectedExpenses(expenses, recurringExpenses);
  const biggestExpenses = [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 5);

  return {
    totalExpense,
    expenseCount: expenses.length,
    averageExpense: expenses.length > 0 ? totalExpense / expenses.length : 0,
    categoryBreakdown: categoryBreakdown(expenses),
    biggestExpenses,
    recurringExpenses,
    unexpectedExpenses,
  };
}

export function transactionsInPeriod(transactions: Transaction[], period: ArchivedPeriod): Transaction[] {
  return transactions.filter((t) => t.date >= period.startDate && t.date <= period.endDate);
}
