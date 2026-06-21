"use client";

import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Language } from "@/constants/languages";

interface LanguageMultiSelectProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  options: Language[];
  disabled?: boolean;
}

export function LanguageMultiSelect({
  label,
  values,
  onChange,
  options,
  disabled,
}: LanguageMultiSelectProps) {
  const [query, setQuery] = React.useState("");
  const selected = options.filter((o) => values.includes(o.code));

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.name.toLowerCase().includes(q) || o.code.toLowerCase().includes(q)
    );
  }, [options, query]);

  const toggle = (code: string) => {
    if (values.includes(code)) onChange(values.filter((v) => v !== code));
    else onChange([...values, code]);
  };

  const summary =
    selected.length === 0
      ? "Select language(s)"
      : selected.length <= 2
        ? selected.map((s) => s.name).join(", ")
        : `${selected.length} languages`;

  return (
    <div className="flex w-full flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger
          disabled={disabled}
          className={cn(
            "flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            selected.length === 0 && "text-muted-foreground"
          )}
        >
          <span className="truncate">{summary}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="start"
            sideOffset={4}
            onCloseAutoFocus={() => setQuery("")}
            className="z-50 min-w-[var(--radix-dropdown-menu-trigger-width)] rounded-lg border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=open]:fade-in-0"
          >
            <div className="sticky top-0 flex items-center gap-2 rounded-md border bg-background px-2 py-1.5">
              <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="Search language…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div className="mt-1 max-h-64 overflow-y-auto">
              {filtered.length === 0 && (
                <div className="px-2 py-3 text-center text-sm text-muted-foreground">
                  No language found
                </div>
              )}
              {filtered.map((opt) => {
                const checked = values.includes(opt.code);
                return (
                  <DropdownMenu.CheckboxItem
                    key={opt.code}
                    checked={checked}
                    onCheckedChange={() => toggle(opt.code)}
                    onSelect={(e) => e.preventDefault()}
                    className="relative flex cursor-pointer select-none items-center rounded-md py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground"
                  >
                    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                      {checked && <Check className="h-4 w-4" />}
                    </span>
                    {opt.name}
                  </DropdownMenu.CheckboxItem>
                );
              })}
            </div>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-0.5">
          {selected.map((s) => (
            <span
              key={s.code}
              className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
            >
              {s.name}
              {!disabled && (
                <button
                  type="button"
                  aria-label={`Remove ${s.name}`}
                  onClick={() => toggle(s.code)}
                  className="rounded-full hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
