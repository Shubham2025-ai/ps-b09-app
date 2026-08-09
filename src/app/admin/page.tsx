"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users as UsersIcon, ShieldCheck, UserCog } from "lucide-react";

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

  if (status === "loading" || loading)
    return <div className="min-h-screen bg-ops-bg text-ops-text p-10">Loading...</div>;

  const icCount = users.filter((u) => u.role === "IC_MEMBER").length;
  const responderCount = users.filter((u) => u.role === "RESPONDER").length;
  const complainantCount = users.filter((u) => u.role === "COMPLAINANT").length;

  return (
    <div className="min-h-screen bg-ops-bg text-ops-text">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-xl font-semibold">Admin Dashboard</h1>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
          <div className="p-4 rounded-xl bg-ops-surface border border-ops-border">
            <UsersIcon size={16} className="text-ops-text-muted mb-2" />
            <p className="text-2xl font-semibold m-0">{users.length}</p>
            <p className="text-xs text-ops-text-muted m-0">Total users</p>
          </div>
          <div className="p-4 rounded-xl bg-ops-surface border border-ops-border">
            <ShieldCheck size={16} className="text-ops-text-muted mb-2" />
            <p className="text-2xl font-semibold m-0">{icCount}</p>
            <p className="text-xs text-ops-text-muted m-0">IC members</p>
          </div>
          <div className="p-4 rounded-xl bg-status-urgent-bg border border-status-urgent">
            <UserCog size={16} className="text-status-urgent mb-2" />
            <p className="text-2xl font-semibold m-0 text-status-urgent">{responderCount}</p>
            <p className="text-xs text-status-urgent m-0">Responders</p>
          </div>
          <div className="p-4 rounded-xl bg-ops-surface border border-ops-border">
            <UsersIcon size={16} className="text-ops-text-muted mb-2" />
            <p className="text-2xl font-semibold m-0">{complainantCount}</p>
            <p className="text-xs text-ops-text-muted m-0">Complainants</p>
          </div>
        </div>

        <Link href="/admin/audit" className="inline-block mb-8 text-ops-accent text-sm">
          → System-wide Audit Integrity Check
        </Link>

        <h2 className="text-lg font-semibold mb-3">Create User</h2>
        <form onSubmit={handleCreate} className="flex gap-2 flex-wrap items-center mb-2">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="p-2 rounded-md border border-ops-border bg-ops-surface text-ops-text"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="p-2 rounded-md border border-ops-border bg-ops-surface text-ops-text"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="p-2 rounded-md border border-ops-border bg-ops-surface text-ops-text"
          >
            <option value="COMPLAINANT">Complainant</option>
            <option value="IC_MEMBER">IC Member</option>
            <option value="RESPONDER">Responder</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button
            type="submit"
            disabled={creating}
            className="px-4 py-2 rounded-md bg-ops-accent text-white disabled:opacity-60"
          >
            {creating ? "Creating..." : "Create"}
          </button>
        </form>
        {message && <p className="text-status-resolved text-sm">{message}</p>}

        <h2 className="text-lg font-semibold mt-8 mb-3">Users ({users.length})</h2>
        <div className="rounded-xl border border-ops-border overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-ops-border bg-ops-surface text-left text-sm text-ops-text-muted">
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-ops-border last:border-0">
                  <td className="p-3">{u.email}</td>
                  <td className="p-3 text-sm">{u.role}</td>
                  <td className="p-3 text-xs text-ops-text-muted">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}