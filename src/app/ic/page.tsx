"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Inbox } from "lucide-react";

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

  if (status === "loading" || loading)
    return <div className="min-h-screen bg-ops-bg text-ops-text p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-ops-bg text-ops-text">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-xl font-semibold">Case Queue</h1>
        <p className="text-ops-text-muted mb-6">{cases.length} cases, urgent first</p>

        {cases.length === 0 ? (
          <div className="text-center py-16 text-ops-text-muted">
            <Inbox size={32} className="mx-auto mb-3 opacity-50" />
            <p>No cases in the queue right now.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-ops-border overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-ops-border bg-ops-surface text-left text-sm text-ops-text-muted">
                  <th className="p-3">Tracking Code</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Flags</th>
                  <th className="p-3">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => (
                  <tr key={c.id} className="border-b border-ops-border last:border-0 hover:bg-ops-surface">
                    <td className="p-3">
                      <Link href={`/ic/cases/${c.id}`} className="text-ops-accent font-medium">
                        {c.trackingCode}
                      </Link>
                    </td>
                    <td className="p-3">{c.category}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          c.severity === "URGENT"
                            ? "bg-status-urgent-bg text-status-urgent"
                            : "bg-status-routine-bg text-status-routine"
                        }`}
                      >
                        {c.severity}
                      </span>
                    </td>
                    <td className="p-3 text-sm">{c.status}</td>
                    <td className="p-3">
                      {c.retaliationFlag && (
                        <span className="text-xs text-status-urgent">⚠ Retaliation risk</span>
                      )}
                    </td>
                    <td className="p-3 text-xs text-ops-text-muted">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}