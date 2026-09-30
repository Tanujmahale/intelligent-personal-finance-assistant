import { cn } from "@/lib/utils/format";
import type { ReactNode } from "react";

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-5 shadow-card",
        className
      )}
    >
      {children}
    </div>
  );
}
