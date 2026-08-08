"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminAuditPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "ADMIN") {
      router.push("/login");
      return;
    }
    fetch("/api/admin/audit")
      .then((res) => res.json())
      .then((data) => setResults(data))
      .finally(() => setLoading(false));
  }, [session, status, router]);

  if (status === "loading" || loading)
    return (
      <div className="min-h-screen bg-ops-bg text-ops-text p-10">
        Verifying all case audit chains...
      </div>
    );

  const brokenCount = results.filter((r) => !r.valid).length;

  return (
    <div className="min-h-screen bg-ops-bg text-ops-text">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-xl font-semibold">System-Wide Audit Integrity</h1>
        <p className="text-ops-text-muted mb-6">
          {results.length} case(s) checked ·{" "}
          {brokenCount === 0 ? (
            <span className="text-status-resolved">All chains intact</span>
          ) : (
            <span className="text-status-urgent">{brokenCount} chain(s) BROKEN</span>
          )}
        </p>

        <div className="space-y-2">
          {results.map((r) => (
            <div
              key={r.caseId}
              className={`flex items-center justify-between p-4 rounded-xl border ${
                r.valid
                  ? "border-status-resolved bg-status-resolved-bg"
                  : "border-status-urgent bg-status-urgent-bg"
              }`}
            >
              <div>
                <strong>{r.trackingCode}</strong>
                {!r.valid && (
                  <p className="text-sm text-status-urgent mt-1 mb-0">
                    Chain broken at row {r.brokenAtRowId} — action &quot;{r.brokenAtAction}&quot;
                    does not match its recorded hash
                  </p>
                )}
              </div>
              <span className={`text-2xl ${r.valid ? "text-status-resolved" : "text-status-urgent"}`}>
                {r.valid ? "✓" : "✗ BROKEN"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}