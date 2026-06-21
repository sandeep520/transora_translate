import axios from "axios";
import type { TranslationProvider } from "@/types";
import { ProviderError, QuotaError } from "../errors";

/**
 * MyMemory — free, no API key, CORS-enabled.
 * Anonymous: ~1,000 words/day. With a valid `de` email: ~50,000 words/day.
 * Source "auto" is not supported, so the engine resolves it before calling.
 */
const ENDPOINT = "https://api.mymemory.translated.net/get";

export function createMyMemoryProvider(email?: string): TranslationProvider {
  return {
    id: "mymemory",
    name: "MyMemory (free)",
    supportsAutoDetect: false,

    async translateText(text, source, target) {
      const langpair = `${source}|${target}`;
      try {
        const res = await axios.get(ENDPOINT, {
          params: {
            q: text,
            langpair,
            ...(email ? { de: email } : {}),
          },
          timeout: 20000,
        });

        const data = res.data;
        const status = data?.responseStatus;
        const translated: string | undefined = data?.responseData?.translatedText;

        // MyMemory signals quota exhaustion via a 429 status or a warning string.
        const detail: string = String(
          data?.responseDetails ?? data?.responseData?.translatedText ?? ""
        ).toUpperCase();
        if (
          status === 429 ||
          detail.includes("MYMEMORY WARNING") ||
          detail.includes("USED ALL AVAILABLE FREE")
        ) {
          throw new QuotaError(
            "MyMemory free quota reached. Add an email to raise the limit, or the app will try the fallback provider."
          );
        }

        if (status && status !== 200) {
          throw new ProviderError(
            `MyMemory error ${status}: ${data?.responseDetails ?? "unknown"}`
          );
        }
        if (typeof translated !== "string") {
          throw new ProviderError("MyMemory returned no translation.");
        }
        return translated;
      } catch (e) {
        if (e instanceof QuotaError || e instanceof ProviderError) throw e;
        if (axios.isAxiosError(e) && e.response?.status === 429) {
          throw new QuotaError("MyMemory rate limit (429).");
        }
        throw new ProviderError(
          e instanceof Error ? e.message : "MyMemory request failed."
        );
      }
    },
  };
}
