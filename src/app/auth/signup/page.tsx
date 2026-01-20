'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] grid-bg p-4">
        <div className="w-full max-w-sm text-center">
          <div className="mb-8">
            <h1 className="font-mono text-sm font-bold tracking-[0.2em] text-[var(--text-primary)]">
              VIBE<span className="text-[var(--accent)]">_</span>PM
            </h1>
          </div>
          <div className="border border-[var(--success)] p-6">
            <div className="w-4 h-4 bg-[var(--success)] mx-auto mb-4" />
            <p className="font-mono text-xs text-[var(--text-primary)] tracking-wider mb-2">
              CHECK YOUR EMAIL
            </p>
            <p className="font-mono text-xs text-[var(--text-muted)]">
              We sent a confirmation link to <span className="text-[var(--text-secondary)]">{email}</span>
            </p>
          </div>
          <div className="mt-6">
            <Link href="/auth/login" className="font-mono text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              BACK TO LOGIN
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] grid-bg p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-mono text-sm font-bold tracking-[0.2em] text-[var(--text-primary)]">
            VIBE<span className="text-[var(--accent)]">_</span>PM
          </h1>
          <p className="font-mono text-xs text-[var(--text-muted)] tracking-wider mt-2">
            CREATE YOUR ACCOUNT
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
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
              placeholder="At least 6 characters"
              required
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] text-[var(--text-secondary)] tracking-wider mb-2">
              CONFIRM PASSWORD
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-brutal w-full"
              placeholder="Confirm your password"
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
            {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="font-mono text-xs text-[var(--text-muted)]">
            ALREADY HAVE AN ACCOUNT?{' '}
            <Link href="/auth/login" className="text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors">
              SIGN IN
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
