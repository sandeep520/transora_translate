"use client";

/* eslint-disable @next/next/no-img-element */
import { ImageIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ImageMeta } from "@/types/lens";
import { formatBytes } from "@/lib/utils";

interface ImagePreviewProps {
  url: string;
  meta: ImageMeta;
  blockCount: number;
}

export function ImagePreview({ url, meta, blockCount }: ImagePreviewProps) {
  return (
    <Card className="glass flex flex-col">
      <CardHeader className="space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <ImageIcon className="h-4 w-4 text-primary" /> Original Image
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="overflow-hidden rounded-xl border bg-background">
          {/* Object-URL preview; next/image adds no value for a local blob. */}
          <img
            src={url}
            alt={meta.name}
            className="mx-auto max-h-[360px] w-auto object-contain"
          />
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="secondary">
            {meta.width} × {meta.height} px
          </Badge>
          <Badge variant="secondary">{formatBytes(meta.sizeBytes)}</Badge>
          <Badge variant="secondary">{blockCount} text blocks</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
