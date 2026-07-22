import { CategoryBudget, Expense } from "./types";

export interface BudgetProgress {
  category: string;
  monthlyGoal: number;
  thisMonthTotal: number;
  lastMonthTotal: number;
  percentUsed: number; // thisMonthTotal / monthlyGoal * 100, sınırlanmamış (100'ü geçebilir)
  deltaVsLastMonth: number; // thisMonthTotal - lastMonthTotal
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

// Hedefler takvim ayına göre değerlendirilir (Dönemi Kapat/Klasörle sınırlarından
// bağımsız) — bu yüzden hem aktif hem arşivlenmiş tüm harcamalar birlikte verilmeli.
export function computeBudgetProgress(
  allExpenses: Expense[],
  budgets: CategoryBudget[],
  referenceDate: Date = new Date()
): BudgetProgress[] {
  const thisMonthKey = monthKey(referenceDate);
  const lastMonthDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - 1, 1);
  const lastMonthKey = monthKey(lastMonthDate);

  return budgets.map((b) => {
    let thisMonthTotal = 0;
    let lastMonthTotal = 0;
    for (const e of allExpenses) {
      if (e.category !== b.category) continue;
      const k = e.date.slice(0, 7);
      if (k === thisMonthKey) thisMonthTotal += e.amount;
      else if (k === lastMonthKey) lastMonthTotal += e.amount;
    }
    return {
      category: b.category,
      monthlyGoal: b.monthlyGoal,
      thisMonthTotal,
      lastMonthTotal,
      percentUsed: b.monthlyGoal > 0 ? (thisMonthTotal / b.monthlyGoal) * 100 : 0,
      deltaVsLastMonth: thisMonthTotal - lastMonthTotal,
    };
  });
}
