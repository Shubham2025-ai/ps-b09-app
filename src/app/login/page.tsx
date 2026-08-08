"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = await signIn("credentials", {
      email: email.trim(),
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password");
      setSubmitting(false);
    } else {
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const role = session?.user?.role;

      if (role === "IC_MEMBER") router.push("/ic");
      else if (role === "RESPONDER") router.push("/responder");
      else if (role === "ADMIN") router.push("/admin");
      else router.push("/my-cases");

      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-calm-bg text-calm-text flex items-center justify-center">
      <div className="w-full max-w-sm px-6">
        <h1 className="text-2xl font-serif-warm mb-6">Log In</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-calm-text-muted mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg border border-calm-border bg-calm-surface text-calm-text"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm text-calm-text-muted mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg border border-calm-border bg-calm-surface text-calm-text"
              autoComplete="current-password"
            />
          </div>
          {error && <p className="text-danger-text text-sm">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full p-3 rounded-lg bg-calm-accent text-white font-medium disabled:opacity-60"
          >
            {submitting ? "Logging in..." : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
}