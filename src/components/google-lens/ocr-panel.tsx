"use client";

import * as React from "react";
import { Check, Copy, ScanText, Search } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { OcrBlock } from "@/types/lens";
import { copyToClipboard } from "@/utils/file";

interface OcrPanelProps {
  blocks: OcrBlock[];
  onEdit: (id: string, text: string) => void;
  /** True while OCR is still running. */
  busy?: boolean;
}

/** Confidence → badge variant, so low-confidence detections stand out. */
function confidenceVariant(c: number): "success" | "warning" | "destructive" {
  if (c >= 85) return "success";
  if (c >= 60) return "warning";
  return "destructive";
}

export function OcrPanel({ blocks, onEdit, busy }: OcrPanelProps) {
  const [query, setQuery] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return blocks;
    return blocks.filter((b) => b.text.toLowerCase().includes(q));
  }, [blocks, query]);

  const handleCopyAll = async () => {
    const ok = await copyToClipboard(blocks.map((b) => b.text).join("\n"));
    if (ok) {
      setCopied(true);
      toast.success("Copied detected text.");
      setTimeout(() => setCopied(false), 1500);
    } else {
      toast.error("Copy failed.");
    }
  };

  return (
    <Card className="glass flex flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <ScanText className="h-4 w-4 text-primary" /> Detected Text
          {blocks.length > 0 && (
            <Badge variant="secondary">{blocks.length}</Badge>
          )}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          disabled={blocks.length === 0}
          onClick={handleCopyAll}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          Copy all
        </Button>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search detected text…"
            className="h-9 w-full rounded-md border bg-background pl-8 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="flex max-h-[420px] flex-col gap-2 overflow-y-auto pr-1">
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {busy
                ? "Detecting text…"
                : blocks.length === 0
                ? "No text detected yet."
                : "No blocks match your search."}
            </p>
          )}
          {filtered.map((b) => (
            <div
              key={b.id}
              className="flex flex-col gap-1.5 rounded-lg border bg-background/60 p-2.5"
            >
              <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                <span>{b.text.length} chars</span>
                <Badge variant={confidenceVariant(b.confidence)}>
                  {b.confidence}%
                </Badge>
              </div>
              <textarea
                value={b.text}
                onChange={(e) => onEdit(b.id, e.target.value)}
                rows={Math.min(3, Math.max(1, Math.ceil(b.text.length / 42)))}
                className="w-full resize-y rounded-md border bg-background px-2 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
