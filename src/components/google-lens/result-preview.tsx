"use client";

/* eslint-disable @next/next/no-img-element */
import * as React from "react";
import { Check, Copy, Download, Images } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ExportFormat } from "@/types/lens";
import { copyToClipboard } from "@/utils/file";

interface ResultPreviewProps {
  originalUrl: string;
  resultUrl: string | null;
  translatedText: string;
  onDownload: (format: ExportFormat) => void;
}

const FORMATS: ExportFormat[] = ["png", "jpg", "webp"];

export function ResultPreview({
  originalUrl,
  resultUrl,
  translatedText,
  onDownload,
}: ResultPreviewProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    if (!translatedText) return;
    const ok = await copyToClipboard(translatedText);
    if (ok) {
      setCopied(true);
      toast.success("Copied translated text.");
      setTimeout(() => setCopied(false), 1500);
    } else {
      toast.error("Copy failed.");
    }
  };

  return (
    <Card className="glass flex flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Images className="h-4 w-4 text-primary" /> Translated Image
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          disabled={!translatedText}
          onClick={handleCopy}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          Copy text
        </Button>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <figure className="flex flex-col gap-1.5">
            <figcaption className="text-xs font-medium text-muted-foreground">
              Original
            </figcaption>
            <div className="overflow-hidden rounded-xl border bg-background">
              <img
                src={originalUrl}
                alt="Original"
                className="mx-auto max-h-[320px] w-auto object-contain"
              />
            </div>
          </figure>
          <figure className="flex flex-col gap-1.5">
            <figcaption className="text-xs font-medium text-muted-foreground">
              Translated
            </figcaption>
            <div className="flex min-h-[120px] items-center justify-center overflow-hidden rounded-xl border bg-background">
              {resultUrl ? (
                <img
                  src={resultUrl}
                  alt="Translated"
                  className="mx-auto max-h-[320px] w-auto object-contain"
                />
              ) : (
                <span className="p-6 text-center text-sm text-muted-foreground">
                  Translate the image to see the result here.
                </span>
              )}
            </div>
          </figure>
        </div>

        {resultUrl && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Download:</span>
            {FORMATS.map((f) => (
              <Button
                key={f}
                variant="outline"
                size="sm"
                onClick={() => onDownload(f)}
              >
                <Download className="h-4 w-4" /> {f.toUpperCase()}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
