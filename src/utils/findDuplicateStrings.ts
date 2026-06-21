import type { JsonValue } from "@/types";
import type { DuplicateEntry, DuplicateStats } from "@/types/duplicate";
import { joinPath, walkLeaves } from "./jsonPaths";

/**
 * Detect string values that appear under more than one key/path.
 * Returns groups sorted by count (descending). Empty/whitespace strings are
 * ignored.
 */
export function findDuplicateStrings(root: JsonValue): DuplicateEntry[] {
  const map = new Map<string, string[]>();
  walkLeaves(root, (path, value) => {
    if (typeof value !== "string") return;
    if (value.trim() === "") return;
    const keys = map.get(value);
    if (keys) keys.push(joinPath(path));
    else map.set(value, [joinPath(path)]);
  });

  return [...map.entries()]
    .filter(([, keys]) => keys.length > 1)
    .map(([value, keys]) => ({ value, count: keys.length, keys }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

/** Aggregate statistics for the duplicate-detection card. */
export function getDuplicateStats(
  root: JsonValue,
  duplicates: DuplicateEntry[]
): DuplicateStats {
  let totalStrings = 0;
  walkLeaves(root, (_p, value) => {
    if (typeof value === "string" && value.trim() !== "") totalStrings++;
  });
  const potentialSavings = duplicates.reduce((sum, d) => sum + (d.count - 1), 0);
  return {
    totalStrings,
    duplicateValues: duplicates.length,
    potentialSavings,
  };
}
