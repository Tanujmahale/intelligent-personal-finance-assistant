"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AppShell } from "@/components/layout/AppShell";
import { BudgetForm } from "@/components/budget/BudgetForm";
import { BudgetProgress } from "@/components/dashboard/BudgetProgress";
import { AiSpendingSummary } from "@/components/summary/AiSpendingSummary";
import { Skeleton } from "@/components/ui/Skeleton";
import type { BudgetStatus } from "@/types";

interface BudgetResponse {
  budget: { amount: number } | null;
  spent: number;
  remaining: number;
  percentageUsed: number;
  status: BudgetStatus;
}

export default function BudgetPage() {
  const [data, setData] = useState<BudgetResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const now = new Date();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/budget?month=${now.getMonth() + 1}&year=${now.getFullYear()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not load budget");
      setData(json);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Budget</h1>
        <p className="text-sm text-slate-500">Set your monthly budget and track how you're doing against it.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <BudgetForm
            currentAmount={data?.budget?.amount ?? 0}
            month={now.getMonth() + 1}
            year={now.getFullYear()}
            onSaved={load}
          />
          {loading ? (
            <Skeleton className="h-40" />
          ) : (
            data && (
              <BudgetProgress
                spent={data.spent}
                budget={data.budget?.amount ?? 0}
                percentageUsed={data.percentageUsed}
                status={data.status}
              />
            )
          )}
        </div>
        <AiSpendingSummary />
      </div>
    </AppShell>
  );
}
