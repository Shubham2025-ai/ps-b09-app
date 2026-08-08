"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type CaseRow = {
  id: string;
  trackingCode: string;
  category: string;
  severity: "URGENT" | "ROUTINE";
  status: string;
  retaliationFlag: boolean;
  createdAt: string;
};

export default function ICDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || !["IC_MEMBER", "ADMIN"].includes(session.user.role)) {
      router.push("/login");
      return;
    }

    fetch("/api/ic/cases")
      .then((res) => res.json())
      .then((data) => setCases(data))
      .finally(() => setLoading(false));
  }, [session, status, router]);

  if (status === "loading" || loading) return <div style={{ padding: 40 }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 24 }}>
      <h1>Case Queue</h1>
      <p style={{ color: "#666" }}>{cases.length} cases, urgent first</p>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #ddd", textAlign: "left" }}>
            <th style={{ padding: 8 }}>Tracking Code</th>
            <th style={{ padding: 8 }}>Category</th>
            <th style={{ padding: 8 }}>Severity</th>
            <th style={{ padding: 8 }}>Status</th>
            <th style={{ padding: 8 }}>Flags</th>
            <th style={{ padding: 8 }}>Submitted</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((c) => (
            <tr key={c.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: 8 }}>
                <Link href={`/ic/cases/${c.id}`}>{c.trackingCode}</Link>
              </td>
              <td style={{ padding: 8 }}>{c.category}</td>
              <td style={{ padding: 8 }}>
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: 4,
                    fontSize: 12,
                    background: c.severity === "URGENT" ? "#fee2e2" : "#f3f4f6",
                    color: c.severity === "URGENT" ? "#b91c1c" : "#555",
                  }}
                >
                  {c.severity}
                </span>
              </td>
              <td style={{ padding: 8 }}>{c.status}</td>
              <td style={{ padding: 8 }}>
                {c.retaliationFlag && (
                  <span style={{ fontSize: 12, color: "#b45309" }}>⚠ Retaliation risk</span>
                )}
              </td>
              <td style={{ padding: 8, fontSize: 13, color: "#888" }}>
                {new Date(c.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}