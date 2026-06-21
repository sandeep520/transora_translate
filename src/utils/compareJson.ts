import type { JsonValue } from "@/types";
import type { DiffEntry, DiffResult } from "@/types/diff";
import { flattenLeaves } from "./jsonPaths";

function equal(a: JsonValue | undefined, b: JsonValue | undefined): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Compare two JSON documents at the leaf level and classify every path as
 * added, removed, modified, or unchanged.
 */
export function compareJson(
  original: JsonValue,
  translated: JsonValue
): DiffResult {
  const left = flattenLeaves(original);
  const right = flattenLeaves(translated);

  const added: DiffEntry[] = [];
  const removed: DiffEntry[] = [];
  const modified: DiffEntry[] = [];
  const unchanged: DiffEntry[] = [];

  // Union of all paths, preserving original order then appending new ones.
  const paths = new Set<string>([...left.keys(), ...right.keys()]);

  for (const path of paths) {
    const inLeft = left.has(path);
    const inRight = right.has(path);
    const before = left.get(path);
    const after = right.get(path);

    if (inLeft && !inRight) {
      removed.push({ path, type: "removed", before });
    } else if (!inLeft && inRight) {
      added.push({ path, type: "added", after });
    } else if (equal(before, after)) {
      unchanged.push({ path, type: "unchanged", before, after });
    } else {
      modified.push({ path, type: "modified", before, after });
    }
  }

  return {
    added,
    removed,
    modified,
    unchanged,
    counts: {
      added: added.length,
      removed: removed.length,
      modified: modified.length,
      unchanged: unchanged.length,
    },
  };
}
