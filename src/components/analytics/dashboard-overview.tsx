"use client";

import {
  Copy,
  FileText,
  GitCompare,
  Hash,
  Percent,
  Type,
} from "lucide-react";
import { StatCard } from "./stat-card";
import type { DashboardStats } from "@/hooks/use-json-analysis";

export function DashboardOverview({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      <StatCard
        label="Total JSON Keys"
        value={stats.totalKeys.toLocaleString()}
        icon={Hash}
      />
      <StatCard
        label="Total Strings"
        value={stats.totalStrings.toLocaleString()}
        icon={Type}
        accent="violet"
      />
      <StatCard
        label="Duplicate Strings"
        value={stats.duplicateStrings.toLocaleString()}
        icon={Copy}
        accent="amber"
        hint={
          stats.duplicateSavings > 0
            ? `${stats.duplicateSavings.toLocaleString()} saved`
            : undefined
        }
      />
      <StatCard
        label="Missing Translations"
        value={stats.missingTranslations.toLocaleString()}
        icon={FileText}
        accent="rose"
      />
      <StatCard
        label="Modified Keys"
        value={stats.modifiedKeys.toLocaleString()}
        icon={GitCompare}
        accent="violet"
      />
      <StatCard
        label="Completion"
        value={`${stats.completion}%`}
        icon={Percent}
        accent="emerald"
      />
    </div>
  );
}
