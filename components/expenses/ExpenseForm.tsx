"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Label, Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "@/types";
import type { NewExpenseInput, Expense } from "@/types";
import { todayIso } from "@/lib/utils/format";

export function ExpenseForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial?: Partial<NewExpenseInput>;
  onSaved: (expense: Expense) => void;
  onCancel?: () => void;
}) {
  const [amount, setAmount] = useState(initial?.amount?.toString() ?? "");
  const [category, setCategory] = useState(initial?.category ?? "Food");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [date, setDate] = useState(initial?.expense_date ?? todayIso());
  const [paymentMethod, setPaymentMethod] = useState(initial?.payment_method ?? "Unknown");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean((initial as any)?.id);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    const amountNum = Number(amount);

    if (!amount || Number.isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount = "Amount must be a positive number";
    }
    if (!description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!date || Number.isNaN(Date.parse(date))) {
      newErrors.date = "Please choose a valid date";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSaving(true);
    try {
      const id = (initial as any)?.id as string | undefined;
      const res = await fetch(id ? `/api/expenses/${id}` : "/api/expenses", {
        method: id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountNum,
          category,
          description: description.trim(),
          expense_date: date,
          payment_method: paymentMethod,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not save expense");
      toast.success(id ? "Expense updated" : "Expense added");
      onSaved(json.expense);
      if (!id) {
        setAmount("");
        setDescription("");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount">Amount (₹)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
          {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount}</p>}
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select id="category" value={category} onChange={(e) => setCategory(e.target.value as any)}>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Dinner at a restaurant"
        />
        {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date}</p>}
        </div>
        <div>
          <Label htmlFor="paymentMethod">Payment Method</Label>
          <Select
            id="paymentMethod"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as any)}
          >
            {PAYMENT_METHODS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : isEdit ? "Update Expense" : "Save Expense"}
        </Button>
      </div>
    </form>
  );
}
