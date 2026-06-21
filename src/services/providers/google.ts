import axios from "axios";
import type { TranslationProvider } from "@/types";
import { ProviderError, QuotaError } from "../errors";

/**
 * Google's free, key-less translation endpoint (the "gtx" client used by the
 * web widget). No API key, CORS-enabled (Access-Control-Allow-Origin: *),
 * supports "auto" source detection, and accepts longer strings than MyMemory —
 * which means fewer requests for large files. Used as the primary free provider.
 */
const ENDPOINT = "https://translate.googleapis.com/translate_a/single";

interface GtxResponse {
  // [ [ [translatedSegment, originalSegment, ...], ... ], ..., detectedLang ]
  0: [string, string, ...unknown[]][];
  2?: string;
}

export function createGoogleProvider(): TranslationProvider {
  return {
    id: "google",
    name: "Google (free)",
    supportsAutoDetect: true,

    async translateText(text, source, target) {
      try {
        const res = await axios.get<GtxResponse>(ENDPOINT, {
          params: {
            client: "gtx",
            sl: source || "auto",
            tl: target,
            dt: "t",
            q: text,
          },
          timeout: 20000,
        });

        const segments = res.data?.[0];
        if (!Array.isArray(segments)) {
          throw new ProviderError("Google returned an unexpected response.");
        }
        // Re-join all translated segments to preserve the full string.
        const translated = segments
          .map((seg) => (Array.isArray(seg) ? seg[0] : ""))
          .join("");
        if (!translated) {
          throw new ProviderError("Google returned no translation.");
        }
        return translated;
      } catch (e) {
        if (e instanceof ProviderError || e instanceof QuotaError) throw e;
        if (axios.isAxiosError(e) && e.response?.status === 429) {
          throw new QuotaError("Google free endpoint rate limit (429).");
        }
        throw new ProviderError(
          e instanceof Error ? e.message : "Google request failed."
        );
      }
    },
  };
}
