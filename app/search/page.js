// app/search/page.js
import Link from 'next/link';
import { searchMovies50, discoverGenreRandom50, posterUrl } from '@/lib/tmdb';

// Map TMDB genre IDs to human labels
const GENRE_LABELS = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

function toInt(v, def = 1) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : def;
}

export default async function SearchPage({ searchParams }) {
  const q      = (searchParams?.q      || '').trim();
  const genre  = (searchParams?.genre  || '').trim();
  const page   = toInt(searchParams?.page, 1);

  // No query or genre
  if (!q && !genre) {
    return (
      <>
        <h1 style={{ marginBottom: 12 }}>Results</h1>
        <p>Type a title in the search bar or choose a genre.</p>
      </>
    );
  }

  let title      = 'Results';
  let movies     = [];
  let totalPages = 1;

  if (genre) {
    // Random 50 picks for genre
    movies = await discoverGenreRandom50(genre, 50);
    const label = GENRE_LABELS[genre] || `Genre ${genre}`;
    title = `Random ${label} Movies`;
  } else {
    // Paginated keyword search
    const { results, appTotalPages } = await searchMovies50(q, page);
    movies     = results;
    totalPages = appTotalPages;
    title      = `Search: “${q}”`;
  }

  return (
    <>
      <h1 style={{ marginBottom: 12 }}>{title}</h1>

      {movies.length === 0 ? (
        <p>No results.</p>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))',
              gap: 16,
              marginBottom: 16,
            }}
          >
            {movies.map((m) => (
              <Link
                key={m.id}
                href={`/movie?id=${m.id}`}
                style={{
                  border: '1px solid #333',
                  borderRadius: 8,
                  overflow: 'hidden',
                  textDecoration: 'none',
                  color: 'inherit',
                  background: '#151515',
                }}
              >
                <img
                  src={posterUrl(m.poster_path)}
                  alt={`${m.title} poster`}
                  style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover' }}
                />
                <div style={{ padding: 10 }}>
                  <h3 style={{ margin: '0 0 4px' }}>{m.title}</h3>
                  <p style={{ opacity: 0.7, margin: 0 }}>
                    {(m.release_date || '').slice(0, 4) || '—'}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination only for keyword searches */}
          {q && totalPages > 1 && (
            <Pagination q={q} page={page} totalPages={totalPages} />
          )}
        </>
      )}
    </>
  );
}

function Pagination({ q, page, totalPages }) {
  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;
  const span = 2;
  const start = Math.max(1, page - span);
  const end   = Math.min(totalPages, page + span);
  const pages = [];
  for (let p = start; p <= end; p++) pages.push(p);

  const linkStyle = {
    padding: '8px 12px',
    border: '1px solid #333',
    borderRadius: 6,
    textDecoration: 'none',
    color: 'inherit',
    background: '#151515',
  };
  const activeStyle = { ...linkStyle, background: '#222', fontWeight: 700 };

  return (
    <nav style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
      {prev ? (
        <Link href={`/search?q=${encodeURIComponent(q)}&page=${prev}`} style={linkStyle}>
          ‹ Prev
        </Link>
      ) : (
        <span style={{ opacity: 0.4, ...linkStyle }}>‹ Prev</span>
      )}

      {start > 1 && (
        <>
          <Link href={`/search?q=${encodeURIComponent(q)}&page=1`} style={linkStyle}>
            1
          </Link>
          {start > 2 && <span style={{ padding: '0 4px', opacity: 0.6 }}>…</span>}
        </>
      )}

      {pages.map((p) =>
        p === page ? (
          <span key={p} style={activeStyle}>
            {p}
          </span>
        ) : (
          <Link
            key={p}
            href={`/search?q=${encodeURIComponent(q)}&page=${p}`}
            style={linkStyle}
          >
            {p}
          </Link>
        )
      )}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span style={{ padding: '0 4px', opacity: 0.6 }}>…</span>}
          <Link href={`/search?q=${encodeURIComponent(q)}&page=${totalPages}`} style={linkStyle}>
            {totalPages}
          </Link>
        </>
      )}

      {next ? (
        <Link href={`/search?q=${encodeURIComponent(q)}&page=${next}`} style={linkStyle}>
          Next ›
        </Link>
      ) : (
        <span style={{ opacity: 0.4, ...linkStyle }}>Next ›</span>
      )}
    </nav>
  );
}
