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

  if (status === "loading" || loading) return <div style={{ padding: 40 }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", padding: 24, background: "#1a1a1a", color: "#fff", minHeight: "80vh" }}>
      <h1 style={{ color: "#ef4444" }}>Urgent Queue</h1>
      <p style={{ color: "#aaa" }}>{cases.length} urgent case(s) awaiting response</p>

      {cases.length === 0 && <p style={{ color: "#666", marginTop: 24 }}>No urgent cases right now.</p>}

      {cases.map((c) => (
        <div
          key={c.id}
          style={{
            border: "1px solid #ef4444",
            borderRadius: 8,
            padding: 16,
            marginTop: 16,
            background: "#2a1515",
          }}
        >
          <p style={{ margin: 0, fontSize: 12, color: "#ef4444" }}>URGENT · {c.status}</p>
          <p style={{ fontWeight: 600, fontSize: 18 }}>{c.trackingCode}</p>
          <p style={{ color: "#ccc" }}>{c.category}</p>
          {c.immediateDanger && (
            <p style={{ color: "#f87171" }}>⚠ Immediate physical danger reported</p>
          )}
          <Link
            href={`/responder/cases/${c.id}`}
            style={{
              display: "inline-block",
              marginTop: 8,
              padding: "8px 16px",
              background: "#ef4444",
              color: "#fff",
              borderRadius: 6,
              textDecoration: "none",
            }}
          >
            Acknowledge & Respond
          </Link>
        </div>
      ))}
    </div>
  );
}