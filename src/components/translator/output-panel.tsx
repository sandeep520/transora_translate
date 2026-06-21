"use client";

import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  DownloadCloud,
  Languages,
  Loader2,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JsonEditor } from "@/components/editor/json-editor";
import type { LangStatus, TranslationProgress } from "@/types";
import { buildFilename, copyToClipboard, downloadJson } from "@/utils/file";
import { getLanguageByCode, isRtlLang } from "@/constants/languages";
import { cn } from "@/lib/utils";

interface OutputPanelProps {
  /** translated JSON keyed by target language code */
  outputs: Record<string, string>;
  /** per-language status keyed by target language code */
  statuses: Record<string, LangStatus>;
  progress: TranslationProgress;
  targets: string[];
}

/** A finished language can be opened in the preview; queued/translating cannot. */
function isViewable(status: LangStatus | undefined): boolean {
  return status === "done" || status === "partial";
}

export function OutputPanel({
  outputs,
  statuses,
  progress,
  targets,
}: OutputPanelProps) {
  const [copied, setCopied] = React.useState(false);
  const [active, setActive] = React.useState<string | null>(null);

  // Languages whose result can be previewed, in the order the user selected them.
  const ready = targets.filter((t) => isViewable(statuses[t]));

  // Keep the active tab valid as results arrive (never jump to a non-viewable one).
  React.useEffect(() => {
    if (ready.length === 0) {
      setActive(null);
    } else if (!active || !ready.includes(active)) {
      setActive(ready[0]);
    }
  }, [ready, active]);

  const activeCode = active ?? ready[0] ?? null;
  const value = activeCode ? outputs[activeCode] : "";
  const hasOutput = Boolean(value && value.trim().length > 0);
  const rtl = activeCode ? isRtlLang(activeCode) : false;

  const handleCopy = async () => {
    if (!value) return;
    const ok = await copyToClipboard(value);
    if (ok) {
      setCopied(true);
      toast.success("Copied to clipboard.");
      setTimeout(() => setCopied(false), 1500);
    } else {
      toast.error("Copy failed.");
    }
  };

  const handleDownload = () => {
    if (!activeCode || !value) return;
    const lang = getLanguageByCode(activeCode);
    downloadJson(value, buildFilename(lang?.short ?? activeCode));
    toast.success("Downloaded.");
  };

  const handleDownloadAll = () => {
    ready.forEach((code) => {
      const lang = getLanguageByCode(code);
      downloadJson(outputs[code], buildFilename(lang?.short ?? code));
    });
    toast.success(`Downloaded ${ready.length} files.`);
  };

  return (
    <Card className="glass flex flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Languages className="h-4 w-4 text-primary" /> Translated JSON
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={!hasOutput}
            onClick={handleCopy}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasOutput}
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" /> Download
          </Button>
          {ready.length > 1 && (
            <Button variant="outline" size="sm" onClick={handleDownloadAll}>
              <DownloadCloud className="h-4 w-4" /> All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="flex min-h-[40px] flex-wrap items-center gap-2">
          {progress.status === "success" && (
            <Badge variant="success">Success</Badge>
          )}
          {progress.status === "partial" && (
            <Badge variant="warning">Partial result</Badge>
          )}
          {progress.status === "error" && (
            <Badge variant="destructive">{progress.message}</Badge>
          )}
          {progress.status === "translating" && (
            <Badge variant="secondary">
              {progress.message ??
                `Translating… ${progress.completed}/${progress.total}`}
            </Badge>
          )}
          {progress.status === "idle" && ready.length === 0 && (
            <Badge variant="secondary">Awaiting translation</Badge>
          )}
          {rtl && hasOutput && (
            <Badge variant="secondary">RTL · {getLanguageByCode(activeCode!)?.name}</Badge>
          )}
        </div>

        {/* Per-language tabs (only when more than one target). Shows every
            selected language with its status; finished ones are clickable. */}
        {targets.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            {targets.map((code) => {
              const status = statuses[code];
              const viewable = isViewable(status);
              const name = getLanguageByCode(code)?.name ?? code;
              return (
                <button
                  key={code}
                  type="button"
                  disabled={!viewable}
                  onClick={() => viewable && setActive(code)}
                  title={
                    status === "translating"
                      ? `Translating ${name}…`
                      : status === "queued"
                      ? `${name} queued`
                      : status === "error"
                      ? `${name} failed`
                      : name
                  }
                  className={cn(
                    "flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                    code === activeCode
                      ? "bg-primary text-primary-foreground"
                      : viewable
                      ? "bg-secondary text-secondary-foreground hover:bg-secondary/70"
                      : "cursor-default bg-secondary/40 text-muted-foreground"
                  )}
                >
                  {status === "translating" && (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  )}
                  {status === "done" && <Check className="h-3 w-3" />}
                  {status === "partial" && (
                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                  )}
                  {status === "error" && (
                    <AlertTriangle className="h-3 w-3 text-destructive" />
                  )}
                  {name}
                </button>
              );
            })}
          </div>
        )}

        <JsonEditor
          value={
            hasOutput
              ? value
              : activeCode
              ? "// Translating…"
              : "// Translated JSON will appear here"
          }
          readOnly
        />
      </CardContent>
    </Card>
  );
}
