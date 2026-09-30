import { Card } from "@/components/ui/Card";
import { formatCurrency, cn } from "@/lib/utils/format";
import type { BudgetStatus } from "@/types";

export function BudgetProgress({
  spent,
  budget,
  percentageUsed,
  status,
}: {
  spent: number;
  budget: number;
  percentageUsed: number;
  status: BudgetStatus;
}) {
  const barColor =
    status === "Over Budget"
      ? "bg-red-500"
      : status === "Near Limit"
      ? "bg-amber-500"
      : "bg-emerald-500";

  const badgeColor =
    status === "Over Budget"
      ? "bg-red-50 text-red-700"
      : status === "Near Limit"
      ? "bg-amber-50 text-amber-700"
      : "bg-emerald-50 text-emerald-700";

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Budget Progress</h3>
        <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", badgeColor)}>
          {status}
        </span>
      </div>
      {budget <= 0 ? (
        <p className="mt-4 text-sm text-slate-500">
          No monthly budget set yet. Set one on the Budget page to track progress.
        </p>
      ) : (
        <>
          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={cn("h-full rounded-full transition-all", barColor)}
              style={{ width: `${Math.min(percentageUsed, 100)}%` }}
            />
          </div>
          <div className="mt-3 flex justify-between text-sm">
            <span className="text-slate-500">
              {formatCurrency(spent)} spent of {formatCurrency(budget)}
            </span>
            <span className="font-medium text-slate-700">{percentageUsed}%</span>
          </div>
        </>
      )}
    </Card>
  );
}
