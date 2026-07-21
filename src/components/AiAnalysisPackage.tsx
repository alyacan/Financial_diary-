"use client";

import { useState } from "react";
import { ArchivedPeriod, Transaction } from "@/lib/types";
import {
  ANALYSIS_TYPES,
  AI_ROLES,
  DETAIL_LEVELS,
  buildExpenseAnalysisPrompt,
} from "@/lib/expenseAnalysisPrompt";
import { buildPeriodDocx } from "@/lib/periodDocx";

interface Props {
  period: ArchivedPeriod;
  allPeriods: ArchivedPeriod[];
  periodTransactions: Transaction[];
}

export default function AiAnalysisPackage({ period, allPeriods, periodTransactions }: Props) {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [analysisType, setAnalysisType] = useState<string>(ANALYSIS_TYPES[0]);
  const [role, setRole] = useState<string>(AI_ROLES[0]);
  const [detailLevel, setDetailLevel] = useState<string>(DETAIL_LEVELS[1]);
  const [focus, setFocus] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [generatingDocx, setGeneratingDocx] = useState(false);

  function handleGeneratePrompt() {
    const prompt = buildExpenseAnalysisPrompt(
      { analysisType, role, detailLevel, focus },
      period,
      allPeriods,
      periodTransactions
    );
    setGeneratedPrompt(prompt);
    setCopied(false);
    setWizardOpen(false);
  }

  async function handleCopyPrompt() {
    if (!generatedPrompt) return;
    await navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDownloadDocx() {
    setGeneratingDocx(true);
    try {
      const blob = await buildPeriodDocx(period, allPeriods, periodTransactions, generatedPrompt ?? undefined);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `finansal-donem-raporu-${period.startDate}_${period.endDate}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setGeneratingDocx(false);
    }
  }

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div>
        <h2 className="text-lg font-semibold">AI Analiz Paketi</h2>
        <p className="text-sm text-zinc-500">
          Uygulama kendisi analiz yapmaz. Burada hazırlanan prompt ve Word dosyasını, tercih ettiğin
          yapay zekâ platformuna (ChatGPT, Claude, Gemini vb.) birlikte yükleyerek kendi analizini alabilirsin.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setWizardOpen((v) => !v)}
          className="rounded bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-black"
        >
          {wizardOpen ? "Sihirbazı Kapat" : "Prompt Oluştur"}
        </button>
        <button
          onClick={handleDownloadDocx}
          disabled={generatingDocx}
          className="rounded border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          {generatingDocx ? "Oluşturuluyor..." : "Word (.docx) Oluştur"}
        </button>
      </div>

      {wizardOpen && (
        <div className="flex flex-col gap-3 rounded border border-zinc-200 p-3 dark:border-zinc-800">
          <label className="flex flex-col gap-1 text-sm">
            Nasıl bir analiz istiyorsun?
            <select
              value={analysisType}
              onChange={(e) => setAnalysisType(e.target.value)}
              className="rounded border border-zinc-300 p-2 dark:border-zinc-700 dark:bg-zinc-900"
            >
              {ANALYSIS_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Yapay zekâ hangi rolde analiz yapsın?
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="rounded border border-zinc-300 p-2 dark:border-zinc-700 dark:bg-zinc-900"
            >
              {AI_ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Analiz seviyesi
            <select
              value={detailLevel}
              onChange={(e) => setDetailLevel(e.target.value)}
              className="rounded border border-zinc-300 p-2 dark:border-zinc-700 dark:bg-zinc-900"
            >
              {DETAIL_LEVELS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Özellikle odaklanmasını istediğin konu (opsiyonel)
            <textarea
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              placeholder="Örn: Bu ay neden fazla harcama yaptığımı bul. / Tasarruf edebileceğim alanları göster. / Önümüzdeki 3 ay için bütçe planı oluştur. / Aboneliklerimi analiz et."
              className="min-h-20 rounded border border-zinc-300 p-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>

          <button
            onClick={handleGeneratePrompt}
            className="self-start rounded bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-black"
          >
            Promptu Oluştur
          </button>
        </div>
      )}

      {generatedPrompt && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Oluşturulan Prompt</p>
            <button onClick={handleCopyPrompt} className="text-sm text-zinc-500 hover:underline">
              {copied ? "Kopyalandı ✓" : "Kopyala"}
            </button>
          </div>
          <textarea
            readOnly
            value={generatedPrompt}
            className="min-h-40 rounded border border-zinc-300 p-2 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
      )}
    </section>
  );
}
