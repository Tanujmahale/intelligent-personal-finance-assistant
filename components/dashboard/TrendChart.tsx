"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils/format";
import type { MonthlyTrendPoint } from "@/types";

export function TrendChart({ data }: { data: MonthlyTrendPoint[] }) {
  return (
    <Card>
      <h3 className="text-sm font-semibold text-slate-900">Monthly Spending Trend</h3>
      <p className="text-xs text-slate-500">Last 6 months, real data from your expenses</p>
      <div className="mt-2 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 4, right: 16, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke="#94a3b8"
              tickFormatter={(v) => `₹${v >= 1000 ? `${v / 1000}k` : v}`}
            />
            <Tooltip formatter={(v: number) => formatCurrency(v)} />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#3373fb"
              strokeWidth={2.5}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
