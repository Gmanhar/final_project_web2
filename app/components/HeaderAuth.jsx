'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { signOut as fbSignOut } from '@/lib/firebaseAuth';

export default function HeaderAuth() {
  const { user, loading, signOut: ctxSignOut } = useAuth();
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function handleSignOut() {
    setBusy(true);
    try {
      // prefer signOut from AuthProvider context if present
      if (typeof ctxSignOut === 'function') {
        await ctxSignOut();
      } else if (typeof fbSignOut === 'function') {
        await fbSignOut();
      } else {
        throw new Error('Sign-out helper not available');
      }

      // Refresh server components and navigate home
      try { router.refresh(); } catch (e) { /* ignore */ }
      try { router.push('/'); } catch (e) { /* ignore */ }
    } catch (err) {
      console.error('Sign out failed', err);
      // user-facing fallback
      try {
        alert(err?.message || 'Sign out failed — check console for details.');
      } catch {}
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <div style={{ color: '#ddd', fontSize: 14 }}>Checking…</div>;
  }

  if (!user) {
    return (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => router.push('/?auth=1')}
          className="header-control"
          title="Sign in"
        >
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <span style={{ fontSize: 14, color: '#ddd' }} aria-live="polite">
        {user.email ?? user.displayName ?? 'Signed in'}
      </span>

      <button
        type="button"
        onClick={handleSignOut}
        disabled={busy}
        aria-disabled={busy}
        className="header-control"
        title="Sign out"
      >
        {busy ? 'Signing out…' : 'Sign out'}
      </button>
    </div>
  );
}
