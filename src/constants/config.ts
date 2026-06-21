/** App-wide tuning constants for the free, client-side translation pipeline. */

/** Soft warning threshold for large uploads (bytes). */
export const LARGE_FILE_WARNING_BYTES = 1 * 1024 * 1024; // 1 MB

/** Hard cap to avoid freezing the browser (bytes). */
export const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25 MB

/** Max characters per outgoing translation request (free endpoints are strict). */
export const MAX_CHARS_PER_REQUEST = 480;

/** How many string values to attempt to pack into a single batched request. */
export const MAX_ITEMS_PER_BATCH = 20;

/** Number of batches translated concurrently. Keep low to respect rate limits. */
export const CONCURRENCY = 4;

/** Base delay (ms) between retries; grows exponentially. */
export const RETRY_BASE_DELAY_MS = 800;

/** Maximum retry attempts per batch before giving up on it. */
export const MAX_RETRIES = 4;

/** Delimiter used to pack multiple strings into one request and split them back. */
export const BATCH_DELIMITER = "\n␞\n"; // newline + record-separator symbol + newline

export const GITHUB_URL = "https://github.com/";

export const APP_NAME = "Transora";
