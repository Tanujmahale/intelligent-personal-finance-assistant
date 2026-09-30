"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Database, ShieldAlert } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);

  async function handleLoadDemoData() {
    if (!confirm("This will replace all existing demo-user expenses and budget with sample data. Continue?")) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/demo/seed", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not load demo data");
      toast.success(`Loaded ${json.count} demo expenses`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Demo data and project information.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-brand-600" />
            <h3 className="text-sm font-semibold text-slate-900">Demo Data</h3>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Load realistic, clearly-labelled sample expenses and a sample budget for the demo user, so
            the dashboard, analytics and AI features have real data to work with.
          </p>
          <Button className="mt-4" onClick={handleLoadDemoData} disabled={loading}>
            {loading ? "Loading demo data..." : "Load Demo Data"}
          </Button>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-600" />
            <h3 className="text-sm font-semibold text-slate-900">Disclaimer</h3>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            This is an academic/student project: an Intelligent Personal Finance Assistant that helps
            you understand your own spending. It is <strong>not</strong> a professional financial
            advisor, and its AI-generated suggestions are informational only. Always consult a
            licensed professional for real financial, tax, or investment decisions.
          </p>
        </Card>
      </div>
    </AppShell>
  );
}
