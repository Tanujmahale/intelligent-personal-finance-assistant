"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Pencil, Trash2, Receipt } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { Expense } from "@/types";

export function ExpenseTable({
  expenses,
  onChanged,
}: {
  expenses: Expense[];
  onChanged: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this expense? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not delete expense");
      toast.success("Expense deleted");
      onChanged();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  if (expenses.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="No expenses found"
        description="Try adjusting your filters, or add your first expense above."
      />
    );
  }

  return (
    <Card className="overflow-x-auto p-0">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Description</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Payment Method</th>
            <th className="px-4 py-3 text-right font-medium">Amount</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {expenses.map((e) =>
            editingId === e.id ? (
              <tr key={e.id}>
                <td colSpan={6} className="bg-slate-50 px-4 py-4">
                  <ExpenseForm
                    initial={{ ...e } as any}
                    onSaved={() => {
                      setEditingId(null);
                      onChanged();
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                </td>
              </tr>
            ) : (
              <tr key={e.id} className="hover:bg-slate-50">
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                  {formatDate(e.expense_date)}
                </td>
                <td className="px-4 py-3 text-slate-800">{e.description || "—"}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    {e.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{e.payment_method}</td>
                <td className="px-4 py-3 text-right font-semibold text-slate-900">
                  {formatCurrency(Number(e.amount))}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(e.id)}
                      aria-label="Edit expense"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(e.id)}
                      disabled={deletingId === e.id}
                      aria-label="Delete expense"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </Card>
  );
}
