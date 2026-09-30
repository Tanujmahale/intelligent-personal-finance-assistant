import { Card } from "@/components/ui/Card";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/format";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
  hint,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "default" | "positive" | "warning" | "danger";
  hint?: string;
}) {
  return (
    <Card className="flex items-start justify-between">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900">
          {value}
        </p>
        {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      </div>
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          tone === "default" && "bg-brand-50 text-brand-600",
          tone === "positive" && "bg-emerald-50 text-emerald-600",
          tone === "warning" && "bg-amber-50 text-amber-600",
          tone === "danger" && "bg-red-50 text-red-600"
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
    </Card>
  );
}
