"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => setNotifications(data))
      .finally(() => setLoading(false));
  }, [session, status, router]);

  const markRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
    );
  };

  const isOpsRole = ["IC_MEMBER", "RESPONDER", "ADMIN"].includes(session?.user?.role || "");
  const bgClass = isOpsRole ? "bg-ops-bg text-ops-text" : "bg-calm-bg text-calm-text";
  const surfaceClass = isOpsRole
    ? "bg-ops-surface border-ops-border"
    : "bg-calm-surface border-calm-border";
  const mutedClass = isOpsRole ? "text-ops-text-muted" : "text-calm-text-muted";
  const unreadBg = isOpsRole ? "bg-ops-accent/10" : "bg-calm-accent/10";

  if (status === "loading" || loading)
    return <div className={`min-h-screen ${bgClass} p-10`}>Loading...</div>;

  return (
    <div className={`min-h-screen ${bgClass}`}>
      <div className="max-w-xl mx-auto px-6 py-10">
        <h1 className="text-xl font-semibold mb-1">Notifications</h1>
        {notifications.length === 0 && (
          <p className={`${mutedClass} mt-4`}>No notifications yet.</p>
        )}

        <div className="space-y-2 mt-4">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.readAt && markRead(n.id)}
              className={`p-3 rounded-lg border ${surfaceClass} ${
                !n.readAt ? `${unreadBg} cursor-pointer` : ""
              }`}
            >
              <p className={`text-xs ${mutedClass} m-0`}>
                {n.type.replace(/_/g, " ")} · {new Date(n.sentAt).toLocaleString()}
              </p>
              <p className="m-0 mt-1">
                Case {n.case.trackingCode} — {n.case.category}
              </p>
              {!n.readAt && (
                <span className="text-xs text-ops-accent">Click to mark read</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}