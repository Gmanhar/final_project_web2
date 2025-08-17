'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegenerateReloadButton({ className = '', style = {} }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function handleClick() {
    if (busy) return;
    setBusy(true);
    try {
      // Preferred: re-run server data for current route (App Router)
      router.refresh();

      // Keep busy state briefly so screen readers and sighted users notice the action.
      setTimeout(() => setBusy(false), 600);
    } catch (err) {
      console.error('Refresh failed, falling back to full reload', err);
      try {
        window.location.reload();
      } finally {
        setBusy(false);
      }
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-label="Regenerate results"
        title="Regenerate results"
        disabled={busy}
        aria-disabled={busy}
        className={`header-control ${className}`}
        style={{ ...style }}
      >
        {busy ? 'Loading…' : '↻ Regenerate'}
      </button>

      {/* SR-only live region to announce busy state changes to screen readers */}
      <span aria-live="polite" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(1px, 1px, 1px, 1px)' }}>
        {busy ? 'Refreshing results' : ''}
      </span>
    </>
  );
}
