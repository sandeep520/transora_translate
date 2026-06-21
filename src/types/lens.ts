/** Types for the Google Lens image-translation module. */

/** A single detected line of text on the image, in full-resolution pixels. */
export interface OcrBlock {
  /** Stable id for React keys and edits. */
  id: string;
  /** Current (possibly user-edited) source text. */
  text: string;
  /** Original OCR text, kept so edits can be compared/reset. */
  original: string;
  /** OCR confidence, 0–100. */
  confidence: number;
  /** Bounding box in full-resolution image pixels. */
  x: number;
  y: number;
  width: number;
  height: number;
  /** Translated text, filled in after translation. */
  translated?: string;
}

/** Metadata about the uploaded image. */
export interface ImageMeta {
  name: string;
  width: number;
  height: number;
  sizeBytes: number;
}

/** Where the module is in its load → OCR → translate → render lifecycle. */
export type LensStatus =
  | "idle"
  | "loading-image"
  | "ocr"
  | "ocr-done"
  | "translating"
  | "done"
  | "error";

/** Image formats the translated result can be exported as. */
export type ExportFormat = "png" | "jpg" | "webp";
