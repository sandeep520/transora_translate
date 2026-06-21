"use client";

import * as React from "react";
import { Camera, ImageUp, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { cn, formatBytes } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MAX_IMAGE_BYTES } from "@/utils/image";

interface UploadZoneProps {
  onImage: (file: File) => void;
}

export function UploadZone({ onImage }: UploadZoneProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const cameraRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);

  // Stop the browser from opening an image dropped outside the zone.
  React.useEffect(() => {
    const prevent = (e: DragEvent) => e.preventDefault();
    window.addEventListener("dragover", prevent);
    window.addEventListener("drop", prevent);
    return () => {
      window.removeEventListener("dragover", prevent);
      window.removeEventListener("drop", prevent);
    };
  }, []);

  // Paste an image from the clipboard anywhere on the page.
  React.useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const item = Array.from(e.clipboardData?.items ?? []).find((i) =>
        i.type.startsWith("image/")
      );
      const file = item?.getAsFile();
      if (file) {
        onImage(file);
        toast.success("Pasted image from clipboard.");
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [onImage]);

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
        if (file) onImage(file);
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-colors",
        dragging
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-accent/40"
      )}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-xl gradient-cta text-white shadow-md">
        <UploadCloud className="h-6 w-6" />
      </span>
      <div className="text-base font-medium">
        Drag &amp; drop an image, or click to browse
      </div>
      <div className="text-xs text-muted-foreground">
        You can also paste from your clipboard (Ctrl/Cmd&nbsp;+&nbsp;V)
      </div>

      <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
        >
          <ImageUp className="h-4 w-4" /> Browse Image
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            cameraRef.current?.click();
          }}
        >
          <Camera className="h-4 w-4" /> Take Photo
        </Button>
      </div>

      <div className="text-xs text-muted-foreground">
        Supported: JPG, PNG, WEBP, BMP, GIF · Max {formatBytes(MAX_IMAGE_BYTES)}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/bmp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onImage(file);
          e.target.value = "";
        }}
      />
      {/* Mobile camera capture. */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onImage(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
