"use client";

import * as React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  Copy,
  CopyCheck,
  Crosshair,
  Download,
  FileText,
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
import { Progress } from "@/components/ui/progress";
import type { MissingEntry, MissingReport, MissingReason } from "@/types/missing";
import { copyToClipboard, downloadJson } from "@/utils/file";
import { cn } from "@/lib/utils";

interface MissingDetectorProps {
  report: MissingReport;
  onJump?: (key: string) => void;
  disabled?: boolean;
}

const FILTERS: { key: MissingReason | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "empty", label: "Empty" },
  { key: "null", label: "Null" },
  { key: "placeholder", label: "Placeholder" },
];

function reasonLabel(e: MissingEntry): string {
  if (e.reason === "null") return "null";
  if (e.reason === "empty") return "empty";
  return `"${e.value}"`;
}

export function MissingDetector({
  report,
  onJump,
  disabled,
}: MissingDetectorProps) {
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<MissingReason | "all">("all");
  const [copied, setCopied] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const { entries, summary } = report;

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (filter !== "all" && e.reason !== filter) return false;
      if (q && !e.key.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [entries, query, filter]);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 44,
    overscan: 12,
  });

  const handleExport = () =>
    downloadJson({ missing: entries, summary }, "missing-report.json");

  const handleCopy = async () => {
    const ok = await copyToClipboard(
      JSON.stringify({ missing: entries, summary }, null, 2)
    );
    if (ok) {
      setCopied(true);
      toast.success("Missing report copied.");
      setTimeout(() => setCopied(false), 1500);
    } else toast.error("Copy failed.");
  };

  return (
    <Card className="glass">
      <CardHeader className="gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-primary" /> Missing Translation
            Detector
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={entries.length === 0}
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
              disabled={entries.length === 0}
              onClick={handleExport}
            >
              <Download className="h-4 w-4" /> Export
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Total Keys" value={summary.totalKeys} />
          <Stat label="Translated" value={summary.translatedKeys} />
          <Stat label="Missing" value={summary.missingKeys} accent="rose" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Progress value={summary.completion} />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Translation completion</span>
            <span className="font-medium text-foreground">
              {summary.completion}% Complete
            </span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex h-9 flex-1 items-center gap-2 rounded-lg border bg-background px-2.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search keys…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center gap-1">
            {FILTERS.map((f) => (
              <Button
                key={f.key}
                variant={filter === f.key ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {disabled || entries.length === 0 ? (
          <EmptyState
            message={
              disabled
                ? "Add valid JSON to scan for missing translations."
                : "No missing translations. Everything looks translated! 🎉"
            }
          />
        ) : (
          <div className="overflow-hidden rounded-xl border">
            <div className="grid grid-cols-[1.6fr_1fr_90px_44px] gap-2 border-b bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground">
              <span>Key</span>
              <span>Value</span>
              <span>Status</span>
              <span />
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
                        "absolute left-0 top-0 grid w-full grid-cols-[1.6fr_1fr_90px_44px] items-center gap-2 border-b px-3 text-sm",
                        vi.index % 2 ? "bg-background" : "bg-muted/20"
                      )}
                      style={{
                        height: vi.size,
                        transform: `translateY(${vi.start}px)`,
                      }}
                    >
                      <span className="truncate font-mono text-xs" title={row.key}>
                        {row.key}
                      </span>
                      <span className="truncate text-xs italic text-muted-foreground">
                        {reasonLabel(row)}
                      </span>
                      <span>
                        <Badge variant="destructive">Missing</Badge>
                      </span>
                      <button
                        type="button"
                        aria-label={`Jump to ${row.key}`}
                        title="Jump to key in editor"
                        onClick={() => onJump?.(row.key)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                      >
                        <Crosshair className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="border-t px-3 py-2 text-xs text-muted-foreground">
              Showing {rows.length.toLocaleString()} of{" "}
              {entries.length.toLocaleString()} missing keys
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
  accent?: "rose";
}) {
  return (
    <div className="rounded-lg border bg-background/60 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={cn(
          "text-lg font-semibold",
          accent === "rose" && "text-rose-600 dark:text-rose-400"
        )}
      >
        {value.toLocaleString()}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-40 items-center justify-center rounded-xl border border-dashed text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
