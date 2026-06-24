import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APP_NAME } from "@/constants/config";

export const metadata: Metadata = {
  title: "Documentation",
  description: `How to use ${APP_NAME} to upload, translate, and download JSON files in any language.`,
};

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full gradient-cta text-sm font-semibold text-white">
        {n}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold">{title}</h3>
        <div className="text-sm text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}

const SAMPLE_IN = `{
  "title": "Welcome",
  "description": "Order food online",
  "active": true,
  "count": 5,
  "url": "https://example.com",
  "home": { "cta": "Get started" }
}`;

const SAMPLE_OUT = `{
  "title": "स्वागत है",
  "description": "ऑनलाइन भोजन ऑर्डर करें",
  "active": true,
  "count": 5,
  "url": "https://example.com",
  "home": { "cta": "शुरू हो जाओ" }
}`;

export default function DocsPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
        <p className="text-muted-foreground">
          Everything you need to translate a JSON file in under a minute.
        </p>
      </header>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Quick start</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <Step n={1} title="Add your JSON">
            Drag & drop a <code className="rounded bg-muted px-1">.json</code>{" "}
            file onto the upload area, click to browse, or paste JSON directly
            into the left editor. The validity badge and character count update
            live.
          </Step>
          <Step n={2} title="Choose languages">
            Pick a source language (or leave it on{" "}
            <strong>Auto Detect</strong>) and a target language. Use the swap
            button to reverse them.
          </Step>
          <Step n={3} title="Translate">
            Press <strong>Translate</strong>. The progress bar shows how many
            unique values have been processed. You can cancel at any time.
          </Step>
          <Step n={4} title="Copy or download">
            Copy the result to your clipboard or download it as{" "}
            <code className="rounded bg-muted px-1">translated-&lt;lang&gt;.json</code>.
          </Step>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader>
          <CardTitle>What gets translated</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Input
            </span>
            <pre className="overflow-x-auto rounded-lg border bg-muted/50 p-3 text-xs">
              {SAMPLE_IN}
            </pre>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Output (Hindi)
            </span>
            <pre className="overflow-x-auto rounded-lg border bg-muted/50 p-3 text-xs">
              {SAMPLE_OUT}
            </pre>
          </div>
          <p className="text-sm text-muted-foreground sm:col-span-2">
            Only human-readable string values change. Keys, the URL, the boolean{" "}
            <code className="rounded bg-muted px-1">true</code>, and the number{" "}
            <code className="rounded bg-muted px-1">5</code> are preserved.
          </p>
        </CardContent>
      </Card>

     

      <Card className="glass">
        <CardHeader>
          <CardTitle>Large files & the free tier</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
          <p>
            Identical strings are translated once and reused, and every result
            is cached in your browser (IndexedDB), so re-running a file reuses
            previous work and does not re-spend quota.
          </p>
          <p>
            If the free provider hits its daily limit mid-file, the app keeps all
            translated values, marks the run <strong>partial</strong>, and lets
            you resume later — cached values are reused instantly on the next
            run.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
