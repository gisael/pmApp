'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

interface AuthButtonProps {
  variant?: 'default' | 'menu';
  onAction?: () => void;
}

export function AuthButton({ variant = 'default', onAction }: AuthButtonProps = {}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: unknown, session: { user: User | null } | null) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-[var(--text-muted)] animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSignOutAndClose = async () => {
    onAction?.();
    await handleSignOut();
  };

  if (variant === 'menu') {
    return (
      <button
        onClick={handleSignOutAndClose}
        className="w-full flex items-center gap-3 px-4 py-3 font-mono text-xs tracking-wider text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--error,#ef4444)] transition-colors text-left"
      >
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        SIGN OUT
      </button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <span className="font-mono text-xs text-[var(--text-muted)] truncate max-w-[150px]">
        {user.email}
      </span>
      <button
        onClick={handleSignOut}
        className="btn-brutal text-[10px] py-1 px-3"
      >
        SIGN OUT
      </button>
    </div>
  );
}
