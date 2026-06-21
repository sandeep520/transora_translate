/**
 * Translates OCR blocks using the app's existing free, keyless translation
 * engine (Google gtx + MyMemory fallback, with caching/retries). Blocks that
 * are URLs, emails, or purely numeric/symbolic are left untouched.
 */
import { translateText } from "./translation";
import { CONCURRENCY } from "@/constants/config";
import type { OcrBlock } from "@/types/lens";

const URL_RE = /^(https?:\/\/|www\.)\S+$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Only digits, whitespace, and common numeric punctuation/currency. */
const NUMERIC_RE = /^[\s\d.,:/%₹$€£¥+\-()#*]+$/;

/** Decide whether a piece of detected text is worth translating. */
export function shouldTranslate(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (URL_RE.test(t) || EMAIL_RE.test(t)) return false;
  if (NUMERIC_RE.test(t)) return false;
  return true;
}

interface TranslateBlocksOptions {
  signal?: AbortSignal;
  /** Reports (completed, total) as each block resolves. */
  onProgress?: (completed: number, total: number) => void;
}

/**
 * Translate every block with bounded concurrency. A block that fails to
 * translate keeps its original text (mirrors the JSON engine's partial-result
 * behaviour) rather than aborting the whole run.
 */
export async function translateBlocks(
  blocks: OcrBlock[],
  source: string,
  target: string,
  { signal, onProgress }: TranslateBlocksOptions = {}
): Promise<OcrBlock[]> {
  const results: OcrBlock[] = new Array(blocks.length);
  let next = 0;
  let completed = 0;

  async function worker() {
    while (next < blocks.length) {
      const i = next++;
      if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
      const block = blocks[i];
      let translated = block.text;
      if (shouldTranslate(block.text)) {
        try {
          translated = await translateText(block.text, source, target);
        } catch {
          translated = block.text; // keep original on failure
        }
      }
      results[i] = { ...block, translated };
      completed++;
      onProgress?.(completed, blocks.length);
    }
  }

  const workers = Array.from(
    { length: Math.min(CONCURRENCY, blocks.length || 1) },
    () => worker()
  );
  await Promise.all(workers);
  return results;
}
