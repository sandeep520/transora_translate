import type { JsonValue } from "@/types";
import type { MissingEntry, MissingReport } from "@/types/missing";
import { joinPath, walkLeaves } from "./jsonPaths";

/** Case-insensitive placeholder tokens that mean "not translated yet". */
const PLACEHOLDERS = new Set([
  "todo",
  "todo_translate",
  "translate_me",
  "fixme",
  "untranslated",
]);

/**
 * Detect untranslated text slots: empty strings, null values, and known
 * placeholder tokens. Numbers/booleans are not text slots and are ignored.
 * Returns the offending entries plus a completion summary.
 */
export function findMissingTranslations(root: JsonValue): MissingReport {
  const entries: MissingEntry[] = [];
  let totalKeys = 0;
  let missingKeys = 0;

  walkLeaves(root, (path, value) => {
    const isTextSlot = typeof value === "string" || value === null;
    if (!isTextSlot) return;
    totalKeys++;
    const key = joinPath(path);

    if (value === null) {
      entries.push({ key, value: null, reason: "null" });
      missingKeys++;
      return;
    }
    const trimmed = value.trim();
    if (trimmed === "") {
      entries.push({ key, value: "", reason: "empty" });
      missingKeys++;
      return;
    }
    if (PLACEHOLDERS.has(trimmed.toLowerCase())) {
      entries.push({ key, value, reason: "placeholder" });
      missingKeys++;
    }
  });

  const translatedKeys = totalKeys - missingKeys;
  const completion =
    totalKeys === 0 ? 100 : Math.round((translatedKeys / totalKeys) * 100);

  return {
    entries,
    summary: { totalKeys, translatedKeys, missingKeys, completion },
  };
}
