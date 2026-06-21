/**
 * OCR via Tesseract.js. Tesseract spins up its own Web Worker + WASM, so this
 * never blocks the main thread. The library is imported dynamically so it stays
 * out of the server bundle and the initial client bundle.
 */

/** A detected line before it becomes an OcrBlock (no id/translation yet). */
export interface OcrLine {
  text: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OcrProgress {
  status: string;
  /** 0–1 within the current status phase. */
  progress: number;
}

/**
 * Map our translation language codes to Tesseract traineddata language codes.
 * Only the scripts the module advertises are mapped; anything else falls back
 * to English so OCR still runs.
 */
const OCR_LANG_MAP: Record<string, string> = {
  en: "eng",
  hi: "hin",
  gu: "guj",
  ar: "ara",
  fr: "fra",
  de: "deu",
  es: "spa",
  ja: "jpn",
  zh: "chi_sim",
  "zh-CN": "chi_sim",
  ko: "kor",
  ru: "rus",
};

export function toTesseractLang(code: string): string {
  return OCR_LANG_MAP[code] ?? "eng";
}

/** Flatten Tesseract's block → paragraph → line tree into flat lines. */
interface TessBbox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}
interface TessLine {
  text: string;
  confidence: number;
  bbox: TessBbox;
}
interface TessParagraph {
  lines?: TessLine[];
}
interface TessBlock {
  paragraphs?: TessParagraph[];
}
interface TessPage {
  lines?: TessLine[];
  blocks?: TessBlock[] | null;
}

function extractLines(page: TessPage): OcrLine[] {
  const raw: TessLine[] = [];
  if (page.lines && page.lines.length) {
    raw.push(...page.lines);
  } else if (page.blocks) {
    for (const block of page.blocks) {
      for (const para of block.paragraphs ?? []) {
        for (const line of para.lines ?? []) raw.push(line);
      }
    }
  }
  return raw
    .filter((l) => l.text && l.text.trim().length > 0)
    .map((l) => ({
      text: l.text.replace(/\s*\n\s*/g, " ").trim(),
      confidence: Math.round(l.confidence ?? 0),
      x: l.bbox.x0,
      y: l.bbox.y0,
      width: l.bbox.x1 - l.bbox.x0,
      height: l.bbox.y1 - l.bbox.y0,
    }));
}

/**
 * Recognize text in an image source (typically a canvas). Returns line-level
 * blocks with bounding boxes in the coordinate space of the given image.
 */
export async function recognizeImage(
  image: HTMLCanvasElement | HTMLImageElement,
  langCode: string,
  onProgress?: (p: OcrProgress) => void
): Promise<OcrLine[]> {
  const { createWorker } = await import("tesseract.js");
  const lang = toTesseractLang(langCode);
  const worker = await createWorker(lang, 1, {
    logger: (m) => onProgress?.({ status: m.status, progress: m.progress }),
  });
  try {
    const { data } = await worker.recognize(image, {}, { blocks: true });
    return extractLines(data as unknown as TessPage);
  } finally {
    await worker.terminate();
  }
}
