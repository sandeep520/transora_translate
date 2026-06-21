"use client";

import * as React from "react";
import type { JsonValue } from "@/types";
import type { DuplicateEntry, DuplicateStats } from "@/types/duplicate";
import type { MissingReport } from "@/types/missing";
import type { DiffResult } from "@/types/diff";
import { parseJson } from "@/utils/json";
import { walkLeaves } from "@/utils/jsonPaths";
import {
  findDuplicateStrings,
  getDuplicateStats,
} from "@/utils/findDuplicateStrings";
import { findMissingTranslations } from "@/utils/findMissingTranslations";
import { compareJson } from "@/utils/compareJson";

export interface DashboardStats {
  totalKeys: number;
  totalStrings: number;
  duplicateStrings: number;
  duplicateSavings: number;
  missingTranslations: number;
  modifiedKeys: number;
  completion: number;
}

export interface JsonAnalysis {
  validInput: boolean;
  parsedInput?: JsonValue;
  duplicates: DuplicateEntry[];
  duplicateStats: DuplicateStats;
  missing: MissingReport;
  diff: DiffResult | null;
  dashboard: DashboardStats;
}

const EMPTY_DUP_STATS: DuplicateStats = {
  totalStrings: 0,
  duplicateValues: 0,
  potentialSavings: 0,
};
const EMPTY_MISSING: MissingReport = {
  entries: [],
  summary: { totalKeys: 0, translatedKeys: 0, missingKeys: 0, completion: 100 },
};

/**
 * Memoized analysis of the input JSON (and, when available, the translated
 * output) powering the Duplicates, Missing, Diff, and dashboard views.
 */
export function useJsonAnalysis(
  input: string,
  output: string | null
): JsonAnalysis {
  return React.useMemo<JsonAnalysis>(() => {
    const parsed = input.trim() ? parseJson(input) : { valid: false };
    if (!parsed.valid || parsed.data === undefined) {
      return {
        validInput: false,
        duplicates: [],
        duplicateStats: EMPTY_DUP_STATS,
        missing: EMPTY_MISSING,
        diff: null,
        dashboard: {
          totalKeys: 0,
          totalStrings: 0,
          duplicateStrings: 0,
          duplicateSavings: 0,
          missingTranslations: 0,
          modifiedKeys: 0,
          completion: 100,
        },
      };
    }

    const data = parsed.data;
    const duplicates = findDuplicateStrings(data);
    const duplicateStats = getDuplicateStats(data, duplicates);
    const missing = findMissingTranslations(data);

    let totalKeys = 0;
    walkLeaves(data, () => totalKeys++);

    const parsedOut = output ? parseJson(output) : null;
    const diff =
      parsedOut && parsedOut.valid && parsedOut.data !== undefined
        ? compareJson(data, parsedOut.data)
        : null;

    return {
      validInput: true,
      parsedInput: data,
      duplicates,
      duplicateStats,
      missing,
      diff,
      dashboard: {
        totalKeys,
        totalStrings: duplicateStats.totalStrings,
        duplicateStrings: duplicateStats.duplicateValues,
        duplicateSavings: duplicateStats.potentialSavings,
        missingTranslations: missing.summary.missingKeys,
        modifiedKeys: diff?.counts.modified ?? 0,
        completion: missing.summary.completion,
      },
    };
  }, [input, output]);
}
