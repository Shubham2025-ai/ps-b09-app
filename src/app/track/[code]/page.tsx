"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const STATUS_STEPS = ["SUBMITTED", "UNDER_REVIEW", "ACTION_TAKEN", "CLOSED"];

const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  ACTION_TAKEN: "Action Taken",
  CLOSED: "Closed",
};

export default function TrackCasePage() {
  const params = useParams();
  const code = params.code as string;

  const [caseData, setCaseData] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/cases/track/${code}`)
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((data) => setCaseData(data))
      .catch(() => setError("Case not found. Check your tracking code."))
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) return <div style={{ maxWidth: 480, margin: "80px auto" }}>Loading...</div>;

  if (error) {
    return (
      <div style={{ maxWidth: 480, margin: "80px auto", padding: 24, textAlign: "center" }}>
        <p style={{ color: "#b91c1c" }}>{error}</p>
      </div>
    );
  }

  const currentIndex = STATUS_STEPS.indexOf(caseData.status);

  return (
    <div style={{ maxWidth: 480, margin: "80px auto", padding: 24 }}>
      <h1 style={{ textAlign: "center" }}>Case {caseData.trackingCode}</h1>

      <div style={{ marginTop: 32 }}>
        {STATUS_STEPS.map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: i <= currentIndex ? "#333" : "#ddd",
                marginRight: 12,
                flexShrink: 0,
              }}
            />
            <span style={{ color: i <= currentIndex ? "#111" : "#999" }}>
              {STATUS_LABELS[s]}
            </span>
          </div>
        ))}
      </div>

      <p style={{ color: "#888", fontSize: 13, textAlign: "center", marginTop: 24 }}>
        Last updated: {new Date(caseData.updatedAt).toLocaleString()}
      </p>
    </div>
  );
}