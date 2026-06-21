# Transora

A modern, production-ready web app that translates the **values** inside JSON
files into 13+ languages while leaving keys, URLs, emails, numbers, booleans,
`null`, dates, and IDs untouched. 100% client-side, **no API key required**.

Built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**,
**Shadcn-style UI**, **Monaco Editor**, **TanStack Query**, and **Sonner**.

## Features

- Upload (browse + drag & drop) or paste JSON
- Live JSON validation, character count, format & reset
- Monaco editor (lazy-loaded) — editable input, read-only output
- Source / target language dropdowns (Auto-Detect supported)
- Translate every value in simple, nested, array, and deeply-nested JSON
- Progress bar with cancel; partial-result handling on quota limits
- Copy to clipboard and download as `translated-<lang>.json`
- Dark mode + fully responsive (2-col → stacked → full width)
- Pages: `/` (translator), `/about`, `/docs`

## Translation engine

- **Values only** — keys, URLs, emails, numbers, booleans, null, dates, hex
  colors, and identifier-like keys/values are skipped.
- **Deduplication** — identical strings are translated once and reused.
- **Persistent cache** (IndexedDB) — re-runs reuse prior results, never
  re-spending free quota.
- **Bounded concurrency + retries + provider fallback** for large files.
- **Free, key-less, CORS-enabled providers**: Google's `gtx` endpoint (primary)
  with a **MyMemory** fallback. The service layer is provider-agnostic — add
  Google Cloud, DeepL, OpenAI, or Azure by implementing `TranslationProvider`.

## Getting started

```bash
cp .env.example .env.local   # optional — sensible defaults work out of the box
npm install
npm run dev                  # http://localhost:3000
```

Load `public/sample.json` to try it immediately.

## Configuration

```env
NEXT_PUBLIC_TRANSLATION_API=google   # or "mymemory"
NEXT_PUBLIC_MYMEMORY_EMAIL=          # optional, lifts MyMemory's free daily limit
```

## Notes on large files & the free tier

Free public endpoints have rate limits. Dedup + caching + fallback get typical
large i18n files (lots of short, repeated strings) through. If a limit is hit
mid-file, translated values are kept, the run is marked **partial**, and a
re-run resumes instantly from cache. For guaranteed high-volume throughput, wire
a keyed provider via the `TranslationProvider` interface.

## Project structure

```
src/
├── app/                 # pages (/, /about, /docs), layout, providers
├── components/
│   ├── editor/          # Monaco JSON editor
│   ├── translator/      # panels, controls, language select
│   ├── upload/          # drag & drop dropzone
│   └── ui/              # button, card, select, progress, badge
├── constants/           # languages, config
├── hooks/               # use-translator
├── lib/                 # cn, helpers
├── services/            # translation engine, providers, cache, errors
├── types/               # shared types
└── utils/               # json + file utilities
```

Deploys to **Vercel** as a static client app.
