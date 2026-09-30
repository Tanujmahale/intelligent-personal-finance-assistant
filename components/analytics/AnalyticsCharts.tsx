"use client";

import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils/format";
import type { AnalyticsSummary } from "@/types";

const COLORS = ["#3373fb", "#22c55e", "#f59e0b", "#ec4899", "#8b5cf6", "#14b8a6", "#ef4444", "#6366f1", "#84cc16"];

export function AnalyticsCharts({ analytics }: { analytics: AnalyticsSummary }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <h3 className="text-sm font-semibold text-slate-900">Category Breakdown</h3>
        <p className="text-xs text-slate-500">Percentage share of total spending</p>
        <div className="mt-2 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={analytics.categoryBreakdown} dataKey="total" nameKey="category" innerRadius={55} outerRadius={95} paddingAngle={2}>
                {analytics.categoryBreakdown.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-slate-900">Monthly Spending</h3>
        <p className="text-xs text-slate-500">Total spent per month (last 6 months)</p>
        <div className="mt-2 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v) => `₹${v >= 1000 ? `${v / 1000}k` : v}`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="total" fill="#3373fb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="lg:col-span-2">
        <h3 className="text-sm font-semibold text-slate-900">Spending Trend</h3>
        <p className="text-xs text-slate-500">Line view of the same 6-month trend</p>
        <div className="mt-2 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v) => `₹${v >= 1000 ? `${v / 1000}k` : v}`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Line type="monotone" dataKey="total" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
