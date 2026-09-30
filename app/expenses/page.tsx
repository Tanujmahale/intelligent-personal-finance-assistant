"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { NaturalLanguageEntry } from "@/components/expenses/NaturalLanguageEntry";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { ExpenseTable } from "@/components/expenses/ExpenseTable";
import { EXPENSE_CATEGORIES } from "@/types";
import type { Expense } from "@/types";
import { Plus, X } from "lucide-react";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [showManualForm, setShowManualForm] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== "All") params.set("category", category);
      if (search) params.set("search", search);
      const res = await fetch(`/api/expenses?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not load expenses");
      setExpenses(json.expenses);
    } catch (err: any) {
      toast.error(err.message);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => {
    const timeout = setTimeout(load, 250); // debounce search
    return () => clearTimeout(timeout);
  }, [load]);

  const sorted = [...(expenses ?? [])].sort((a, b) => {
    if (sort === "newest") return b.expense_date.localeCompare(a.expense_date);
    if (sort === "oldest") return a.expense_date.localeCompare(b.expense_date);
    if (sort === "highest") return Number(b.amount) - Number(a.amount);
    return Number(a.amount) - Number(b.amount);
  });

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Expenses</h1>
          <p className="text-sm text-slate-500">Add, search, filter and manage your transactions.</p>
        </div>
        <Button onClick={() => setShowManualForm((v) => !v)}>
          {showManualForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showManualForm ? "Close" : "Add Manually"}
        </Button>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <NaturalLanguageEntry onSaved={load} />
        {showManualForm && (
          <Card>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Add Expense Manually</h3>
            <ExpenseForm onSaved={() => { load(); setShowManualForm(false); }} onCancel={() => setShowManualForm(false)} />
          </Card>
        )}
      </div>

      <Card className="mb-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Input
            placeholder="Search description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="All">All Categories</option>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Select value={sort} onChange={(e) => setSort(e.target.value as any)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="highest">Highest amount</option>
            <option value="lowest">Lowest amount</option>
          </Select>
        </div>
      </Card>

      {loading && !expenses ? (
        <Skeleton className="h-64" />
      ) : (
        <ExpenseTable expenses={sorted} onChanged={load} />
      )}
    </AppShell>
  );
}
