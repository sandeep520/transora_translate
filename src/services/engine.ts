import type {
  JsonValue,
  TranslationProgress,
  TranslationResult,
} from "@/types";
import { CONCURRENCY } from "@/constants/config";
import {
  cloneJson,
  collectTranslatableEntries,
  setAtPath,
} from "@/utils/json";
import { translateText } from "./translation";

export interface TranslateJsonOptions {
  source: string;
  target: string;
  onProgress?: (p: TranslationProgress) => void;
  /** Abort signal to cancel an in-flight translation. */
  signal?: AbortSignal;
}

/**
 * Translate every translatable string value in a JSON document.
 *
 * - Keys, URLs, emails, numbers, booleans, null, dates, ids → untouched.
 * - Identical strings are translated once (dedup) and reused everywhere.
 * - Work runs with bounded concurrency; failures (e.g. quota) are counted and
 *   reported instead of aborting the whole document, so partial results are
 *   never silently dropped.
 */
export async function translateJsonValues(
  data: JsonValue,
  { source, target, onProgress, signal }: TranslateJsonOptions
): Promise<TranslationResult> {
  const result = cloneJson(data);
  const entries = collectTranslatableEntries(result);

  // Unique source strings → list of paths that hold them.
  const uniqueToPaths = new Map<string, (string | number)[][]>();
  for (const entry of entries) {
    const list = uniqueToPaths.get(entry.value);
    if (list) list.push(entry.path);
    else uniqueToPaths.set(entry.value, [entry.path]);
  }

  const uniqueValues = [...uniqueToPaths.keys()];
  const total = uniqueValues.length;
  let completed = 0;
  let failedCount = 0;
  const translations = new Map<string, string>();

  const emit = (status: TranslationProgress["status"], message?: string) => {
    onProgress?.({
      completed,
      total,
      percent: total === 0 ? 100 : Math.round((completed / total) * 100),
      status,
      message,
    });
  };

  if (source === target) {
    emit("success", "Source and target languages are the same.");
    return {
      data: result,
      complete: true,
      translatedCount: 0,
      skippedCount: entries.length,
      failedCount: 0,
    };
  }

  emit("translating");

  // Bounded-concurrency worker pool over the unique values.
  let cursor = 0;
  async function worker() {
    while (cursor < uniqueValues.length) {
      if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
      const value = uniqueValues[cursor++];
      try {
        const translated = await translateText(value, source, target);
        translations.set(value, translated);
      } catch {
        // Keep the original value on failure; count it.
        translations.set(value, value);
        failedCount++;
      } finally {
        completed++;
        emit("translating");
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(CONCURRENCY, Math.max(1, uniqueValues.length)) },
    () => worker()
  );
  await Promise.all(workers);

  // Apply translations back into every path.
  for (const [value, paths] of uniqueToPaths) {
    const translated = translations.get(value) ?? value;
    for (const path of paths) setAtPath(result, path, translated);
  }

  const complete = failedCount === 0;
  emit(
    complete ? "success" : "partial",
    complete
      ? undefined
      : `${failedCount} value(s) could not be translated (free quota or network). Already-translated values are kept — you can resume later.`
  );

  return {
    data: result,
    complete,
    translatedCount: total - failedCount,
    skippedCount: 0,
    failedCount,
  };
}
