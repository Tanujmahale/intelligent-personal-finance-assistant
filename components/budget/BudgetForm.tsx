"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/Card";
import { Label, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function BudgetForm({
  currentAmount,
  month,
  year,
  onSaved,
}: {
  currentAmount: number;
  month: number;
  year: number;
  onSaved: () => void;
}) {
  const [amount, setAmount] = useState(currentAmount > 0 ? String(currentAmount) : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const num = Number(amount);
    if (!amount || Number.isNaN(num) || num < 0) {
      setError("Please enter a valid, non-negative budget amount");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: num, month, year }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not save budget");
      toast.success("Budget saved");
      onSaved();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold text-slate-900">Set Monthly Budget</h3>
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <div className="flex-1">
          <Label htmlFor="budget-amount">Monthly budget (₹)</Label>
          <Input
            id="budget-amount"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 25000"
          />
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Budget"}
        </Button>
      </form>
    </Card>
  );
}
