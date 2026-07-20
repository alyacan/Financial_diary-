"use client";

import { Fragment, useState } from "react";
import { TransactionProfit } from "@/lib/calculations";
import { ASSET_LABELS, BALANCE_ONLY_TYPES } from "@/lib/types";
import HistoricalEventPanel from "./HistoricalEventPanel";

function formatTRY(value: number): string {
  return value.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
}

function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  return `${d}.${m}.${y}`;
}

interface Props {
  rows: TransactionProfit[];
  onDelete: (id: string) => void;
}

export default function TransactionTable({ rows, onDelete }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (rows.length === 0) {
    return <p className="text-sm text-zinc-500">Henüz işlem eklenmedi.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-left dark:border-zinc-800">
            <th className="p-2">Tarih</th>
            <th className="p-2">Varlık</th>
            <th className="p-2">Miktar</th>
            <th className="p-2">Alış</th>
            <th className="p-2">Güncel</th>
            <th className="p-2">Kâr/Zarar</th>
            <th className="p-2">%</th>
            <th className="p-2">AI Analiz</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ transaction, currentPrice, profit, profitPercent, priceAvailable }) => (
            <Fragment key={transaction.id}>
              <tr className={transaction.note ? "border-zinc-100 dark:border-zinc-900" : "border-b border-zinc-100 dark:border-zinc-900"}>
                <td className="p-2 whitespace-nowrap">{formatDate(transaction.date)}</td>
                <td className="p-2">{ASSET_LABELS[transaction.assetType] ?? transaction.assetType} ({transaction.subType})</td>
                {BALANCE_ONLY_TYPES.includes(transaction.assetType) ? (
                  <>
                    <td className="p-2 text-zinc-400">—</td>
                    <td className="p-2">{formatTRY(transaction.quantity)}</td>
                    <td className="p-2 text-zinc-400 italic" colSpan={3}>Bakiye (kâr/zarar hesaplanmaz)</td>
                  </>
                ) : (
                  <>
                    <td className="p-2">{transaction.quantity}</td>
                    <td className="p-2">{formatTRY(transaction.buyPrice)}</td>
                    {!priceAvailable ? (
                      <td className="p-2 text-zinc-400 italic" colSpan={3}>
                        Güncel fiyat girilmedi
                      </td>
                    ) : (
                      <>
                        <td className="p-2">{formatTRY(currentPrice)}</td>
                        <td className={`p-2 font-medium ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {profit >= 0 ? "🟢" : "🔴"} {formatTRY(profit)}
                        </td>
                        <td className={`p-2 ${profitPercent >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {profitPercent.toFixed(2)}%
                        </td>
                      </>
                    )}
                  </>
                )}
                <td className="p-2">
                  <div className="flex gap-2 whitespace-nowrap">
                    <button
                      onClick={() => setExpandedId(expandedId === transaction.id ? null : transaction.id)}
                      className="text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
                    >
                      {expandedId === transaction.id ? "Kapat ▲" : "🕐 Tarihsel Bağlam"}
                    </button>
                    <button onClick={() => onDelete(transaction.id)} className="text-zinc-400 hover:text-red-600">
                      Sil
                    </button>
                  </div>
                </td>
              </tr>
              {transaction.note && (
                <tr className="border-b border-zinc-100 dark:border-zinc-900">
                  <td colSpan={8} className="px-2 pb-2 text-zinc-600 dark:text-zinc-400">
                    <span className="whitespace-pre-wrap">📝 {transaction.note}</span>
                  </td>
                </tr>
              )}
              {expandedId === transaction.id && (
                <tr>
                  <td colSpan={8} className="p-2">
                    <HistoricalEventPanel
                      date={transaction.date}
                      assetLabel={`${ASSET_LABELS[transaction.assetType] ?? transaction.assetType} (${transaction.subType})`}
                      quantity={transaction.quantity}
                      note={transaction.note}
                    />
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
