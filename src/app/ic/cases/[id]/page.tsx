"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function CaseDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [caseData, setCaseData] = useState<any>(null);
  const [tab, setTab] = useState<"overview" | "evidence" | "audit" | "actions">("overview");
  const [auditData, setAuditData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");

  const loadCase = () => {
    fetch(`/api/ic/cases/${id}`)
      .then((res) => res.json())
      .then((data) => setCaseData(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCase();
  }, [id]);

  const loadAudit = () => {
    fetch(`/api/ic/cases/${id}/audit`)
      .then((res) => res.json())
      .then((data) => setAuditData(data));
  };

  const updateStatus = async (status: string) => {
    setStatusMessage("Updating...");
    await fetch(`/api/ic/cases/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadCase();
    setStatusMessage(`Status updated to ${status}`);
    setTimeout(() => setStatusMessage(""), 3000);
  };

  if (loading || !caseData) return <div style={{ padding: 40 }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: 24 }}>
      <h1>{caseData.trackingCode}</h1>
      <p style={{ color: "#666" }}>
        {caseData.category} · {caseData.severity} · <strong>{caseData.status}</strong>
      </p>

      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid #ddd", marginTop: 24 }}>
        {(["overview", "evidence", "audit", "actions"] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              if (t === "audit") loadAudit();
            }}
            style={{
              padding: "8px 16px",
              border: "none",
              borderBottom: tab === t ? "2px solid #333" : "2px solid transparent",
              background: "none",
              cursor: "pointer",
              fontWeight: tab === t ? 600 : 400,
              textTransform: "capitalize",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 24 }}>
        {tab === "overview" && (
          <div>
            <p><strong>Description:</strong></p>
            <p style={{ background: "#f9f9f9", padding: 12, borderRadius: 6 }}>{caseData.description}</p>
            <p><strong>AI Severity Reasoning:</strong> {caseData.severityReasoning}</p>
            <p><strong>Immediate Danger Flagged:</strong> {caseData.immediateDanger ? "Yes" : "No"}</p>
            <p><strong>Assigned To:</strong> {caseData.assignedTo?.email || "Unassigned"}</p>
          </div>
        )}

        {tab === "evidence" && (
          <div>
            {caseData.evidence.length === 0 && <p>No evidence uploaded.</p>}
            {caseData.evidence.map((e: any) => (
              <div key={e.id} style={{ padding: 12, border: "1px solid #eee", borderRadius: 6, marginBottom: 8 }}>
                <p><strong>{e.fileName}</strong></p>
                <p style={{ fontSize: 12, color: "#888", wordBreak: "break-all" }}>Hash: {e.fileHash}</p>
                <a href={e.storageUrl} target="_blank" rel="noreferrer">View file</a>
              </div>
            ))}
          </div>
        )}

        {tab === "audit" && (
          <div>
            {!auditData && <p>Loading audit trail...</p>}
            {auditData && (
              <>
                <div
                  style={{
                    padding: 12,
                    borderRadius: 6,
                    marginBottom: 16,
                    background: auditData.verification.valid ? "#dcfce7" : "#fee2e2",
                    color: auditData.verification.valid ? "#166534" : "#b91c1c",
                  }}
                >
                  {auditData.verification.valid
                    ? "✓ Chain verified — no tampering detected"
                    : `✗ Chain broken at row ${auditData.verification.brokenAtRowId} (${auditData.verification.brokenAtAction})`}
                </div>
                {auditData.rows.map((r: any) => (
                  <div key={r.id} style={{ padding: 10, borderBottom: "1px solid #eee", fontSize: 13 }}>
                    <strong>{r.action}</strong> by {r.actorRole} — {new Date(r.createdAt).toLocaleString()}
                    <br />
                    <span style={{ color: "#999", fontSize: 11, wordBreak: "break-all" }}>hash: {r.rowHash}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {tab === "actions" && (
          <div>
            <p><strong>Update Status</strong></p>
            {statusMessage && (
              <p style={{ color: "#166534", fontSize: 13 }}>{statusMessage}</p>
            )}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["SUBMITTED", "UNDER_REVIEW", "ACTION_TAKEN", "CLOSED"].map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(s)}
                  disabled={caseData.status === s}
                  style={{ padding: "8px 12px" }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}