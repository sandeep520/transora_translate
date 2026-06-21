/** Client-side image helpers for the Google Lens module. */
import type { ExportFormat } from "@/types/lens";

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/bmp",
  "image/gif",
];

export const MAX_IMAGE_BYTES = 20 * 1024 * 1024; // 20 MB

/** Longest edge (px) used for OCR; large images are downscaled for speed. */
export const OCR_MAX_SIDE = 2000;

export interface LoadedImage {
  bitmap: ImageBitmap;
  width: number;
  height: number;
}

/** True for a file we accept (handles browsers that omit the MIME type). */
export function isAllowedImage(file: File): boolean {
  if (ALLOWED_IMAGE_TYPES.includes(file.type)) return true;
  return /\.(jpe?g|png|webp|bmp|gif)$/i.test(file.name);
}

/** Decode a File into an ImageBitmap (GIFs decode to their first frame). */
export async function loadImageBitmap(file: File): Promise<LoadedImage> {
  const bitmap = await createImageBitmap(file);
  return { bitmap, width: bitmap.width, height: bitmap.height };
}

export interface ScaledCanvas {
  canvas: HTMLCanvasElement;
  /** Factor applied to the source (≤ 1). Divide OCR coords by this. */
  scale: number;
}

/** Draw a source image into a canvas, downscaled so its longest edge ≤ maxSide. */
export function drawScaledCanvas(
  source: CanvasImageSource,
  srcWidth: number,
  srcHeight: number,
  maxSide: number
): ScaledCanvas {
  const scale = Math.min(1, maxSide / Math.max(srcWidth, srcHeight));
  const width = Math.max(1, Math.round(srcWidth * scale));
  const height = Math.max(1, Math.round(srcHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable.");
  ctx.drawImage(source, 0, 0, width, height);
  return { canvas, scale };
}

const MIME_BY_FORMAT: Record<ExportFormat, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
};

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: ExportFormat,
  quality = 0.92
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Image export failed."))),
      MIME_BY_FORMAT[format],
      quality
    );
  });
}

/** Trigger a browser download of a Blob. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
