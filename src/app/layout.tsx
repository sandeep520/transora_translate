import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Toaster } from "sonner";
import { APP_NAME } from "@/constants/config";

const inter = Inter({ subsets: ["latin"] });

const APP_TAGLINE = "Translate JSON values into any language";
const APP_DESCRIPTION =
  "Transora is a free, key-free JSON translator. Upload, edit, and translate JSON files into 100+ languages right in your browser — keys, URLs, emails, numbers, and IDs are preserved.";

export const metadata: Metadata = {
  // "%s" pages render as "About — Transora"; the home title uses `default`.
  title: {
    default: `${APP_NAME} — ${APP_TAGLINE}`,
    template: `%s — ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  keywords: [
    "Transora",
    "JSON translator",
    "translate JSON",
    "JSON localization",
    "i18n",
    "internationalization",
    "JSON language translator",
    "free JSON translation",
  ],
  authors: [{ name: "Sandeep Rathod" }],
  creator: "Sandeep Rathod",
  openGraph: {
    type: "website",
    title: `${APP_NAME} — ${APP_TAGLINE}`,
    description: APP_DESCRIPTION,
    siteName: APP_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} — ${APP_TAGLINE}`,
    description: APP_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="relative flex min-h-screen flex-col app-gradient">
            <Header />
            <main className="container flex-1 py-8">{children}</main>
            <Footer />
          </div>
          <Toaster richColors closeButton position="bottom-right" />
        </Providers>
      </body>
    </html>
  );
}
