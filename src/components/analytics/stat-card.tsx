import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  accent?: "default" | "violet" | "amber" | "emerald" | "rose";
}

const ACCENTS: Record<NonNullable<StatCardProps["accent"]>, string> = {
  default: "bg-primary/10 text-primary",
  violet: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  amber: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  emerald: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  rose: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  accent = "default",
}: StatCardProps) {
  return (
    <Card className="glass flex items-center gap-3 p-4">
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          ACCENTS[accent]
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <div className="truncate text-xs font-medium text-muted-foreground">
          {label}
        </div>
        <div className="text-xl font-semibold tracking-tight">{value}</div>
        {hint && (
          <div className="truncate text-[11px] text-muted-foreground">
            {hint}
          </div>
        )}
      </div>
    </Card>
  );
}
