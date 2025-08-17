'use client';
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function BackButton({ className = '', style = {} }) {
  const router = useRouter();
  const pathname = usePathname();

  // hide on the homepage (no back needed)
  if (!pathname || pathname === '/') return null;

  function handleClick() {
    try {
      // Prefer browser history if available
      if (typeof window !== 'undefined' && window.history.length > 1) {
        router.back();
        return;
      }

      // Fallback: use document.referrer if it points to our app, otherwise go home
      try {
        const ref = typeof document !== 'undefined' ? document.referrer : '';
        const sameOrigin = ref && new URL(ref).origin === window.location.origin;
        if (sameOrigin) {
          window.location.href = ref;
          return;
        }
      } catch (e) {
      }

      router.push('/');
    } catch (err) {
      console.error('Back navigation failed', err);
      try {
        router.push('/');
      } catch (e) {
      }
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Go back"
      title="Go back"
      className={`header-control ${className}`}
      style={{ ...style }}
    >
      ← Back
    </button>
  );
}
