"use client";

import { useSearchParams } from "next/navigation";

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const severity = searchParams.get("severity");

  return (
    <div style={{ maxWidth: 480, margin: "80px auto", padding: 24, textAlign: "center" }}>
      <h1>Report Submitted</h1>
      <p style={{ color: "#555" }}>
        Your report has been received and routed automatically.
      </p>

      {code && (
        <div style={{ margin: "24px 0", padding: 20, background: "#f5f5f5", borderRadius: 8 }}>
          <p style={{ margin: 0, fontSize: 13, color: "#888" }}>Your tracking code — save this</p>
          <p style={{ fontSize: 24, fontWeight: 700, letterSpacing: 1 }}>{code}</p>
        </div>
      )}

      {severity === "URGENT" && (
        <p style={{ color: "#b91c1c" }}>
          This has been flagged for urgent response. A responder has been notified.
        </p>
      )}

      <a href={`/track/${code}`} style={{ display: "inline-block", marginTop: 16 }}>
        Track this case →
      </a>
    </div>
  );
}