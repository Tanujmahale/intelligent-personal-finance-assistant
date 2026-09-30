"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/utils/format";
import { Sparkles, AlertTriangle } from "lucide-react";

interface SummaryResponse {
  calculated: {
    totalSpending: number;
    topCategory: string | null;
    topCategoryPercentage: number | null;
    largestExpense: { amount: number; description: string; category: string } | null;
    budget: number | null;
    budgetStatus: string | null;
  };
  ai: { narrative: string; observations: string[]; suggestions: string[] } | null;
  aiUnavailable?: boolean;
  message?: string;
}

export function AiSpendingSummary() {
  const [data, setData] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/ai/summary");
        const json = await res.json();
        if (res.ok) setData(json);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Skeleton className="h-56" />;
  if (!data) return null;

  const { calculated, ai, aiUnavailable, message } = data;

  return (
    <Card>
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-brand-600" />
        <h3 className="text-sm font-semibold text-slate-900">AI Spending Summary</h3>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat label="Monthly spending" value={formatCurrency(calculated.totalSpending)} />
        <MiniStat label="Top category" value={calculated.topCategory ?? "—"} />
        <MiniStat
          label="Largest expense"
          value={calculated.largestExpense ? formatCurrency(calculated.largestExpense.amount) : "—"}
          hint={calculated.largestExpense?.description}
        />
        <MiniStat label="Budget status" value={calculated.budgetStatus ?? "Not set"} />
      </div>

      {aiUnavailable ? (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      ) : ai ? (
        <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-700">{ai.narrative}</p>
          {ai.observations.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">AI observations</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-600">
                {ai.observations.map((o, i) => <li key={i}>{o}</li>)}
              </ul>
            </div>
          )}
          {ai.suggestions.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Suggestions</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-600">
                {ai.suggestions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
          <p className="text-xs text-slate-400">
            Informational only — not professional financial advice.
          </p>
        </div>
      ) : null}
    </Card>
  );
}

function MiniStat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-0.5 truncate text-sm font-semibold text-slate-900">{value}</p>
      {hint && <p className="truncate text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
