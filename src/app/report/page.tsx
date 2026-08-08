"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function ReportModePage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-calm-bg text-calm-text">
      <div className="max-w-md mx-auto px-5 py-20">
        <h1 className="text-2xl font-serif-warm mb-2">Report an Incident</h1>
        <p className="text-calm-text-muted mb-8">
          This report is confidential. Choose how you'd like to submit it.
        </p>

        <Link
          href="/report/new?mode=anonymous"
          className="block p-5 mb-3 rounded-xl border border-calm-border bg-calm-surface hover:border-calm-accent transition-colors"
        >
          <strong className="text-calm-text">Anonymous</strong>
          <p className="text-sm text-calm-text-muted mt-1 mb-0">
            No identity stored. You'll get a tracking code to check status.
          </p>
        </Link>

        <Link
          href={
            session
              ? "/report/new?mode=confidential"
              : "/login?callbackUrl=/report/new?mode=confidential"
          }
          className="block p-5 rounded-xl border border-calm-border bg-calm-surface hover:border-calm-accent transition-colors"
        >
          <strong className="text-calm-text">Confidential</strong>
          <p className="text-sm text-calm-text-muted mt-1 mb-0">
            Identity stored, visible only to your assigned IC member.
          </p>
        </Link>
      </div>
    </div>
  );
}