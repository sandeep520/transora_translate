/**
 * Renders the "translated image": draws the original image, paints a fill box
 * over each detected text region (the MVP stand-in for removing the original
 * text), then draws the translated text fitted into that box.
 */
import type { OcrBlock } from "@/types/lens";

export interface OverlayStyle {
  /** Box fill that hides the original text. */
  fill: string;
  /** Translated text colour. */
  textColor: string;
  /** Right-to-left target language (Arabic, Hebrew, …). */
  rtl: boolean;
}

export const DEFAULT_OVERLAY_STYLE: OverlayStyle = {
  fill: "#ffffff",
  textColor: "#111111",
  rtl: false,
};

const FONT_STACK = 'Inter, "Noto Sans", "Segoe UI", system-ui, sans-serif';
const MIN_FONT_PX = 8;

/** Largest font size (≤ box height) at which `text` fits within `boxWidth`. */
function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  boxWidth: number,
  boxHeight: number
): number {
  let size = Math.max(MIN_FONT_PX, Math.floor(boxHeight * 0.82));
  while (size > MIN_FONT_PX) {
    ctx.font = `${size}px ${FONT_STACK}`;
    if (ctx.measureText(text).width <= boxWidth * 0.98) break;
    size -= 1;
  }
  return size;
}

/**
 * Draw the translated overlay onto a fresh canvas and return it.
 * Coordinates in `blocks` must be in the source image's full-resolution space.
 */
export function renderTranslatedImage(
  source: CanvasImageSource,
  width: number,
  height: number,
  blocks: OcrBlock[],
  style: OverlayStyle = DEFAULT_OVERLAY_STYLE
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable.");

  ctx.drawImage(source, 0, 0, width, height);

  for (const block of blocks) {
    const text = (block.translated ?? block.text).trim();
    if (!text) continue;

    // Hide the original text with a padded fill box.
    const pad = 2;
    ctx.fillStyle = style.fill;
    ctx.fillRect(
      block.x - pad,
      block.y - pad,
      block.width + pad * 2,
      block.height + pad * 2
    );

    // Draw the translated text, shrunk to fit the box width.
    const size = fitFontSize(ctx, text, block.width, block.height);
    ctx.font = `${size}px ${FONT_STACK}`;
    ctx.fillStyle = style.textColor;
    ctx.textBaseline = "middle";
    ctx.direction = style.rtl ? "rtl" : "ltr";
    ctx.textAlign = style.rtl ? "right" : "left";
    const x = style.rtl ? block.x + block.width : block.x;
    ctx.fillText(text, x, block.y + block.height / 2);
  }

  return canvas;
}
