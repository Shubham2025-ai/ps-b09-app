"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

  if (status === "loading" || loading) return <div style={{ padding: 40 }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 24 }}>
      <h1>Notifications</h1>
      {notifications.length === 0 && <p style={{ color: "#888" }}>No notifications yet.</p>}

      {notifications.map((n) => (
        <div
          key={n.id}
          onClick={() => !n.readAt && markRead(n.id)}
          style={{
            padding: 12,
            marginBottom: 8,
            borderRadius: 6,
            border: "1px solid #eee",
            background: n.readAt ? "#fff" : "#f0f9ff",
            cursor: n.readAt ? "default" : "pointer",
          }}
        >
          <p style={{ margin: 0, fontSize: 13, color: "#888" }}>
            {n.type.replace("_", " ")} · {new Date(n.sentAt).toLocaleString()}
          </p>
          <p style={{ margin: "4px 0 0" }}>
            Case {n.case.trackingCode} — {n.case.category}
          </p>
          {!n.readAt && <span style={{ fontSize: 11, color: "#2563eb" }}>Click to mark read</span>}
        </div>
      ))}
    </div>
  );
}