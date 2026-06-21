"use client";

import * as React from "react";
import { toast } from "sonner";
import type {
  JsonValidationResult,
  LangStatus,
  TranslationProgress,
} from "@/types";
import { parseJson, stringifyJson } from "@/utils/json";
import { translateJsonValues } from "@/services/engine";
import { getLanguageByCode } from "@/constants/languages";

const IDLE: TranslationProgress = {
  completed: 0,
  total: 0,
  percent: 0,
  status: "idle",
};

export function useTranslator() {
  const [input, setInput] = React.useState("");
  /** translated JSON keyed by target language code */
  const [outputs, setOutputs] = React.useState<Record<string, string>>({});
  /** per-language status keyed by target language code */
  const [statuses, setStatuses] = React.useState<Record<string, LangStatus>>(
    {}
  );
  const [source, setSource] = React.useState("auto");
  const [targets, setTargets] = React.useState<string[]>(["hi"]);
  const [progress, setProgress] = React.useState<TranslationProgress>(IDLE);
  const abortRef = React.useRef<AbortController | null>(null);

  const validation: JsonValidationResult = React.useMemo(
    () => (input.trim() ? parseJson(input) : { valid: false, error: "" }),
    [input]
  );

  const isTranslating = progress.status === "translating";

  const reset = React.useCallback(() => {
    abortRef.current?.abort();
    setInput("");
    setOutputs({});
    setStatuses({});
    setProgress(IDLE);
  }, []);

  const cancel = React.useCallback(() => {
    abortRef.current?.abort();
    setProgress((p) => ({ ...p, status: "idle", message: "Cancelled." }));
  }, []);

  const translate = React.useCallback(async () => {
    const parsed = parseJson(input);
    if (!parsed.valid || parsed.data === undefined) {
      toast.error(parsed.error || "Please provide valid JSON first.");
      return;
    }
    if (targets.length === 0) {
      toast.warning("Pick at least one target language.");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setOutputs({});
    // Show every selected language up front as queued.
    setStatuses(
      Object.fromEntries(targets.map((t) => [t, "queued" as LangStatus]))
    );
    setProgress({ completed: 0, total: 0, percent: 0, status: "translating" });

    const results: Record<string, string> = {};
    let anyPartial = false;

    try {
      for (let i = 0; i < targets.length; i++) {
        const target = targets[i];
        const name = getLanguageByCode(target)?.name ?? target;

        setStatuses((s) => ({ ...s, [target]: "translating" }));

        const result = await translateJsonValues(parsed.data, {
          source,
          target,
          signal: controller.signal,
          onProgress: (p) => {
            const overall = Math.round((i * 100 + p.percent) / targets.length);
            setProgress({
              completed: p.completed,
              total: p.total,
              percent: overall,
              status: "translating",
              message:
                targets.length > 1
                  ? `Translating ${name} (${i + 1}/${targets.length})…`
                  : undefined,
            });
          },
        });

        results[target] = stringifyJson(result.data);
        setOutputs({ ...results });
        setStatuses((s) => ({
          ...s,
          [target]: result.complete ? "done" : "partial",
        }));
        if (!result.complete) anyPartial = true;
      }

      setProgress({
        completed: 1,
        total: 1,
        percent: 100,
        status: anyPartial ? "partial" : "success",
        message: anyPartial
          ? "Some values were not translated (free quota). Re-run to resume — cached values are reused."
          : undefined,
      });

      if (anyPartial) {
        toast.warning("Partial translation — re-run to resume from cache.");
      } else {
        toast.success(
          targets.length > 1
            ? `Translated into ${targets.length} languages.`
            : "Translation complete."
        );
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      // Mark whatever hasn't finished as errored.
      setStatuses((s) =>
        Object.fromEntries(
          Object.entries(s).map(([code, st]) => [
            code,
            st === "translating" || st === "queued" ? "error" : st,
          ])
        )
      );
      setProgress((p) => ({
        ...p,
        status: "error",
        message: e instanceof Error ? e.message : "Translation failed.",
      }));
      toast.error(e instanceof Error ? e.message : "Translation failed.");
    }
  }, [input, source, targets]);

  return {
    input,
    setInput,
    outputs,
    statuses,
    source,
    setSource,
    targets,
    setTargets,
    progress,
    validation,
    isTranslating,
    translate,
    cancel,
    reset,
  };
}
