"use client";

import { useState } from "react";
import { AssetType, CRYPTO_OPTIONS, FOREX_OPTIONS, Transaction } from "@/lib/types";

interface Props {
  onAdd: (transaction: Transaction) => void;
}

export default function TransactionForm({ onAdd }: Props) {
  const [assetType, setAssetType] = useState<AssetType>("gold");
  const [subType, setSubType] = useState<string>("gram");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [quantity, setQuantity] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [commission, setCommission] = useState("");
  const [note, setNote] = useState("");

  function handleAssetTypeChange(next: AssetType) {
    setAssetType(next);
    if (next === "gold") setSubType("gram");
    if (next === "crypto") setSubType(CRYPTO_OPTIONS[0].id);
    if (next === "forex") setSubType(FOREX_OPTIONS[0].code);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date || !time || !quantity || !buyPrice) return;

    onAdd({
      id: crypto.randomUUID(),
      assetType,
      subType,
      date,
      time,
      quantity: parseFloat(quantity),
      buyPrice: parseFloat(buyPrice),
      commission: commission ? parseFloat(commission) : undefined,
      note: note || undefined,
    });

    setDate("");
    setTime("");
    setQuantity("");
    setBuyPrice("");
    setCommission("");
    setNote("");
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <h2 className="text-lg font-semibold">Yeni İşlem Ekle</h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm">
          Varlık Türü
          <select
            value={assetType}
            onChange={(e) => handleAssetTypeChange(e.target.value as AssetType)}
            className="rounded border border-zinc-300 p-2 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="gold">Altın (gram)</option>
            <option value="crypto">Kripto</option>
            <option value="forex">Döviz</option>
          </select>
        </label>

        {assetType === "crypto" && (
          <label className="flex flex-col gap-1 text-sm">
            Kripto Para
            <select
              value={subType}
              onChange={(e) => setSubType(e.target.value)}
              className="rounded border border-zinc-300 p-2 dark:border-zinc-700 dark:bg-zinc-900"
            >
              {CRYPTO_OPTIONS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
        )}

        {assetType === "forex" && (
          <label className="flex flex-col gap-1 text-sm">
            Para Birimi
            <select
              value={subType}
              onChange={(e) => setSubType(e.target.value)}
              className="rounded border border-zinc-300 p-2 dark:border-zinc-700 dark:bg-zinc-900"
            >
              {FOREX_OPTIONS.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <label className="flex flex-col gap-1 text-sm">
          Alış Tarihi
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required
            className="rounded border border-zinc-300 p-2 dark:border-zinc-700 dark:bg-zinc-900" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Alış Saati
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required
            className="rounded border border-zinc-300 p-2 dark:border-zinc-700 dark:bg-zinc-900" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Miktar
          <input type="number" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} required
            className="rounded border border-zinc-300 p-2 dark:border-zinc-700 dark:bg-zinc-900" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Alış Fiyatı (TL)
          <input type="number" step="any" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} required
            className="rounded border border-zinc-300 p-2 dark:border-zinc-700 dark:bg-zinc-900" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Komisyon (opsiyonel)
          <input type="number" step="any" value={commission} onChange={(e) => setCommission(e.target.value)}
            className="rounded border border-zinc-300 p-2 dark:border-zinc-700 dark:bg-zinc-900" />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        Not (finans günlüğü)
        <input type="text" value={note} onChange={(e) => setNote(e.target.value)}
          placeholder="Örn: ABD-İran gerilimi nedeniyle aldım"
          className="rounded border border-zinc-300 p-2 dark:border-zinc-700 dark:bg-zinc-900" />
      </label>

      <button type="submit" className="mt-2 rounded bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-black">
        İşlemi Kaydet
      </button>
    </form>
  );
}
