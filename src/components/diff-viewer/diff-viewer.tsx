"use client";

import * as React from "react";
import {
  Copy,
  CopyCheck,
  Download,
  GitCompare,
  Maximize2,
  Minimize2,
  Rows3,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MonacoDiff } from "./monaco-diff";
import type { DiffResult } from "@/types/diff";
import { copyToClipboard, downloadJson } from "@/utils/file";
import { cn } from "@/lib/utils";

interface DiffViewerProps {
  original: string;
  translated: string | null;
  diff: DiffResult | null;
  /** Name of the language whose output is being compared. */
  languageName?: string;
}

export function DiffViewer({
  original,
  translated,
  diff,
  languageName,
}: DiffViewerProps) {
  const [fullscreen, setFullscreen] = React.useState(false);
  const [collapse, setCollapse] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const hasDiff = Boolean(translated && diff);

  const report = React.useMemo(
    () =>
      diff
        ? {
            added: diff.added,
            removed: diff.removed,
            modified: diff.modified,
          }
        : { added: [], removed: [], modified: [] },
    [diff]
  );

  const handleExport = () => downloadJson(report, "diff-report.json");
  const handleCopy = async () => {
    const ok = await copyToClipboard(JSON.stringify(report, null, 2));
    if (ok) {
      setCopied(true);
      toast.success("Diff report copied.");
      setTimeout(() => setCopied(false), 1500);
    } else toast.error("Copy failed.");
  };

  return (
    <Card
      className={cn(
        "glass",
        fullscreen && "fixed inset-3 z-50 flex flex-col overflow-auto shadow-2xl"
      )}
    >
      <CardHeader className="gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <GitCompare className="h-4 w-4 text-primary" /> Difference Viewer
            {languageName && (
              <span className="text-xs font-normal text-muted-foreground">
                · Original → {languageName}
              </span>
            )}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapse((c) => !c)}
              disabled={!hasDiff}
            >
              <Rows3 className="h-4 w-4" />
              {collapse ? "Show all" : "Collapse unchanged"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              disabled={!hasDiff}
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
              onClick={handleExport}
              disabled={!hasDiff}
            >
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
              onClick={() => setFullscreen((f) => !f)}
              disabled={!hasDiff}
            >
              {fullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Diff statistics */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <DiffStat label="Added" value={diff?.counts.added ?? 0} tone="added" />
          <DiffStat
            label="Removed"
            value={diff?.counts.removed ?? 0}
            tone="removed"
          />
          <DiffStat
            label="Modified"
            value={diff?.counts.modified ?? 0}
            tone="modified"
          />
          <DiffStat
            label="Unchanged"
            value={diff?.counts.unchanged ?? 0}
            tone="unchanged"
          />
        </div>
      </CardHeader>

      <CardContent className={cn(fullscreen && "flex-1")}>
        {hasDiff ? (
          <MonacoDiff
            original={original}
            modified={translated as string}
            collapseUnchanged={collapse}
            height={fullscreen ? "calc(100vh - 240px)" : 520}
          />
        ) : (
          <div className="flex h-40 items-center justify-center rounded-xl border border-dashed text-center text-sm text-muted-foreground">
            Translate your JSON first to compare the original and translated
            output side by side.
          </div>
        )}
        {fullscreen && (
          <Button
            variant="secondary"
            size="sm"
            className="mt-3"
            onClick={() => setFullscreen(false)}
          >
            <X className="h-4 w-4" /> Close fullscreen
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

const TONES: Record<string, string> = {
  added: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  removed: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
  modified:
    "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  unchanged: "border-border bg-background/60 text-foreground",
};

function DiffStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: keyof typeof TONES;
}) {
  return (
    <div className={cn("rounded-lg border p-3", TONES[tone])}>
      <div className="text-xs opacity-80">{label}</div>
      <div className="text-lg font-semibold">{value.toLocaleString()}</div>
    </div>
  );
}
