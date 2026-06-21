"use client";

import * as React from "react";
import { toast } from "sonner";
import { Copy, FileEdit, FileText, GitCompare } from "lucide-react";
import { useTranslator } from "@/hooks/use-translator";
import { useJsonAnalysis } from "@/hooks/use-json-analysis";
import { InputPanel } from "./input-panel";
import { OutputPanel } from "./output-panel";
import { TranslationControls } from "./translation-controls";
import { DashboardOverview } from "@/components/analytics/dashboard-overview";
import { DuplicateDetector } from "@/components/duplicate-detector/duplicate-detector";
import { MissingDetector } from "@/components/missing-detector/missing-detector";
import { DiffViewer } from "@/components/diff-viewer/diff-viewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AUTO_DETECT, getLanguageByCode } from "@/constants/languages";

export function Translator() {
  const t = useTranslator();
  const [tab, setTab] = React.useState("editor");
  const editorRef = React.useRef<{
    getModel: () => unknown;
    setSelection: (r: unknown) => void;
    revealRangeInCenter: (r: unknown) => void;
    focus: () => void;
  } | null>(null);

  // Compare against the first translated language that has output.
  const activeOutputCode =
    t.targets.find((code) => t.outputs[code] !== undefined) ?? null;
  const activeOutput = activeOutputCode ? t.outputs[activeOutputCode] : null;

  const analysis = useJsonAnalysis(t.input, activeOutput);

  const canTranslate =
    t.validation.valid && !t.isTranslating && t.targets.length > 0;

  const handleSwap = () => {
    const newSource = t.targets[0] ?? "en";
    let newTarget = t.source === AUTO_DETECT.code ? "en" : t.source;
    if (newTarget === newSource) newTarget = newSource === "en" ? "hi" : "en";
    t.setSource(newSource);
    t.setTargets([newTarget]);
  };

  /** Reveal a JSON key in the input editor (used by the Missing detector). */
  const handleJump = (key: string) => {
    setTab("editor");
    const leaf = key.split(".").pop()!.replace(/\[\d+\]/g, "");
    setTimeout(() => {
      const editor = editorRef.current;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const model = editor?.getModel() as any;
      if (!editor || !model) return;
      const matches = model.findMatches(`"${leaf}"`, true, false, true, null, false);
      if (matches.length) {
        editor.setSelection(matches[0].range);
        editor.revealRangeInCenter(matches[0].range);
        editor.focus();
      } else {
        toast.info(`"${leaf}" not found in the editor.`);
      }
    }, 150);
  };

  return (
    <div className="flex flex-col gap-6">
      <DashboardOverview stats={analysis.dashboard} />

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="flex w-full flex-wrap justify-start sm:w-auto">
          <TabsTrigger value="editor">
            <FileEdit className="h-4 w-4" /> Editor
          </TabsTrigger>
          <TabsTrigger value="duplicates">
            <Copy className="h-4 w-4" /> Duplicates
            {analysis.duplicates.length > 0 && (
              <Badge variant="warning" className="ml-1">
                {analysis.duplicates.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="missing">
            <FileText className="h-4 w-4" /> Missing
            {analysis.missing.summary.missingKeys > 0 && (
              <Badge variant="destructive" className="ml-1">
                {analysis.missing.summary.missingKeys}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="diff">
            <GitCompare className="h-4 w-4" /> Diff
            {analysis.diff && analysis.diff.counts.modified > 0 && (
              <Badge variant="secondary" className="ml-1">
                {analysis.diff.counts.modified}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Keep the editor mounted so jump-to-key works across tabs. */}
        <TabsContent value="editor" forceMount className="data-[state=inactive]:hidden">
          <div className="flex flex-col gap-6">
            <TranslationControls
              source={t.source}
              targets={t.targets}
              onSource={t.setSource}
              onTargets={t.setTargets}
              onSwap={handleSwap}
              onTranslate={t.translate}
              onCancel={t.cancel}
              canTranslate={canTranslate}
              isTranslating={t.isTranslating}
              progress={t.progress}
            />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <InputPanel
                value={t.input}
                onChange={t.setInput}
                validation={t.validation}
                onReset={t.reset}
                disabled={t.isTranslating}
                onEditorMount={(editor) => {
                  editorRef.current = editor as typeof editorRef.current;
                }}
              />
              <OutputPanel
                outputs={t.outputs}
                statuses={t.statuses}
                progress={t.progress}
                targets={t.targets}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="duplicates">
          <DuplicateDetector
            duplicates={analysis.duplicates}
            stats={analysis.duplicateStats}
            disabled={!analysis.validInput}
          />
        </TabsContent>

        <TabsContent value="missing">
          <MissingDetector
            report={analysis.missing}
            onJump={handleJump}
            disabled={!analysis.validInput}
          />
        </TabsContent>

        <TabsContent value="diff">
          <DiffViewer
            original={t.input}
            translated={activeOutput}
            diff={analysis.diff}
            languageName={
              activeOutputCode
                ? getLanguageByCode(activeOutputCode)?.name
                : undefined
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
