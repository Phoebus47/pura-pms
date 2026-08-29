'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { authAPI } from '@/lib/api';
import { setAuthToken } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/use-auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatMessage, t } from '@/lib/i18n';

const DEMO_EMAIL = 'admin@pura.com';
const DEMO_PASSWORD = 'admin123';

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
      setError(err instanceof Error ? err.message : t('login.failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-linear-to-br flex from-pura-blue items-center justify-center min-h-screen p-4 to-pura-blue-dark">
      <div className="max-w-md w-full">
        <div className="mb-8 text-center">
          <h1 className="font-bold mb-2 text-4xl text-ink-onbrand">PURA PMS</h1>
          <p className="text-ink-onbrand/80">{t('login.subtitle')}</p>
        </div>

        <div className="bg-surface-desk border border-rule-mist p-8 rounded-xl shadow-overlay">
          <h2 className="font-bold mb-6 text-2xl text-action-primary">
            {t('login.title')}
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email" className="block font-semibold mb-2">
                {t('common.email')}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={DEMO_EMAIL}
                required
                className="h-12 px-4 py-3"
              />
            </div>

            <div>
              <Label htmlFor="password" className="block font-semibold mb-2">
                {t('login.password')}
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 px-4 py-3"
              />
            </div>

            {error && (
              <div className="bg-status-critical-tint border border-status-critical-line p-3 rounded-lg">
                <p className="text-sm text-status-critical-ink">{error}</p>
              </div>
            )}

            <Button type="submit" disabled={loading} className="py-3 w-full">
              {loading ? t('login.submitting') : t('login.submit')}
            </Button>
          </form>

          <div className="bg-surface-inset mt-6 p-4 rounded-lg">
            <p className="font-semibold mb-2 text-ink-subtle text-xs">
              {t('login.demoTitle')}
            </p>
            <p className="text-ink-subtle text-xs">
              {formatMessage('login.demoEmail', { email: DEMO_EMAIL })}
            </p>
            <p className="text-ink-subtle text-xs">
              {formatMessage('login.demoPassword', { password: DEMO_PASSWORD })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
