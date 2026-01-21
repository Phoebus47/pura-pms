"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.login({ email, password });

      // Store token in localStorage
      localStorage.setItem("token", response.access_token);

      // Redirect to dashboard
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#1e4b8e] to-[#2d5aa0] p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">PURA PMS</h1>
          <p className="text-white/80">Property Management System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-[#1e4b8e] mb-6">Sign In</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@pura.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#1e4b8e] focus:ring-4 focus:ring-[#1e4b8e]/10 outline-none transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#1e4b8e] focus:ring-4 focus:ring-[#1e4b8e]/10 outline-none transition-all"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1e4b8e] hover:bg-[#153a6e] text-white py-3 rounded-xl font-semibold transition-all"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-slate-50 rounded-xl">
            <p className="text-xs font-semibold text-slate-600 mb-2">
              Demo Credentials:
            </p>
            <p className="text-xs text-slate-500">
              Email: <span className="font-mono">admin@pura.com</span>
            </p>
            <p className="text-xs text-slate-500">
              Password: <span className="font-mono">admin123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
