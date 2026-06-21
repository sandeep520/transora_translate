"use client";

import * as React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  Copy,
  CopyCheck,
  Download,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DuplicateEntry, DuplicateStats } from "@/types/duplicate";
import { copyToClipboard, downloadJson } from "@/utils/file";
import { cn } from "@/lib/utils";

interface DuplicateDetectorProps {
  duplicates: DuplicateEntry[];
  stats: DuplicateStats;
  disabled?: boolean;
}

export function DuplicateDetector({
  duplicates,
  stats,
  disabled,
}: DuplicateDetectorProps) {
  const [query, setQuery] = React.useState("");
  const [sortDesc, setSortDesc] = React.useState(true);
  const [copied, setCopied] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? duplicates.filter(
          (d) =>
            d.value.toLowerCase().includes(q) ||
            d.keys.some((k) => k.toLowerCase().includes(q))
        )
      : duplicates;
    return [...filtered].sort((a, b) =>
      sortDesc ? b.count - a.count : a.count - b.count
    );
  }, [duplicates, query, sortDesc]);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 52,
    overscan: 12,
  });

  const handleExport = () =>
    downloadJson({ duplicates }, "duplicate-report.json");

  const handleCopy = async () => {
    const ok = await copyToClipboard(JSON.stringify({ duplicates }, null, 2));
    if (ok) {
      setCopied(true);
      toast.success("Duplicate report copied.");
      setTimeout(() => setCopied(false), 1500);
    } else toast.error("Copy failed.");
  };

  return (
    <Card className="glass">
      <CardHeader className="gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Copy className="h-4 w-4 text-primary" /> Duplicate String Detection
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={duplicates.length === 0}
              onClick={handleCopy}
            >
              {copied ? (
                <CopyCheck className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={duplicates.length === 0}
              onClick={handleExport}
            >
              <Download className="h-4 w-4" /> Export
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Total Strings" value={stats.totalStrings} />
          <Stat label="Duplicate Strings" value={stats.duplicateValues} />
          <Stat
            label="Potential Savings"
            value={stats.potentialSavings}
            accent
          />
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex h-9 flex-1 items-center gap-2 rounded-lg border bg-background px-2.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search duplicates…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortDesc((s) => !s)}
          >
            {sortDesc ? (
              <ArrowDownAZ className="h-4 w-4" />
            ) : (
              <ArrowUpAZ className="h-4 w-4" />
            )}
            Count
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {disabled || duplicates.length === 0 ? (
          <EmptyState
            message={
              disabled
                ? "Add valid JSON to scan for duplicates."
                : "No duplicate strings found. 🎉"
            }
          />
        ) : (
          <div className="overflow-hidden rounded-xl border">
            <div className="grid grid-cols-[1fr_70px_1.4fr] gap-2 border-b bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground">
              <span>String</span>
              <span className="text-center">Count</span>
              <span>Keys</span>
            </div>
            <div ref={scrollRef} className="max-h-[420px] overflow-y-auto">
              <div
                style={{ height: virtualizer.getTotalSize() }}
                className="relative"
              >
                {virtualizer.getVirtualItems().map((vi) => {
                  const row = rows[vi.index];
                  return (
                    <div
                      key={vi.key}
                      className={cn(
                        "absolute left-0 top-0 grid w-full grid-cols-[1fr_70px_1.4fr] items-center gap-2 border-b px-3 text-sm",
                        vi.index % 2 ? "bg-background" : "bg-muted/20"
                      )}
                      style={{
                        height: vi.size,
                        transform: `translateY(${vi.start}px)`,
                      }}
                    >
                      <span className="truncate font-medium" title={row.value}>
                        {row.value}
                      </span>
                      <span className="text-center">
                        <Badge variant="warning">{row.count}</Badge>
                      </span>
                      <span
                        className="truncate text-xs text-muted-foreground"
                        title={row.keys.join(", ")}
                      >
                        {row.keys.join(", ")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="border-t px-3 py-2 text-xs text-muted-foreground">
              Showing {rows.length.toLocaleString()} of{" "}
              {duplicates.length.toLocaleString()} duplicate groups
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border bg-background/60 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={cn(
          "text-lg font-semibold",
          accent && "text-emerald-600 dark:text-emerald-400"
        )}
      >
        {value.toLocaleString()}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-40 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
      {message}
    </div>
  );
}
