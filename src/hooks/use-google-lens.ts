"use client";

import * as React from "react";
import { toast } from "sonner";
import type { ExportFormat, ImageMeta, LensStatus, OcrBlock } from "@/types/lens";
import { isRtlLang } from "@/constants/languages";
import { recognizeImage } from "@/services/ocr-service";
import { translateBlocks } from "@/services/lens-translation";
import {
  MAX_IMAGE_BYTES,
  OCR_MAX_SIDE,
  canvasToBlob,
  downloadBlob,
  drawScaledCanvas,
  isAllowedImage,
  loadImageBitmap,
} from "@/utils/image";
import {
  DEFAULT_OVERLAY_STYLE,
  renderTranslatedImage,
} from "@/utils/overlay-renderer";
import { formatBytes } from "@/lib/utils";

interface Progress {
  /** 0–100. */
  percent: number;
  message?: string;
}

/**
 * Owns the full Google Lens lifecycle: load image → OCR → edit → translate →
 * render → download. Keeps the source bitmap and rendered canvas in refs (they
 * are not React state) and exposes plain data + actions to the UI.
 */
export function useGoogleLens() {
  const [meta, setMeta] = React.useState<ImageMeta | null>(null);
  const [originalUrl, setOriginalUrl] = React.useState<string | null>(null);
  const [resultUrl, setResultUrl] = React.useState<string | null>(null);
  const [blocks, setBlocks] = React.useState<OcrBlock[]>([]);
  const [source, setSource] = React.useState("auto");
  const [target, setTarget] = React.useState("en");
  const [status, setStatus] = React.useState<LensStatus>("idle");
  const [progress, setProgress] = React.useState<Progress>({ percent: 0 });

  const bitmapRef = React.useRef<ImageBitmap | null>(null);
  const resultCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const abortRef = React.useRef<AbortController | null>(null);

  const reset = React.useCallback(() => {
    abortRef.current?.abort();
    bitmapRef.current?.close?.();
    bitmapRef.current = null;
    resultCanvasRef.current = null;
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    setMeta(null);
    setOriginalUrl(null);
    setResultUrl(null);
    setBlocks([]);
    setStatus("idle");
    setProgress({ percent: 0 });
  }, [originalUrl]);

  /** Run OCR on the currently loaded bitmap. */
  const runOcr = React.useCallback(
    async (langCode: string) => {
      const bitmap = bitmapRef.current;
      if (!bitmap) return;
      setStatus("ocr");
      setProgress({ percent: 0, message: "Detecting text…" });
      try {
        const { canvas, scale } = drawScaledCanvas(
          bitmap,
          bitmap.width,
          bitmap.height,
          OCR_MAX_SIDE
        );
        const lines = await recognizeImage(canvas, langCode, (p) => {
          if (p.status === "recognizing text") {
            setProgress({
              percent: Math.round(p.progress * 100),
              message: "Detecting text…",
            });
          }
        });
        // Map coordinates from the (possibly downscaled) OCR canvas back to
        // full-resolution image pixels.
        const mapped: OcrBlock[] = lines.map((l, i) => ({
          id: `block-${i}`,
          text: l.text,
          original: l.text,
          confidence: l.confidence,
          x: l.x / scale,
          y: l.y / scale,
          width: l.width / scale,
          height: l.height / scale,
        }));
        setBlocks(mapped);
        setStatus("ocr-done");
        setProgress({ percent: 100 });
        if (mapped.length === 0) {
          toast.info("No text detected. Try a clearer image or another language.");
        } else {
          toast.success(`Detected ${mapped.length} text blocks.`);
        }
      } catch (e) {
        setStatus("error");
        setProgress({ percent: 0 });
        toast.error(e instanceof Error ? e.message : "Text detection failed.");
      }
    },
    []
  );

  /** Validate + decode an uploaded image, then auto-run OCR. */
  const loadImage = React.useCallback(
    async (file: File) => {
      if (!isAllowedImage(file)) {
        toast.error("Unsupported format. Use JPG, PNG, WEBP, BMP, or GIF.");
        return;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        toast.error(`Image is too large (${formatBytes(file.size)}). Max 20 MB.`);
        return;
      }
      reset();
      setStatus("loading-image");
      try {
        const { bitmap, width, height } = await loadImageBitmap(file);
        bitmapRef.current = bitmap;
        setMeta({ name: file.name, width, height, sizeBytes: file.size });
        setOriginalUrl(URL.createObjectURL(file));
        await runOcr(source);
      } catch {
        setStatus("error");
        toast.error("Could not read that image.");
      }
    },
    [reset, runOcr, source]
  );

  const updateBlock = React.useCallback((id: string, text: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, text } : b))
    );
  }, []);

  /** Translate all blocks, then render the translated image. */
  const translate = React.useCallback(async () => {
    const bitmap = bitmapRef.current;
    if (!bitmap || !meta) {
      toast.warning("Upload an image first.");
      return;
    }
    if (blocks.length === 0) {
      toast.warning("No detected text to translate.");
      return;
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setStatus("translating");
    setProgress({ percent: 0, message: "Translating…" });

    try {
      const translated = await translateBlocks(blocks, source, target, {
        signal: controller.signal,
        onProgress: (done, total) =>
          setProgress({
            percent: Math.round((done / total) * 100),
            message: `Translating… ${done}/${total}`,
          }),
      });
      setBlocks(translated);

      const canvas = renderTranslatedImage(bitmap, meta.width, meta.height, translated, {
        ...DEFAULT_OVERLAY_STYLE,
        rtl: isRtlLang(target),
      });
      resultCanvasRef.current = canvas;
      setResultUrl(canvas.toDataURL("image/png"));
      setStatus("done");
      setProgress({ percent: 100 });
      toast.success("Image translated.");
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setStatus("error");
      toast.error(e instanceof Error ? e.message : "Translation failed.");
    }
  }, [blocks, meta, source, target]);

  const download = React.useCallback(
    async (format: ExportFormat) => {
      const canvas = resultCanvasRef.current;
      if (!canvas) return;
      const base = (meta?.name ?? "image").replace(/\.[^.]+$/, "");
      const blob = await canvasToBlob(canvas, format);
      downloadBlob(blob, `${base}-${target}.${format}`);
      toast.success("Downloaded.");
    },
    [meta, target]
  );

  const ocrText = React.useMemo(
    () => blocks.map((b) => b.text).join("\n"),
    [blocks]
  );
  const translatedText = React.useMemo(
    () => blocks.map((b) => b.translated ?? "").join("\n").trim(),
    [blocks]
  );

  return {
    meta,
    originalUrl,
    resultUrl,
    blocks,
    source,
    setSource,
    target,
    setTarget,
    status,
    progress,
    ocrText,
    translatedText,
    loadImage,
    runOcr,
    updateBlock,
    translate,
    download,
    reset,
  };
}
