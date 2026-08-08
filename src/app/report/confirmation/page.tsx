"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, AlertTriangle, Copy } from "lucide-react";
import { useState } from "react";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const severity = searchParams.get("severity");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-calm-bg text-calm-text flex items-center justify-center">
      <div className="w-full max-w-md px-6 text-center">
        <CheckCircle2 size={40} className="text-calm-accent mx-auto mb-4" />
        <h1 className="text-2xl font-serif-warm mb-2">Report Submitted</h1>
        <p className="text-calm-text-muted">
          Your report has been received and routed automatically.
        </p>

        {code && (
          <div className="my-6 p-5 bg-calm-surface border border-calm-border rounded-xl">
            <p className="text-xs text-calm-text-muted mb-1">Your tracking code — save this</p>
            <div className="flex items-center justify-center gap-2">
              <p className="text-2xl font-bold tracking-wide m-0">{code}</p>
              <button onClick={handleCopy} className="text-calm-text-muted hover:text-calm-accent">
                <Copy size={16} />
              </button>
            </div>
            {copied && <p className="text-xs text-calm-accent mt-1">Copied!</p>}
          </div>
        )}

        {severity === "URGENT" && (
          <div className="flex items-center justify-center gap-2 text-danger-text mb-2">
            <AlertTriangle size={16} />
            <p className="m-0 text-sm">
              This has been flagged for urgent response. A responder has been notified.
            </p>
          </div>
        )}

        <a href={`/track/${code}`} className="inline-block mt-4 text-calm-accent font-medium">
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