"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { Loader2 } from "lucide-react";

// Lazy-load Monaco so it never blocks first paint or the server bundle.
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[360px] items-center justify-center text-muted-foreground">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading editor…
    </div>
  ),
});

interface JsonEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  height?: string | number;
  minimap?: boolean;
  /** Called with the editor + monaco instances once mounted. */
  onMount?: (editor: unknown, monaco: unknown) => void;
}

export function JsonEditor({
  value,
  onChange,
  readOnly = false,
  height = 460,
  minimap = false,
  onMount,
}: JsonEditorProps) {
  const { resolvedTheme } = useTheme();

  // NOTE: Monaco renders RTL/bidi text (Arabic, Hebrew, Persian, Urdu…)
  // correctly on its own. Do NOT wrap it in a `dir="rtl"` container — Monaco
  // measures its content position from this element, and under RTL the origin
  // flips so the content is shifted out and clipped by `overflow-hidden`,
  // leaving the editor blank.
  return (
    <div className="overflow-hidden rounded-xl border bg-background">
      <MonacoEditor
        height={height}
        defaultLanguage="json"
        language="json"
        theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
        value={value}
        onChange={(v) => onChange?.(v ?? "")}
        onMount={onMount}
        options={{
          readOnly,
          minimap: { enabled: minimap },
          fontSize: 13,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: "on",
          tabSize: 2,
          formatOnPaste: true,
          renderWhitespace: "none",
          smoothScrolling: true,
        }}
      />
    </div>
  );
}
