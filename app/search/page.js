import Link from 'next/link';
import RegenerateReloadButton from '@/app/components/RegenerateReloadButton';
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
  
  const sp = await searchParams;

  // normalize potential repeated query params (arrays)
  const rawQ = sp?.q;
  const rawGenre = sp?.genre;
  const rawPage = sp?.page;

  const q = (Array.isArray(rawQ) ? rawQ[0] : rawQ || '').trim();
  const genreRaw = (Array.isArray(rawGenre) ? rawGenre[0] : rawGenre || '').trim();
  const page = toInt(Array.isArray(rawPage) ? rawPage[0] : rawPage, 1);

  if (!q && !genreRaw) {
    return (
      <>
        <h1 style={{ marginBottom: 12 }}>Results</h1>
        <p>Type a title in the search bar or choose a genre.</p>
      </>
    );
  }

  let title = 'Results';
  let movies = [];
  let totalPages = 1;

  if (genreRaw) {
      const genreId = Number.isFinite(Number(genreRaw)) ? Number(genreRaw) : genreRaw;
    // random 50 picks for genre (no pagination)
    movies = await discoverGenreRandom50(genreId, 50);
    const label = GENRE_LABELS[genreRaw] || `Genre ${genreRaw}`;
    title = `Random ${label} Movies`;
  } else {
    // paginated keyword search
    const { results, appTotalPages } = await searchMovies50(q, page);
    movies = results || [];
    totalPages = appTotalPages || 1;
    title = `Search: “${q}”`;
  }

  return (
    <>
      {/* Title + optional regenerate when viewing a genre */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <h1 style={{ margin: 0 }}>{title}</h1>

        {genreRaw && (
          <div style={{ marginLeft: 'auto' }}>
            <RegenerateReloadButton
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.03)',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            />
          </div>
        )}
      </div>

      {movies.length === 0 ? (
        <p>No results.</p>
      ) : (
        <>
          <div className="movie-grid">
            {movies.map((m) => {
              const imgSrc = m.poster_path ? posterUrl(m.poster_path) : '/poster-placeholder.png';
              const altText = m.title ? `${m.title} poster` : 'Movie poster';

              return (
                <Link
                  key={m.id}
                  href={`/movie?id=${m.id}`}
                  className="movie-card"
                  aria-label={`Open details for ${m.title}`}
                >
                  <img
                    className="movie-card-image"
                    src={imgSrc}
                    alt={altText}
                    loading="lazy"
                  />
                  <div className="movie-card-content">
                    <h3 className="movie-card-title">{m.title}</h3>
                    <p className="movie-card-year">
                      {(m.release_date || '').slice(0, 4) || '—'}
                    </p>
                  </div>
                </Link>
              );
            })}
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
  const end = Math.min(totalPages, page + span);
  const pages = [];
  for (let p = start; p <= end; p++) pages.push(p);

  const base = (p) => `/search?q=${encodeURIComponent(q)}&page=${p}`;

  const linkStyle = {
    padding: '8px 12px',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 6,
    textDecoration: 'none',
    color: 'inherit',
    background: 'rgba(10,10,10,0.30)',
  };
  const activeStyle = { ...linkStyle, background: 'rgba(15,15,15,0.6)', fontWeight: 700 };

  return (
    <nav style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
      {prev ? (
        <Link href={base(prev)} style={linkStyle}>‹ Prev</Link>
      ) : (
        <span style={{ opacity: 0.4, ...linkStyle }}>‹ Prev</span>
      )}

      {start > 1 && (
        <>
          <Link href={base(1)} style={linkStyle}>1</Link>
          {start > 2 && <span style={{ padding: '0 4px', opacity: 0.6 }}>…</span>}
        </>
      )}

      {pages.map((p) =>
        p === page ? (
          <span key={p} style={activeStyle}>{p}</span>
        ) : (
          <Link key={p} href={base(p)} style={linkStyle}>{p}</Link>
        )
      )}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span style={{ padding: '0 4px', opacity: 0.6 }}>…</span>}
          <Link href={base(totalPages)} style={linkStyle}>{totalPages}</Link>
        </>
      )}

      {next ? (
        <Link href={base(next)} style={linkStyle}>Next ›</Link>
      ) : (
        <span style={{ opacity: 0.4, ...linkStyle }}>Next ›</span>
      )}
    </nav>
  );
}
