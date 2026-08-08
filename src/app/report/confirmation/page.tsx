"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const severity = searchParams.get("severity");

  return (
    <div className="min-h-screen bg-calm-bg text-calm-text flex items-center justify-center">
      <div className="w-full max-w-md px-6 text-center">
        <h1 className="text-2xl font-serif-warm mb-2">Report Submitted</h1>
        <p className="text-calm-text-muted">
          Your report has been received and routed automatically.
        </p>

        {code && (
          <div className="my-6 p-5 bg-calm-surface border border-calm-border rounded-xl">
            <p className="text-xs text-calm-text-muted mb-1">Your tracking code — save this</p>
            <p className="text-2xl font-bold tracking-wide">{code}</p>
          </div>
        )}

        {severity === "URGENT" && (
          <p className="text-danger-text">
            This has been flagged for urgent response. A responder has been notified.
          </p>
        )}

        <a href={`/track/${code}`} className="inline-block mt-4 text-calm-accent">
          Track this case →
        </a>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-calm-bg" />}>
      <ConfirmationContent />
    </Suspense>
  );
}