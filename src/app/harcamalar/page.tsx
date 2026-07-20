"use client";

import ExpenseForm from "@/components/ExpenseForm";
import ExpenseChart from "@/components/ExpenseChart";
import ExpenseTable from "@/components/ExpenseTable";
import StatementUpload from "@/components/StatementUpload";
import { useExpenseData } from "@/hooks/useExpenseData";

function formatTRY(value: number): string {
  return value.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
}

export default function HarcamalarPage() {
  const { expenses, handleAddExpense, handleDeleteExpense, handleImportExpenses, totalExpenses } = useExpenseData();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <header>
        <h1 className="text-2xl font-bold">Harcama Analizi</h1>
        <p className="text-sm text-zinc-500">Kategori bazlı harcama takibi</p>
      </header>

      <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <p className="text-sm text-zinc-500">Toplam Harcama</p>
        <p className="text-xl font-semibold">{formatTRY(totalExpenses)}</p>
      </section>

      <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="mb-2 text-lg font-semibold">Kategori Dağılımı</h2>
        <ExpenseChart expenses={expenses} />
      </section>

      <StatementUpload existingExpenses={expenses} onImport={handleImportExpenses} />

      <ExpenseForm onAdd={handleAddExpense} />

      <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="mb-2 text-lg font-semibold">Harcamalar</h2>
        <ExpenseTable expenses={expenses} onDelete={handleDeleteExpense} />
      </section>
    </div>
  );
}
