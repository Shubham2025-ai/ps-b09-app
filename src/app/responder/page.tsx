"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ResponderQueuePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || !["RESPONDER", "ADMIN"].includes(session.user.role)) {
      router.push("/login");
      return;
    }
    fetch("/api/responder/cases")
      .then((res) => res.json())
      .then((data) => setCases(data))
      .finally(() => setLoading(false));
  }, [session, status, router]);

  if (status === "loading" || loading)
    return <div className="min-h-screen bg-ops-bg text-ops-text p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-ops-bg text-ops-text">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-xl font-semibold text-status-urgent">Urgent Queue</h1>
        <p className="text-ops-text-muted mb-6">{cases.length} urgent case(s) awaiting response</p>

        {cases.length === 0 && (
          <p className="text-ops-text-muted mt-6">No urgent cases right now.</p>
        )}

        <div className="space-y-4">
          {cases.map((c) => (
            <div
              key={c.id}
              className="border border-status-urgent rounded-xl p-4 bg-status-urgent-bg"
            >
              <p className="text-xs text-status-urgent m-0">
                URGENT · {c.status}
              </p>
              <p className="text-lg font-semibold m-0 mt-1">{c.trackingCode}</p>
              <p className="text-ops-text-muted m-0">{c.category}</p>
              {c.immediateDanger && (
                <p className="text-status-urgent text-sm mt-1">
                  ⚠ Immediate physical danger reported
                </p>
              )}
              <Link
                href={`/responder/cases/${c.id}`}
                className="inline-block mt-3 px-4 py-2 bg-status-urgent text-white rounded-lg text-sm font-medium"
              >
                Acknowledge & Respond
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}