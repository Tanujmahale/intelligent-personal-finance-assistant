"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/utils/format";
import type { CategoryBreakdown } from "@/types";
import { PieChart as PieIcon } from "lucide-react";

const COLORS = [
  "#3373fb", "#22c55e", "#f59e0b", "#ec4899", "#8b5cf6",
  "#14b8a6", "#ef4444", "#6366f1", "#84cc16",
];

export function CategoryChart({ data }: { data: CategoryBreakdown[] }) {
  return (
    <Card>
      <h3 className="text-sm font-semibold text-slate-900">Spending by Category</h3>
      <p className="text-xs text-slate-500">Current month, real data from your expenses</p>
      {data.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={PieIcon}
            title="No expenses yet"
            description="Add an expense to see your category breakdown here."
          />
        </div>
      ) : (
        <div className="mt-2 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="total"
                nameKey="category"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={2}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{ fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
