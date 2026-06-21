"use client";

import { useGoogleLens } from "@/hooks/use-google-lens";
import { UploadZone } from "./upload-zone";
import { ImagePreview } from "./image-preview";
import { OcrPanel } from "./ocr-panel";
import { TranslationPanel } from "./translation-panel";
import { ResultPreview } from "./result-preview";

export function GoogleLens() {
  const lens = useGoogleLens();
  const hasImage = Boolean(lens.meta && lens.originalUrl);

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Google Lens Translator
        </h1>
        <p className="text-sm text-muted-foreground">
          Upload an image, extract text, translate it into any language, and
          download the translated image.
        </p>
      </div>

      {!hasImage ? (
        <UploadZone onImage={lens.loadImage} />
      ) : (
        <div className="flex flex-col gap-6">
          <TranslationPanel
            source={lens.source}
            target={lens.target}
            onSource={lens.setSource}
            onTarget={lens.setTarget}
            onTranslate={lens.translate}
            onReset={lens.reset}
            status={lens.status}
            progress={lens.progress}
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="flex flex-col gap-6">
              <ImagePreview
                url={lens.originalUrl!}
                meta={lens.meta!}
                blockCount={lens.blocks.length}
              />
              <OcrPanel
                blocks={lens.blocks}
                onEdit={lens.updateBlock}
                busy={lens.status === "ocr"}
              />
            </div>

            <ResultPreview
              originalUrl={lens.originalUrl!}
              resultUrl={lens.resultUrl}
              translatedText={lens.translatedText}
              onDownload={lens.download}
            />
          </div>
        </div>
      )}
    </div>
  );
}
