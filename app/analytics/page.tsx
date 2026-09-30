"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/dashboard/StatCard";
import { AnalyticsCharts } from "@/components/analytics/AnalyticsCharts";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/utils/format";
import type { AnalyticsSummary } from "@/types";
import { TrendingUp, Receipt, Calendar, ArrowUpRight } from "lucide-react";

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/analytics");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Could not load analytics");
        setAnalytics(json.analytics);
      } catch (err: any) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Analytics</h1>
        <p className="text-sm text-slate-500">Deeper insight into this month's spending, calculated from real data.</p>
      </div>

      {loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Skeleton className="h-72" />
            <Skeleton className="h-72" />
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {!loading && !error && analytics && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Spending" value={formatCurrency(analytics.totalSpending)} icon={TrendingUp} />
            <StatCard label="Transactions" value={String(analytics.transactionCount)} icon={Receipt} />
            <StatCard label="Avg. Daily Spending" value={formatCurrency(analytics.averageDailySpending)} icon={Calendar} />
            <StatCard
              label="Highest Expense"
              value={analytics.highestExpense ? formatCurrency(Number(analytics.highestExpense.amount)) : "—"}
              icon={ArrowUpRight}
              hint={analytics.highestExpense?.description}
            />
          </div>
          <div className="mt-4">
            <AnalyticsCharts analytics={analytics} />
          </div>
        </>
      )}
    </AppShell>
  );
}
