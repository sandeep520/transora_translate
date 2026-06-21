import type { JsonValue } from "@/types";

/** Build a readable dotted path: ["home","items",0,"title"] → "home.items[0].title". */
export function joinPath(path: (string | number)[]): string {
  let out = "";
  for (const seg of path) {
    if (typeof seg === "number") out += `[${seg}]`;
    else out += out ? `.${seg}` : seg;
  }
  return out;
}

/**
 * Iteratively visit every leaf (string | number | boolean | null) in a JSON
 * tree, calling `cb` with its path and value. Stack-based so deeply nested /
 * very large (10k+) documents never overflow the call stack.
 */
export function walkLeaves(
  root: JsonValue,
  cb: (path: (string | number)[], value: JsonValue) => void
): void {
  const stack: { node: JsonValue; path: (string | number)[] }[] = [
    { node: root, path: [] },
  ];
  while (stack.length) {
    const { node, path } = stack.pop()!;
    if (Array.isArray(node)) {
      for (let i = node.length - 1; i >= 0; i--) {
        stack.push({ node: node[i], path: [...path, i] });
      }
    } else if (node && typeof node === "object") {
      const keys = Object.keys(node);
      for (let i = keys.length - 1; i >= 0; i--) {
        stack.push({ node: node[keys[i]], path: [...path, keys[i]] });
      }
    } else {
      cb(path, node);
    }
  }
}

/** Flatten a JSON tree to a map of dotted-path → leaf value. */
export function flattenLeaves(root: JsonValue): Map<string, JsonValue> {
  const map = new Map<string, JsonValue>();
  walkLeaves(root, (path, value) => map.set(joinPath(path), value));
  return map;
}
