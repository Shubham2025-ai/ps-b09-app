"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/lib/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function ReportModePage() {
  const { data: session } = useSession();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-calm-bg text-calm-text">
      <div className="max-w-md mx-auto px-5 py-20">
        <div className="flex justify-end mb-6">
          <LanguageSwitcher />
        </div>

        <h1 className="text-2xl font-serif-warm mb-2">{t.reportTitle}</h1>
        <p className="text-calm-text-muted mb-8">{t.reportSubtitle}</p>

        <Link
          href="/report/new?mode=anonymous"
          className="block p-5 mb-3 rounded-xl border border-calm-border bg-calm-surface hover:border-calm-accent transition-colors"
        >
          <strong className="text-calm-text">{t.anonymous}</strong>
          <p className="text-sm text-calm-text-muted mt-1 mb-0">{t.anonymousDesc}</p>
        </Link>

        <Link
          href={
            session
              ? "/report/new?mode=confidential"
              : "/login?callbackUrl=/report/new?mode=confidential"
          }
          className="block p-5 rounded-xl border border-calm-border bg-calm-surface hover:border-calm-accent transition-colors"
        >
          <strong className="text-calm-text">{t.confidential}</strong>
          <p className="text-sm text-calm-text-muted mt-1 mb-0">{t.confidentialDesc}</p>
        </Link>
      </div>
    </div>
  );
}