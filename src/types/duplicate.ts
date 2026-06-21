/** A string value that appears under more than one key/path. */
export interface DuplicateEntry {
  /** The repeated string value. */
  value: string;
  /** How many times it occurs. */
  count: number;
  /** Dotted paths/keys where it occurs. */
  keys: string[];
}

export interface DuplicateStats {
  totalStrings: number;
  /** Number of distinct values that are duplicated. */
  duplicateValues: number;
  /** Requests saved by translating each unique string once: Σ(count − 1). */
  potentialSavings: number;
}
