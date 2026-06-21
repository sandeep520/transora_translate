"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Language } from "@/constants/languages";

interface LanguageSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Language[];
  disabled?: boolean;
}

export function LanguageSelect({
  label,
  value,
  onChange,
  options,
  disabled,
}: LanguageSelectProps) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          {options.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
