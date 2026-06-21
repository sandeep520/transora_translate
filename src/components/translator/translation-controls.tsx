"use client";

import { ArrowRightLeft, Loader2, Sparkles, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LanguageSelect } from "./language-select";
import { LanguageMultiSelect } from "./language-multi-select";
import { SOURCE_LANGUAGES, TARGET_LANGUAGES } from "@/constants/languages";
import type { TranslationProgress } from "@/types";

interface TranslationControlsProps {
  source: string;
  targets: string[];
  onSource: (v: string) => void;
  onTargets: (v: string[]) => void;
  onSwap: () => void;
  onTranslate: () => void;
  onCancel: () => void;
  canTranslate: boolean;
  isTranslating: boolean;
  progress: TranslationProgress;
}

export function TranslationControls({
  source,
  targets,
  onSource,
  onTargets,
  onSwap,
  onTranslate,
  onCancel,
  canTranslate,
  isTranslating,
  progress,
}: TranslationControlsProps) {
  return (
    <Card className="glass">
      <CardContent className="flex flex-col gap-4 p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_1fr_auto] md:items-start">
          <LanguageSelect
            label="Source language"
            value={source}
            onChange={onSource}
            options={SOURCE_LANGUAGES}
            disabled={isTranslating}
          />

          {/* Swap button: spacer label keeps it aligned with the inputs row */}
          <div className="flex flex-col gap-1.5">
            <span className="hidden select-none text-xs md:block">&nbsp;</span>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0 justify-self-center"
              aria-label="Swap languages"
              disabled={isTranslating}
              onClick={onSwap}
            >
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
          </div>

          <LanguageMultiSelect
            label="Target language(s)"
            values={targets}
            onChange={onTargets}
            options={TARGET_LANGUAGES}
            disabled={isTranslating}
          />

          {/* Translate / Cancel: spacer label keeps the button aligned too */}
          <div className="flex flex-col gap-1.5 md:w-52">
            <span className="hidden select-none text-xs md:block">&nbsp;</span>
            {isTranslating ? (
              <Button
                variant="destructive"
                className="h-10 w-full"
                onClick={onCancel}
              >
                <X className="h-4 w-4" /> Cancel
              </Button>
            ) : (
              <Button
                variant="gradient"
                className="h-10 w-full"
                disabled={!canTranslate}
                onClick={onTranslate}
              >
                <Sparkles className="h-4 w-4" /> Translate
              </Button>
            )}
          </div>
        </div>

        {(isTranslating || progress.status === "partial") && (
          <div className="flex flex-col gap-1.5">
            <Progress value={progress.percent} />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                {isTranslating && <Loader2 className="h-3 w-3 animate-spin" />}
                {isTranslating
                  ? progress.message ??
                    `Translating ${progress.completed} of ${progress.total} values…`
                  : "Partial result"}
              </span>
              <span>{progress.percent}%</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
