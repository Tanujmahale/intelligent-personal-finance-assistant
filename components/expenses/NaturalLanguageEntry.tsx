"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Sparkles, AlertTriangle } from "lucide-react";
import { Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import type { ExtractedExpense, Expense } from "@/types";

export function NaturalLanguageEntry({ onSaved }: { onSaved: (e: Expense) => void }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [extracted, setExtracted] = useState<ExtractedExpense | null>(null);
  const [unavailable, setUnavailable] = useState<string | null>(null);

  async function handleExtract() {
    if (!text.trim()) {
      toast.error("Please describe your expense first");
      return;
    }
    setLoading(true);
    setUnavailable(null);
    setExtracted(null);
    try {
      const res = await fetch("/api/ai/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (res.status === 503) {
          setUnavailable(json.error);
        } else {
          toast.error(json.error || "Could not extract expense");
        }
        return;
      }
      setExtracted(json.extracted);
    } catch {
      toast.error("Network error while contacting the AI service.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-brand-600" />
        <h3 className="text-sm font-semibold text-slate-900">Add with Natural Language</h3>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Try: &ldquo;I spent ₹450 on dinner at a restaurant yesterday&rdquo;
      </p>

      <div className="mt-3 space-y-3">
        <Textarea
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Describe your expense in plain language..."
        />
        <Button onClick={handleExtract} disabled={loading}>
          {loading ? "Analyzing..." : "Extract with AI"}
        </Button>
      </div>

      {unavailable && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{unavailable} You can still add this expense manually below.</span>
        </div>
      )}

      {extracted && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
            Review extracted details before saving
          </p>
          <ExpenseForm
            initial={{
              amount: extracted.amount,
              category: extracted.category,
              description: extracted.description,
              expense_date: extracted.date,
              payment_method: extracted.payment_method,
            }}
            onSaved={(e) => {
              setExtracted(null);
              setText("");
              onSaved(e);
            }}
            onCancel={() => setExtracted(null)}
          />
        </div>
      )}
    </Card>
  );
}
