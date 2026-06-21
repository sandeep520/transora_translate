export type MissingReason = "empty" | "null" | "placeholder";

/** A text slot that is empty, null, or a placeholder (untranslated). */
export interface MissingEntry {
  /** Dotted path/key. */
  key: string;
  /** The offending value (null for null entries). */
  value: string | null;
  reason: MissingReason;
}

export interface MissingSummary {
  /** All translatable text slots (string + null leaves). */
  totalKeys: number;
  translatedKeys: number;
  missingKeys: number;
  /** Completion percentage, 0–100. */
  completion: number;
}

export interface MissingReport {
  entries: MissingEntry[];
  summary: MissingSummary;
}
