'use client';

import { useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] grid-bg p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-mono text-sm font-bold tracking-[0.2em] text-[var(--text-primary)]">
            VIBE<span className="text-[var(--accent)]">_</span>PM
          </h1>
          <p className="font-mono text-xs text-[var(--text-muted)] tracking-wider mt-2">
            SIGN IN TO YOUR ACCOUNT
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block font-mono text-[10px] text-[var(--text-secondary)] tracking-wider mb-2">
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-brutal w-full"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] text-[var(--text-secondary)] tracking-wider mb-2">
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-brutal w-full"
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div className="font-mono text-xs text-[var(--accent)] border border-[var(--accent)] p-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-brutal btn-brutal-accent w-full"
          >
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="font-mono text-xs text-[var(--text-muted)]">
            DON&apos;T HAVE AN ACCOUNT?{' '}
            <Link href="/auth/signup" className="text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors">
              SIGN UP
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
