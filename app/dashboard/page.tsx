"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/dashboard/StatCard";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { BudgetProgress } from "@/components/dashboard/BudgetProgress";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/utils/format";
import type { DashboardData } from "@/types";
import { Wallet, Receipt, TrendingDown, PiggyBank, Tag } from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/dashboard");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load dashboard");
        if (!cancelled) setData(json.dashboard);
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message);
          toast.error(err.message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">
          A snapshot of your spending this month, powered by your real transaction data.
        </p>
      </div>

      {loading && <DashboardSkeleton />}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && data && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Spending"
              value={formatCurrency(data.totalSpendingThisMonth)}
              icon={Wallet}
            />
            <StatCard
              label="Monthly Budget"
              value={data.monthlyBudget > 0 ? formatCurrency(data.monthlyBudget) : "Not set"}
              icon={PiggyBank}
              tone="positive"
            />
            <StatCard
              label="Remaining Budget"
              value={
                data.monthlyBudget > 0 ? formatCurrency(data.remainingBudget) : "—"
              }
              icon={TrendingDown}
              tone={data.remainingBudget < 0 ? "danger" : "default"}
            />
            <StatCard
              label="Transactions"
              value={String(data.transactionCount)}
              icon={Receipt}
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <BudgetProgress
                spent={data.totalSpendingThisMonth}
                budget={data.monthlyBudget}
                percentageUsed={data.budgetPercentageUsed}
                status={data.budgetStatus}
              />
            </div>
            <StatCard
              label="Top Spending Category"
              value={data.topCategory ? data.topCategory.category : "—"}
              icon={Tag}
              hint={data.topCategory ? `${formatCurrency(data.topCategory.total)} (${data.topCategory.percentage}%)` : undefined}
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <CategoryChart data={data.categoryBreakdown} />
            <TrendChart data={data.monthlyTrend} />
          </div>

          <div className="mt-4">
            <RecentTransactions expenses={data.recentTransactions} />
          </div>
        </>
      )}
    </AppShell>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-64" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
    </div>
  );
}
