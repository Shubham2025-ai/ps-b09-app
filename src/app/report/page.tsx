"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function ReportModePage() {
  const { data: session } = useSession();

  return (
    <div style={{ maxWidth: 480, margin: "80px auto", padding: 24 }}>
      <h1>Report an Incident</h1>
      <p style={{ color: "#555", marginBottom: 24 }}>
        This report is confidential. Choose how you'd like to submit it.
      </p>

      <Link
        href="/report/new?mode=anonymous"
        style={{
          display: "block",
          padding: 16,
          marginBottom: 12,
          border: "1px solid #ccc",
          borderRadius: 8,
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <strong>Anonymous</strong>
        <p style={{ margin: 0, color: "#666", fontSize: 14 }}>
          No identity stored. You'll get a tracking code to check status.
        </p>
      </Link>

      <Link
        href={session ? "/report/new?mode=confidential" : "/login?callbackUrl=/report/new?mode=confidential"}
        style={{
          display: "block",
          padding: 16,
          border: "1px solid #ccc",
          borderRadius: 8,
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <strong>Confidential</strong>
        <p style={{ margin: 0, color: "#666", fontSize: 14 }}>
          Identity stored, visible only to your assigned IC member.
        </p>
      </Link>
    </div>
  );
}