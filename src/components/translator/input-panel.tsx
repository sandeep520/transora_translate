"use client";

import { CheckCircle2, FileJson, RotateCcw, Wand2, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JsonEditor } from "@/components/editor/json-editor";
import { FileDropzone } from "@/components/upload/file-dropzone";
import type { JsonValidationResult } from "@/types";
import { formatJson } from "@/utils/json";

interface InputPanelProps {
  value: string;
  onChange: (v: string) => void;
  validation: JsonValidationResult;
  onReset: () => void;
  disabled?: boolean;
  onEditorMount?: (editor: unknown, monaco: unknown) => void;
}

export function InputPanel({
  value,
  onChange,
  validation,
  onReset,
  disabled,
  onEditorMount,
}: InputPanelProps) {
  const charCount = value.length;
  const hasContent = value.trim().length > 0;

  return (
    <Card className="glass flex flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileJson className="h-4 w-4 text-primary" /> Input JSON
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled || !hasContent || !validation.valid}
            onClick={() => onChange(formatJson(value))}
          >
            <Wand2 className="h-4 w-4" /> Format
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled || !hasContent}
            onClick={() => {
              onReset();
              toast.success("Cleared.");
            }}
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <FileDropzone
          onLoaded={(content) => onChange(content)}
        />
        <JsonEditor value={value} onChange={onChange} onMount={onEditorMount} />
        <div className="flex items-center justify-between text-xs">
          {hasContent ? (
            validation.valid ? (
              <Badge variant="success">
                <CheckCircle2 className="h-3 w-3" /> Valid JSON
              </Badge>
            ) : (
              <Badge variant="destructive">
                <XCircle className="h-3 w-3" /> Invalid JSON
              </Badge>
            )
          ) : (
            <Badge variant="secondary">Paste or upload JSON</Badge>
          )}
          <span className="text-muted-foreground">
            {charCount.toLocaleString()} chars
          </span>
        </div>
        {hasContent && !validation.valid && validation.error && (
          <p className="text-xs text-destructive">{validation.error}</p>
        )}
      </CardContent>
    </Card>
  );
}
