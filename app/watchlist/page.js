'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/components/AuthProvider';
import { watchWatchlist } from '@/lib/watchlist';
import Link from 'next/link';
import { posterUrl } from '@/lib/tmdb';

function getTimestampMillis(val) {
  // Accept a few shapes: Firestore Timestamp, number (ms), or Date
  if (!val) return 0;
  if (typeof val === 'number') return val;
  if (val?.toMillis && typeof val.toMillis === 'function') return val.toMillis();
  if (val?.seconds) return val.seconds * 1000;
  if (val instanceof Date) return val.getTime();
  return 0;
}

export default function WatchlistPage() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  useEffect(() => {
    // Wait until auth has resolved
    if (loading) return;

    // If not signed in, clear items and don't subscribe
    if (!user?.uid) {
      setItems([]);
      setListLoading(false);
      return;
    }

    let unsub;
    let mounted = true;
    setListLoading(true);

    try {
      unsub = watchWatchlist(user.uid, (docs = []) => {
        if (!mounted) return;
        // sort by addedAt if available (newest first)
        const sorted = Array.isArray(docs)
          ? [...docs].sort((a, b) => getTimestampMillis(b.addedAt) - getTimestampMillis(a.addedAt))
          : [];
        setItems(sorted);
        setListLoading(false);
      });

      // If watchWatchlist didn't return an unsubscribe function, ensure we stop spinner
      if (typeof unsub !== 'function') {
        // we still set loading false — the callback above should also do it when data arrives
        setListLoading(false);
        unsub = null;
      }
    } catch (err) {
      console.error('Failed to subscribe to watchlist:', err);
      if (mounted) {
        setItems([]);
        setListLoading(false);
      }
    }

    return () => {
      mounted = false;
      try {
        unsub && typeof unsub === 'function' && unsub();
      } catch (e) {
        /* ignore unsubscribe errors */
      }
      setListLoading(false);
    };
  }, [user?.uid, loading]);

  if (loading) return <div>Checking auth…</div>;
  if (!user) {
    return (
      <section>
        <h1>Your Watchlist</h1>
        <p>Please <Link href="/?auth=1">sign in</Link> to view and save movies to your watchlist.</p>
      </section>
    );
  }

  return (
    <section>
      <h1>Your Watchlist</h1>

      {listLoading && <p>Loading your saved movies…</p>}

      {!listLoading && items.length === 0 ? (
        <p>No saved movies yet. Add some from a movie page!</p>
      ) : (
        <div className="movie-grid">
          {items.map((m) => {
            const posterPath = m.poster ?? m.poster_path ?? null;
            const title = m.title ?? m.name ?? 'Untitled';
            const year = (m.release_date || m.first_air_date || '').slice(0, 4) || '—';
            const imgSrc = posterPath ? posterUrl(posterPath) : '/placeholder-poster.png';

            return (
              <Link key={m.id} href={`/movie?id=${m.id}`} className="movie-card" aria-label={`Open ${title}`}>
                <img
                  className="movie-card-image"
                  src={imgSrc}
                  alt={`${title} poster`}
                  loading="lazy"
                />
                <div className="movie-card-content">
                  <h3 className="movie-card-title">{title}</h3>
                  <p className="movie-card-year">{year}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
