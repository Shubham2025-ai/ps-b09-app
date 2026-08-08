"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ResponderCaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [caseData, setCaseData] = useState<any>(null);
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    fetch(`/api/ic/cases/${id}`)
      .then((res) => res.json())
      .then((data) => setCaseData(data));
  }, [id]);

  const handleAcknowledge = async () => {
    await fetch(`/api/responder/cases/${id}/acknowledge`, { method: "PATCH" });
    setAcknowledged(true);
    setTimeout(() => router.push("/responder"), 1500);
  };

  if (!caseData) return <div style={{ padding: 40 }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 24 }}>
      <h1 style={{ color: "#ef4444" }}>Urgent: {caseData.trackingCode}</h1>
      <p><strong>Category:</strong> {caseData.category}</p>
      <p><strong>Description:</strong> {caseData.description}</p>
      <p><strong>Immediate Danger:</strong> {caseData.immediateDanger ? "Yes" : "No"}</p>

      {!acknowledged ? (
        <button
          onClick={handleAcknowledge}
          style={{ padding: "12px 24px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 6, marginTop: 16 }}
        >
          Acknowledge & Respond
        </button>
      ) : (
        <p style={{ color: "#166534", marginTop: 16 }}>✓ Acknowledged. Redirecting to queue...</p>
      )}
    </div>
  );
}