"use client";

import { useEffect, useState } from "react";
import { ArchivedPeriod, Expense } from "@/lib/types";
import { addExpense, addExpenses, closePeriod, deleteExpense, loadArchivedPeriods, loadExpenses } from "@/lib/storage";

export function useExpenseData() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [archivedPeriods, setArchivedPeriods] = useState<ArchivedPeriod[]>([]);

  useEffect(() => {
    setExpenses(loadExpenses());
    setArchivedPeriods(loadArchivedPeriods());
  }, []);

  function handleAddExpense(e: Expense) {
    setExpenses(addExpense(e));
  }

  function handleDeleteExpense(id: string) {
    setExpenses(deleteExpense(id));
  }

  function handleImportExpenses(newExpenses: Expense[]) {
    setExpenses(addExpenses(newExpenses));
  }

  function handleClosePeriod() {
    const result = closePeriod(expenses);
    setArchivedPeriods(result.archivedPeriods);
    setExpenses(result.expenses);
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return {
    expenses,
    handleAddExpense,
    handleDeleteExpense,
    handleImportExpenses,
    totalExpenses,
    archivedPeriods,
    handleClosePeriod,
  };
}
