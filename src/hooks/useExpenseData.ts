"use client";

import { useEffect, useState } from "react";
import { Expense } from "@/lib/types";
import { addExpense, addExpenses, deleteExpense, loadExpenses } from "@/lib/storage";

export function useExpenseData() {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    setExpenses(loadExpenses());
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

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return { expenses, handleAddExpense, handleDeleteExpense, handleImportExpenses, totalExpenses };
}
