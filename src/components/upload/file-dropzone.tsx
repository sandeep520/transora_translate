"use client";

import * as React from "react";
import { UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { cn, formatBytes } from "@/lib/utils";
import { readFileAsText } from "@/utils/file";
import {
  LARGE_FILE_WARNING_BYTES,
  MAX_FILE_BYTES,
} from "@/constants/config";

interface FileDropzoneProps {
  onLoaded: (content: string, filename: string) => void;
}

export function FileDropzone({ onLoaded }: FileDropzoneProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);

  // Prevent the browser from navigating away / opening the file when it is
  // dropped anywhere outside the drop zone.
  React.useEffect(() => {
    const prevent = (e: DragEvent) => {
      e.preventDefault();
    };
    window.addEventListener("dragover", prevent);
    window.addEventListener("drop", prevent);
    return () => {
      window.removeEventListener("dragover", prevent);
      window.removeEventListener("drop", prevent);
    };
  }, []);

  const handleFile = React.useCallback(
    async (file: File) => {
      const isJson =
        file.type === "application/json" || file.name.endsWith(".json");
      if (!isJson) {
        toast.error("Please upload a .json file.");
        return;
      }
      if (file.size === 0) {
        toast.error("That file is empty.");
        return;
      }
      if (file.size > MAX_FILE_BYTES) {
        toast.error(
          `File is too large (${formatBytes(file.size)}). Max ${formatBytes(
            MAX_FILE_BYTES
          )}.`
        );
        return;
      }
      if (file.size > LARGE_FILE_WARNING_BYTES) {
        toast.warning(
          `Large file (${formatBytes(
            file.size
          )}). Translation may take a while on the free tier.`
        );
      }
      try {
        const content = await readFileAsText(file);
        onLoaded(content, file.name);
        toast.success(`Loaded ${file.name}`);
      } catch {
        toast.error("Could not read that file.");
      }
    },
    [onLoaded]
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors",
        dragging
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-accent/40"
      )}
    >
      <UploadCloud className="h-7 w-7 text-muted-foreground" />
      <div className="text-sm font-medium">
        Drag & drop a JSON file, or click to browse
      </div>
      <div className="text-xs text-muted-foreground">
        .json only · up to {formatBytes(MAX_FILE_BYTES)}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
