import type { TranslationProvider } from "@/types";
import {
  MAX_CHARS_PER_REQUEST,
  MAX_RETRIES,
  RETRY_BASE_DELAY_MS,
} from "@/constants/config";
import { sleep } from "@/lib/utils";
import { getCached, setCached } from "./cache";
import { createMyMemoryProvider } from "./providers/mymemory";
import { createGoogleProvider } from "./providers/google";
import { ProviderError, QuotaError } from "./errors";

/**
 * Build the ordered provider chain from environment variables. The first
 * provider is primary; the rest are free fallbacks tried when the primary is
 * rate limited. No API keys are used — everything here is free and client-side.
 *
 * Both providers are free, key-less, and CORS-enabled:
 *  - google:   higher capacity, auto-detect, longer strings (default primary)
 *  - mymemory: solid fallback; a free email param lifts its daily limit
 */
export function buildProviderChain(): TranslationProvider[] {
  const active = (process.env.NEXT_PUBLIC_TRANSLATION_API || "google").toLowerCase();
  const email = process.env.NEXT_PUBLIC_MYMEMORY_EMAIL || undefined;

  const google = createGoogleProvider();
  const mymemory = createMyMemoryProvider(email);

  // Active provider first, the other as a free fallback.
  return active === "mymemory" ? [mymemory, google] : [google, mymemory];
}

let cachedChain: TranslationProvider[] | null = null;
function getChain(): TranslationProvider[] {
  if (!cachedChain) cachedChain = buildProviderChain();
  return cachedChain;
}

/** Split long text on sentence/word boundaries to fit provider char limits. */
export function splitIntoChunks(
  text: string,
  max = MAX_CHARS_PER_REQUEST
): string[] {
  if (text.length <= max) return [text];
  const chunks: string[] = [];
  const sentences = text.split(/(?<=[.!?。！？\n])\s+/);
  let current = "";
  for (const piece of sentences) {
    if (piece.length > max) {
      // Hard-split overly long sentence by words.
      if (current) {
        chunks.push(current);
        current = "";
      }
      const words = piece.split(/\s+/);
      for (const w of words) {
        if ((current + " " + w).trim().length > max) {
          if (current) chunks.push(current);
          current = w;
        } else {
          current = (current ? current + " " : "") + w;
        }
      }
    } else if ((current + " " + piece).trim().length > max) {
      if (current) chunks.push(current);
      current = piece;
    } else {
      current = (current ? current + " " : "") + piece;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

/** Choose the provider order valid for this request (handles auto-detect). */
function providersForRequest(source: string): {
  provider: TranslationProvider;
  source: string;
}[] {
  const chain = getChain();
  if (source !== "auto") {
    return chain.map((provider) => ({ provider, source }));
  }
  // Auto detect: prefer providers that support it; for those that don't,
  // fall back to assuming English so they can still contribute.
  const supporting = chain
    .filter((p) => p.supportsAutoDetect)
    .map((provider) => ({ provider, source: "auto" }));
  const nonSupporting = chain
    .filter((p) => !p.supportsAutoDetect)
    .map((provider) => ({ provider, source: "en" }));
  return [...supporting, ...nonSupporting];
}

async function translateChunk(
  chunk: string,
  source: string,
  target: string
): Promise<string> {
  const cached = await getCached(chunk, source, target);
  if (cached !== undefined) return cached;

  const candidates = providersForRequest(source);
  let lastError: unknown;

  for (const { provider, source: src } of candidates) {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = await provider.translateText(chunk, src, target);
        await setCached(chunk, source, target, result);
        return result;
      } catch (e) {
        lastError = e;
        if (e instanceof QuotaError) break; // move to next provider immediately
        if (e instanceof ProviderError && attempt < MAX_RETRIES) {
          await sleep(RETRY_BASE_DELAY_MS * Math.pow(2, attempt));
          continue;
        }
        break; // unknown error → try next provider
      }
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("All translation providers failed.");
}

/**
 * Translate a single text value across the free provider chain, with caching,
 * retries, fallback, and automatic chunking of long strings.
 *
 * @param text           Source text.
 * @param sourceLanguage ISO code or "auto".
 * @param targetLanguage ISO code.
 */
export async function translateText(
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string> {
  if (!text.trim()) return text;
  if (sourceLanguage === targetLanguage) return text;

  const chunks = splitIntoChunks(text);
  if (chunks.length === 1) {
    return translateChunk(chunks[0], sourceLanguage, targetLanguage);
  }
  const translated = await Promise.all(
    chunks.map((c) => translateChunk(c, sourceLanguage, targetLanguage))
  );
  return translated.join(" ");
}
