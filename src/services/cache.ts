/**
 * Persistent translation cache backed by IndexedDB, with an in-memory layer.
 * Caching identical (text, source, target) tuples avoids re-spending the free
 * provider quota on repeated runs and on the many duplicate strings common in
 * real-world JSON.
 */

const DB_NAME = "json-translator-cache";
const STORE = "translations";
const VERSION = 1;

const memory = new Map<string, string>();

function cacheKey(text: string, source: string, target: string): string {
  return `${source}::${target}::${text}`;
}

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return dbPromise;
}

export async function getCached(
  text: string,
  source: string,
  target: string
): Promise<string | undefined> {
  const key = cacheKey(text, source, target);
  if (memory.has(key)) return memory.get(key);

  const db = await openDb();
  if (!db) return undefined;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = () => {
        const val = req.result as string | undefined;
        if (typeof val === "string") memory.set(key, val);
        resolve(typeof val === "string" ? val : undefined);
      };
      req.onerror = () => resolve(undefined);
    } catch {
      resolve(undefined);
    }
  });
}

export async function setCached(
  text: string,
  source: string,
  target: string,
  value: string
): Promise<void> {
  const key = cacheKey(text, source, target);
  memory.set(key, value);
  const db = await openDb();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}
