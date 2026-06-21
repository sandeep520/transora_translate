import type { JsonValue } from "@/types";

export type DiffChangeType = "added" | "removed" | "modified" | "unchanged";

export interface DiffEntry {
  /** Dotted path/key. */
  path: string;
  type: DiffChangeType;
  /** Value in the original (undefined for added). */
  before?: JsonValue;
  /** Value in the translated (undefined for removed). */
  after?: JsonValue;
}

export interface DiffCounts {
  added: number;
  removed: number;
  modified: number;
  unchanged: number;
}

export interface DiffResult {
  added: DiffEntry[];
  removed: DiffEntry[];
  modified: DiffEntry[];
  unchanged: DiffEntry[];
  counts: DiffCounts;
}
