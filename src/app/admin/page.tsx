"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("COMPLAINANT");
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");

  const loadUsers = () => {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "ADMIN") {
      router.push("/login");
      return;
    }
    loadUsers();
  }, [session, status, router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setMessage("");

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });

    if (res.ok) {
      setMessage(`Created ${email}`);
      setEmail("");
      setPassword("");
      loadUsers();
    } else {
      const data = await res.json();
      setMessage(data.error || "Failed to create user");
    }
    setCreating(false);
  };

  if (status === "loading" || loading) return <div style={{ padding: 40 }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: 24 }}>
      <h1>Admin Dashboard</h1>
      <Link href="/admin/audit" style={{ display: "inline-block", marginBottom: 24 }}>
        → System-wide Audit Integrity Check
      </Link>

      <h2 style={{ marginTop: 32 }}>Create User</h2>
      <form onSubmit={handleCreate} style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: 8 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: 8 }}
        />
        <select value={role} onChange={(e) => setRole(e.target.value)} style={{ padding: 8 }}>
          <option value="COMPLAINANT">Complainant</option>
          <option value="IC_MEMBER">IC Member</option>
          <option value="RESPONDER">Responder</option>
          <option value="ADMIN">Admin</option>
        </select>
        <button type="submit" disabled={creating}>
          {creating ? "Creating..." : "Create"}
        </button>
      </form>
      {message && <p style={{ color: "#166534", fontSize: 13 }}>{message}</p>}

      <h2 style={{ marginTop: 32 }}>Users ({users.length})</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #ddd", textAlign: "left" }}>
            <th style={{ padding: 8 }}>Email</th>
            <th style={{ padding: 8 }}>Role</th>
            <th style={{ padding: 8 }}>Created</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: 8 }}>{u.email}</td>
              <td style={{ padding: 8 }}>{u.role}</td>
              <td style={{ padding: 8, fontSize: 13, color: "#888" }}>
                {new Date(u.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}