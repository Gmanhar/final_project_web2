
'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AuthForm from '@/app/components/AuthForm';
import { useAuth } from '@/app/components/AuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';

const genreCats = [
  { id: 28, label: 'Action' },
  { id: 12, label: 'Adventure' },
  { id: 16, label: 'Animation' },
  { id: 35, label: 'Comedy' },
  { id: 80, label: 'Crime' },
  { id: 99, label: 'Documentary' },
  { id: 18, label: 'Drama' },
  { id: 10751, label: 'Family' },
  { id: 14, label: 'Fantasy' },
  { id: 36, label: 'History' },
  { id: 27, label: 'Horror' },
  { id: 10402, label: 'Music' },
  { id: 9648, label: 'Mystery' },
  { id: 10749, label: 'Romance' },
  { id: 878, label: 'Sci-Fi' },
  { id: 10770, label: 'TV Movie' },
  { id: 53, label: 'Thriller' },
  { id: 10752, label: 'War' },
  { id: 37, label: 'Western' },
];

export default function Home() {
  const { user, loading } = useAuth();
  const [showAuthForm, setShowAuthForm] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Open modal when ?auth=1 is in the URL
  useEffect(() => {
    if (searchParams?.get('auth') === '1') {
      setShowAuthForm(true);
    }
  }, [searchParams]);

  // Close modal and remove ?auth param without adding history entry
  function closeAuthModal() {
    setShowAuthForm(false);
    try {
      router.replace('/'); // clears the query param
    } catch {
      const url = new URL(window.location.href);
      url.searchParams.delete('auth');
      window.history.replaceState({}, '', url.toString());
    }
  }

  // Called by AuthForm on success
  function onAuthSuccess() {
    closeAuthModal();
    try { router.refresh(); } catch (e) {}
  }

  return (
    <section
      style={{
        minHeight: '70vh',
        display: 'grid',
        placeItems: 'center',
        textAlign: 'center',
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 680, width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
          <h1 style={{ margin: 0, fontSize: 32 }}>Find your next movie</h1>

          {/* Auth area (header handles Sign in/Sign out now) */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {loading ? (
              <div style={{ opacity: 0.8 }}>Checking…</div>
            ) : user ? (
              <span style={{ fontSize: 14, color: '#ddd' }}>{user.email ?? user.displayName ?? 'Signed in'}</span>
            ) : (
              null
            )}
          </div>
        </div>

        <form
          action="/search"
          method="get"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 8,
            margin: '0 auto 18px',
          }}
        >
          {/* visually-hidden accessible label */}
          <label
            htmlFor="q"
            style={{
              position: 'absolute',
              left: '-10000px',
              top: 'auto',
              width: '1px',
              height: '1px',
              overflow: 'hidden',
            }}
          >
            Search movies
          </label>

          <input
            id="q"
            name="q"
            placeholder="Search movies…"
            aria-label="Search movies"
            style={{
              padding: '12px 14px',
              borderRadius: 8,
              border: '1px solid #333',
              background: '#151515',
              color: '#eee',
            }}
          />
          <button type="submit" className="btn">
            Search
          </button>
        </form>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            justifyContent: 'center',
          }}
        >
          {genreCats.map((g) => (
            <Link
              key={g.id}
              href={`/search?genre=${g.id}`}
              className="header-control chip"
              aria-label={`Browse ${g.label} movies`}
              title={g.label}
            >
              {g.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Inline AuthForm modal */}
      {showAuthForm && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            background: 'rgba(0,0,0,0.6)',
            zIndex: 2000,
          }}
          onClick={() => closeAuthModal()}
        >
          <div style={{ width: 360 }} onClick={(e) => e.stopPropagation()}>
            <AuthForm onSuccess={onAuthSuccess} />
            <div style={{ textAlign: 'right', marginTop: 8 }}>
              <button type="button" onClick={() => closeAuthModal()} className="btn">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
