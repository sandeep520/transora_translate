/** A JSON value of any shape. */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface JsonValidationResult {
  valid: boolean;
  error?: string;
  /** Parsed value when valid. */
  data?: JsonValue;
}

/** A translatable string located in the JSON tree, addressed by its path. */
export interface TranslatableEntry {
  /** Path segments from the root to this value (keys and array indices). */
  path: (string | number)[];
  /** The original string value. */
  value: string;
}

export interface TranslationProgress {
  /** Strings already resolved (translated, cached, or skipped). */
  completed: number;
  /** Total unique strings to translate. */
  total: number;
  /** 0–100. */
  percent: number;
  status: "idle" | "translating" | "success" | "partial" | "error";
  message?: string;
}

/**
 * Per-language status while translating into multiple target languages.
 * - `queued`: selected but not started yet
 * - `translating`: currently being translated
 * - `done`: finished, every string translated
 * - `partial`: finished, but some strings were not translated (e.g. quota)
 * - `error`: translation failed for this language
 */
export type LangStatus =
  | "queued"
  | "translating"
  | "done"
  | "partial"
  | "error";

/** Result of translating a full JSON document. */
export interface TranslationResult {
  data: JsonValue;
  /** True when every string was translated. */
  complete: boolean;
  translatedCount: number;
  skippedCount: number;
  /** Strings that could not be translated (e.g. rate limited). */
  failedCount: number;
}

/** Contract every translation provider must satisfy. */
export interface TranslationProvider {
  readonly id: string;
  readonly name: string;
  /** Whether this provider accepts "auto" as a source language. */
  readonly supportsAutoDetect: boolean;
  /**
   * Translate a single string. Implementations should throw on a recoverable
   * error (so the pipeline can retry or fall back) and on quota errors throw a
   * QuotaError.
   */
  translateText(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<string>;
}
