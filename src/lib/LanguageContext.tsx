"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { Lang, getTranslation, translations } from "./translations";

type LanguageContextType = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: typeof translations["en"];
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("reportLang") as Lang | null;
    if (saved && ["en", "hi", "mr"].includes(saved)) setLangState(saved);
  }, []);

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem("reportLang", newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: getTranslation(lang) }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}