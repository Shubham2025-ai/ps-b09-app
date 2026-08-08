"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MyCasesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }
    fetch("/api/my-cases")
      .then((res) => res.json())
      .then((data) => setCases(data))
      .finally(() => setLoading(false));
  }, [session, status, router]);

  if (status === "loading" || loading)
    return <div className="min-h-screen bg-calm-bg text-calm-text p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-calm-bg text-calm-text">
      <div className="max-w-lg mx-auto px-6 py-10">
        <h1 className="text-2xl font-serif-warm mb-2">My Reports</h1>
        <p className="text-calm-text-muted mb-8">
          {cases.length === 0 ? "You haven't submitted any reports yet." : `${cases.length} report(s)`}
        </p>

        {cases.length === 0 && (
          <Link
            href="/report"
            className="inline-block px-5 py-3 rounded-xl bg-calm-accent text-white font-medium"
          >
            Report an Incident
          </Link>
        )}

        <div className="space-y-3">
          {cases.map((c) => (
            <Link
              key={c.id}
              href={`/track/${c.trackingCode}`}
              className="block p-4 rounded-xl border border-calm-border bg-calm-surface hover:border-calm-accent transition-colors"
            >
              <p className="font-semibold m-0">{c.trackingCode}</p>
              <p className="text-sm text-calm-text-muted m-0">{c.category} · {c.status}</p>
              <p className="text-xs text-calm-text-muted m-0 mt-1">
                {new Date(c.createdAt).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}