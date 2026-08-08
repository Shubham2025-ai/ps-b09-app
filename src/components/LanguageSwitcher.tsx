"use client";

import { useLanguage } from "@/lib/LanguageContext";
import { Languages } from "lucide-react";

const LANGS: { code: "en" | "hi" | "mr"; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "hi", label: "हिं" },
  { code: "mr", label: "मरा" },
];

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-calm-surface border border-calm-border rounded-lg p-1">
      <Languages size={14} className="text-calm-text-muted ml-1.5 mr-0.5" />
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
            lang === l.code
              ? "bg-calm-accent text-white"
              : "text-calm-text-muted hover:text-calm-text"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}