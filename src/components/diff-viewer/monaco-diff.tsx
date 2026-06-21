"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { Loader2 } from "lucide-react";

const DiffEditor = dynamic(
  () => import("@monaco-editor/react").then((m) => m.DiffEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[360px] items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading diff editor…
      </div>
    ),
  }
);

interface MonacoDiffProps {
  original: string;
  modified: string;
  height?: string | number;
  collapseUnchanged?: boolean;
}

export function MonacoDiff({
  original,
  modified,
  height = 520,
  collapseUnchanged = false,
}: MonacoDiffProps) {
  const { resolvedTheme } = useTheme();
  return (
    <div className="overflow-hidden rounded-xl border bg-background">
      <DiffEditor
        height={height}
        language="json"
        original={original}
        modified={modified}
        theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
        options={{
          readOnly: true,
          renderSideBySide: true,
          automaticLayout: true,
          minimap: { enabled: false },
          fontSize: 13,
          scrollBeyondLastLine: false,
          wordWrap: "on",
          renderOverviewRuler: false,
          hideUnchangedRegions: { enabled: collapseUnchanged },
        }}
      />
    </div>
  );
}
