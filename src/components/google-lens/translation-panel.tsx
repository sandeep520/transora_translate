"use client";

import { Languages, Loader2, RotateCcw, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LanguageSelect } from "@/components/translator/language-select";
import { AUTO_DETECT, LANGUAGES } from "@/constants/languages";
import type { LensStatus } from "@/types/lens";

interface TranslationPanelProps {
  source: string;
  target: string;
  onSource: (v: string) => void;
  onTarget: (v: string) => void;
  onTranslate: () => void;
  onReset: () => void;
  status: LensStatus;
  progress: { percent: number; message?: string };
}

const SOURCE_OPTIONS = [AUTO_DETECT, ...LANGUAGES];

export function TranslationPanel({
  source,
  target,
  onSource,
  onTarget,
  onTranslate,
  onReset,
  status,
  progress,
}: TranslationPanelProps) {
  const busy = status === "ocr" || status === "translating";
  const canTranslate = status === "ocr-done" || status === "done";

  return (
    <Card className="glass">
      <CardContent className="flex flex-col gap-4 pt-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <LanguageSelect
            label="Source language (also used for text detection)"
            value={source}
            onChange={onSource}
            options={SOURCE_OPTIONS}
            disabled={busy}
          />
          <LanguageSelect
            label="Target language"
            value={target}
            onChange={onTarget}
            options={LANGUAGES}
            disabled={busy}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={onTranslate} disabled={!canTranslate || busy}>
            {status === "translating" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Translate Image
          </Button>
          <Button variant="outline" onClick={onReset} disabled={busy}>
            <RotateCcw className="h-4 w-4" /> New image
          </Button>

          {busy && (
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Languages className="h-4 w-4" />
              {progress.message ??
                (status === "ocr" ? "Detecting text…" : "Translating…")}
            </span>
          )}
        </div>

        {busy && <Progress value={progress.percent} />}
      </CardContent>
    </Card>
  );
}
