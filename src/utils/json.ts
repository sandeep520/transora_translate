import type {
  JsonValidationResult,
  JsonValue,
  TranslatableEntry,
} from "@/types";

/** Parse a JSON string, returning a structured result instead of throwing. */
export function parseJson(input: string): JsonValidationResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { valid: false, error: "Input is empty." };
  }
  try {
    const data = JSON.parse(trimmed) as JsonValue;
    return { valid: true, data };
  } catch (e) {
    return {
      valid: false,
      error: e instanceof Error ? e.message : "Invalid JSON.",
    };
  }
}

/** Convenience boolean check. */
export function validateJson(input: string): JsonValidationResult {
  return parseJson(input);
}

/** Pretty-print a JSON string (2-space indent). Returns input on failure. */
export function formatJson(input: string, indent = 2): string {
  const result = parseJson(input);
  if (!result.valid || result.data === undefined) return input;
  return JSON.stringify(result.data, null, indent);
}

export function stringifyJson(data: JsonValue, indent = 2): string {
  return JSON.stringify(data, null, indent);
}

const URL_RE = /^(https?:\/\/|www\.|\/|mailto:|tel:)/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NUMERIC_RE = /^[+-]?\d+(\.\d+)?$/;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2})?/;
const HEX_COLOR_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
/** Keys whose string values are treated as identifiers, not prose. */
const ID_KEYS = new Set([
  "id",
  "_id",
  "uuid",
  "key",
  "slug",
  "url",
  "href",
  "src",
  "link",
  "email",
  "icon",
  "type",
  "code",
  "locale",
  "lang",
]);

/**
 * Decide whether a string value should be translated. We skip identifiers,
 * URLs, emails, numbers, dates, colors, and very short tokens with no letters.
 */
export function shouldTranslate(value: string, key?: string | number): boolean {
  const v = value.trim();
  if (!v) return false;
  if (key !== undefined && typeof key === "string" && ID_KEYS.has(key.toLowerCase())) {
    return false;
  }
  if (URL_RE.test(v)) return false;
  if (EMAIL_RE.test(v)) return false;
  if (NUMERIC_RE.test(v)) return false;
  if (UUID_RE.test(v)) return false;
  if (DATE_RE.test(v)) return false;
  if (HEX_COLOR_RE.test(v)) return false;
  // Must contain at least one letter to be worth translating.
  if (!/\p{L}/u.test(v)) return false;
  return true;
}

/**
 * Walk a JSON tree and collect every translatable leaf string with its path.
 * Iterative (stack-based) to handle deeply nested / very large documents
 * without blowing the call stack.
 */
export function collectTranslatableEntries(root: JsonValue): TranslatableEntry[] {
  const entries: TranslatableEntry[] = [];
  const stack: { node: JsonValue; path: (string | number)[]; key?: string | number }[] = [
    { node: root, path: [] },
  ];

  while (stack.length) {
    const { node, path, key } = stack.pop()!;
    if (typeof node === "string") {
      if (shouldTranslate(node, key)) {
        entries.push({ path, value: node });
      }
    } else if (Array.isArray(node)) {
      for (let i = node.length - 1; i >= 0; i--) {
        stack.push({ node: node[i], path: [...path, i], key: i });
      }
    } else if (node && typeof node === "object") {
      for (const k of Object.keys(node)) {
        stack.push({ node: node[k], path: [...path, k], key: k });
      }
    }
  }
  return entries;
}

/** Set a value at the given path inside a (mutable) JSON tree. */
export function setAtPath(
  root: JsonValue,
  path: (string | number)[],
  value: JsonValue
): void {
  if (path.length === 0) return;
  let cur: any = root;
  for (let i = 0; i < path.length - 1; i++) {
    cur = cur[path[i]];
  }
  cur[path[path.length - 1]] = value;
}

/** Deep clone via structuredClone with a JSON fallback. */
export function cloneJson(data: JsonValue): JsonValue {
  if (typeof structuredClone === "function") return structuredClone(data);
  return JSON.parse(JSON.stringify(data));
}
