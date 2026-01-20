'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

export function AuthButton() {
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
