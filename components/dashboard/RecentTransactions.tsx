import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { Expense } from "@/types";
import { Receipt } from "lucide-react";

export function RecentTransactions({ expenses }: { expenses: Expense[] }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Recent Transactions</h3>
        <Link href="/expenses" className="text-xs font-medium text-brand-600 hover:underline">
          View all
        </Link>
      </div>
      {expenses.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={Receipt}
            title="No transactions yet"
            description="Expenses you add will show up here."
          />
        </div>
      ) : (
        <ul className="mt-3 divide-y divide-slate-100">
          {expenses.map((e) => (
            <li key={e.id} className="flex items-center justify-between py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">
                  {e.description || e.category}
                </p>
                <p className="text-xs text-slate-500">
                  {e.category} · {formatDate(e.expense_date)}
                </p>
              </div>
              <span className="ml-3 shrink-0 text-sm font-semibold text-slate-900">
                {formatCurrency(Number(e.amount))}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
