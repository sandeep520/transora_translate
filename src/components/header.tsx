"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/brand/logo";

const NAV = [
  { href: "/", label: "Translator" },
  { href: "/google-lens", label: "Google Lens" },
  { href: "/about", label: "About" },
  { href: "/docs", label: "Docs" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 glass">
      <div className="container flex h-16 items-center justify-between">
        <Link
          href="/"
          aria-label="Transora home"
          className="rounded-md outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Logo height={70} />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Button key={item.href} variant="ghost" size="sm" asChild>
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
