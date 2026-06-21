import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileJson,
  Globe,
  KeyRound,
  Layers,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { APP_NAME } from "@/constants/config";

export const metadata: Metadata = {
  title: "About",
  description: `What ${APP_NAME} does, the JSON formats it supports, and its key features.`,
};

const FEATURES = [
  {
    icon: FileJson,
    title: "Values only",
    body: "Translates string values while keys, URLs, emails, numbers, booleans, null, dates, and IDs are preserved untouched.",
  },
  {
    icon: Layers,
    title: "Any structure",
    body: "Simple objects, nested objects, arrays, and unlimited deep nesting are all handled by an iterative tree walker.",
  },
  {
    icon: KeyRound,
    title: "No API key",
    body: "Uses free, CORS-enabled providers (Google's key-less endpoint with a MyMemory fallback). Nothing to sign up for.",
  },
  {
    icon: Zap,
    title: "Built for scale",
    body: "Deduplication, an IndexedDB cache, bounded concurrency, retries, and provider fallback push large files through the free tier.",
  },
  {
    icon: ShieldCheck,
    title: "Private by default",
    body: "Your JSON stays in your browser. Only individual string values are sent to the translation provider you configure.",
  },
  {
    icon: Globe,
    title: "100+ languages",
    body: "From English, Hindi, and Gujarati to Arabic, Chinese, Japanese, Korean, and many more — plus Auto-Detect for the source language.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">About {APP_NAME}</h1>
        <p className="text-muted-foreground">
          A modern, client-side tool for translating the values inside JSON
          files — ideal for localizing i18n resource files without breaking
          their structure.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <Card key={f.title} className="glass">
            <CardHeader>
              <div className="mb-1 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">{f.title}</CardTitle>
              <CardDescription>{f.body}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Supported formats</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Any valid <code className="rounded bg-muted px-1">.json</code> file or
          pasted JSON: objects, arrays, and nested combinations. Files up to
          25&nbsp;MB are accepted; very large files are limited only by the free
          translation provider&apos;s daily quota.
        </CardContent>
      </Card>
    </div>
  );
}
