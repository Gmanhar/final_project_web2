'use client';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { addToWatchlist, removeFromWatchlist } from '@/lib/watchlist';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';

export default function WatchlistButton({ movie, redirectOnAdd = false, className = 'header-control' }) {
  const { user, loading } = useAuth();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user || !movie?.id) {
      setSaved(false);
      return;
    }

    const ref = doc(db, 'users', user.uid, 'watchlist', String(movie.id));
    const unsub = onSnapshot(
      ref,
      (snap) => setSaved(!!snap.exists()),
      (err) => {
        console.error('watchlist onSnapshot error', err);
        setSaved(false);
      }
    );

    return () => {
      try { unsub && unsub(); } catch (e) {}
    };
  }, [user?.uid, movie?.id, loading]);

  async function toggle() {
    if (!user) {
      // Open auth modal via URL param (consistent with header flow)
      try {
        router.push('/?auth=1');
      } catch {
        alert('Please sign in to save movies to your watchlist.');
      }
      return;
    }

    if (!movie?.id) {
      console.warn('WatchlistButton: missing movie.id', movie);
      return;
    }

    setBusy(true);
    try {
      if (saved) {
        await removeFromWatchlist(user.uid, movie.id);
      } else {
        await addToWatchlist(user.uid, movie);
        if (redirectOnAdd) {
          router.push('/watchlist');
        }
      }
    } catch (err) {
      console.error('Failed to update watchlist', err);
      alert(err?.message || 'Failed to update watchlist');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={saved}
      aria-disabled={busy}
      title={saved ? 'Remove from watchlist' : 'Add to watchlist'}
      className={className}
    >
      {busy ? 'Working…' : saved ? 'Saved' : 'Add to Watchlist'}
    </button>
  );
}

WatchlistButton.propTypes = {
  movie: PropTypes.object.isRequired,
  redirectOnAdd: PropTypes.bool,
  className: PropTypes.string,
};
