'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { setAuthToken } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/use-auth-store';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login({ email, password });

      setAuthToken(response.access_token);
      setAuth(response.access_token, {
        id: response.user.id,
        email: response.user.email,
        name: `${response.user.firstName} ${response.user.lastName}`,
        role: response.user.role,
      });
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-linear-to-br flex from-[#1e4b8e] items-center justify-center min-h-screen p-4 to-[#2d5aa0]">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="font-bold mb-2 text-4xl text-white">PURA PMS</h1>
          <p className="text-white/80">Property Management System</p>
        </div>

        {/* Login Card */}
        <div className="backdrop-blur-xl bg-white/95 p-8 rounded-3xl shadow-2xl">
          <h2 className="font-bold mb-6 text-[#1e4b8e] text-2xl">Sign In</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block font-semibold mb-2 text-slate-700 text-sm"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@pura.com"
                required
                className="border border-slate-300 focus:border-[#1e4b8e] focus:ring-[#1e4b8e]/10 focus:ring-4 outline-none px-4 py-3 rounded-xl transition-all w-full"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block font-semibold mb-2 text-slate-700 text-sm"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="border border-slate-300 focus:border-[#1e4b8e] focus:ring-[#1e4b8e]/10 focus:ring-4 outline-none px-4 py-3 rounded-xl transition-all w-full"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-xl">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#1e4b8e] font-semibold hover:bg-[#153a6e] py-3 rounded-xl text-white transition-all w-full"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="bg-slate-50 mt-6 p-4 rounded-xl">
            <p className="font-semibold mb-2 text-slate-600 text-xs">
              Demo Credentials:
            </p>
            <p className="text-slate-500 text-xs">
              Email: <span className="font-mono">admin@pura.com</span>
            </p>
            <p className="text-slate-500 text-xs">
              Password: <span className="font-mono">admin123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
