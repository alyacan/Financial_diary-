"use client";

import FinancialJournal from "@/components/FinancialJournal";
import { useInvestments } from "@/hooks/useInvestments";

export default function GunlukPage() {
  const { transactions } = useInvestments();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <header>
        <h1 className="text-2xl font-bold">Finans Günlüğü</h1>
        <p className="text-sm text-zinc-500">Yatırım kararlarının gerekçeleri, zaman akışı halinde.</p>
      </header>

      <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <FinancialJournal transactions={transactions} />
      </section>
    </div>
  );
}
