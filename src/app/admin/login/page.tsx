'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Already logged in — start countdown
  useEffect(() => {
    if (status === 'authenticated') {
      setCountdown(3);
    }
  }, [status]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      router.push('/admin/dashboard');
      return;
    }
    const t = setTimeout(() => setCountdown((c) => (c ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('Invalid username or password');
    } else {
      router.push('/admin/dashboard');
    }
  }

  // Loading session
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-xs text-neutral-300 tracking-widest lowercase">loading...</p>
      </div>
    );
  }

  // Already logged in — show countdown
  if (status === 'authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-xs tracking-widest lowercase text-neutral-600">
            you&apos;re already logged in, taking you to your dashboard in
          </p>
          <p className="text-4xl font-light mt-6 text-neutral-800 tabular-nums">
            {countdown}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-sm">
        <h1 className="text-xs mb-8 text-center tracking-widest lowercase text-neutral-800">
          admin
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border border-neutral-200 px-4 py-3 text-xs outline-none focus:border-neutral-800 transition-colors lowercase tracking-wider"
            required
          />
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-neutral-200 px-4 py-3 text-xs outline-none focus:border-neutral-800 transition-colors"
            required
          />
          {error && <p className="text-red-400 text-xs lowercase tracking-wider">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="border border-neutral-800 px-4 py-3 text-xs lowercase tracking-widest hover:bg-neutral-800 hover:text-white transition-colors disabled:opacity-50"
          >
            {loading ? 'signing in...' : 'sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
