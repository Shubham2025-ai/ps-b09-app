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

  if (status === "loading" || loading) return <div style={{ padding: 40 }}>Verifying all case audit chains...</div>;

  const brokenCount = results.filter((r) => !r.valid).length;

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: 24 }}>
      <h1>System-Wide Audit Integrity</h1>
      <p style={{ color: "#666" }}>
        {results.length} case(s) checked · {brokenCount === 0 ? "All chains intact" : `${brokenCount} chain(s) BROKEN`}
      </p>

      <div style={{ marginTop: 24 }}>
        {results.map((r) => (
          <div
            key={r.caseId}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 16,
              marginBottom: 8,
              borderRadius: 8,
              border: `2px solid ${r.valid ? "#bbf7d0" : "#fca5a5"}`,
              background: r.valid ? "#f0fdf4" : "#fef2f2",
            }}
          >
            <div>
              <strong>{r.trackingCode}</strong>
              {!r.valid && (
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#b91c1c" }}>
                  Chain broken at row {r.brokenAtRowId} — action &quot;{r.brokenAtAction}&quot; does not match its recorded hash
                </p>
              )}
            </div>
            <span
              style={{
                fontSize: 24,
                color: r.valid ? "#16a34a" : "#dc2626",
              }}
            >
              {r.valid ? "✓" : "✗ BROKEN"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}