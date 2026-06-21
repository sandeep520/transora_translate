import { Translator } from "@/components/translator/translator";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col items-center gap-3 pt-2 text-center">
        <Badge variant="secondary" className="gap-1.5">
          <Sparkles className="h-3 w-3" /> Free · No API key · Runs in your browser
        </Badge>
        <h1 className="max-w-3xl text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Translate JSON files into{" "}
          <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            any language
          </span>
        </h1>
        <p className="max-w-2xl text-balance text-muted-foreground sm:text-lg">
          Upload or paste JSON, pick languages, and translate every value while
          keys, URLs, emails, numbers, and IDs stay exactly as they are.
        </p>
      </section>

      <Translator />
    </div>
  );
}
