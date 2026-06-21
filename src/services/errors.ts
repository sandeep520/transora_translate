/** Thrown when a provider reports it is out of free quota / rate limited. */
export class QuotaError extends Error {
  constructor(message = "Translation quota reached for this provider.") {
    super(message);
    this.name = "QuotaError";
  }
}

/** Thrown for transient/recoverable provider failures (retryable). */
export class ProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProviderError";
  }
}
