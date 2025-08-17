import { getMovie, posterUrl } from '@/lib/tmdb';
import { notFound } from 'next/navigation';
import WatchlistButton from '@/app/components/WatchlistButton';

export default async function MoviePage({ searchParams }) {
  // Next may provide an async searchParams — await it before using.
  const sp = await searchParams;

  // normalize possible repeated query params (arrays)
  const rawId = Array.isArray(sp?.id) ? sp.id[0] : sp?.id;
  const id = rawId != null ? String(rawId) : null;

  if (!id) return notFound();

  let movie = null;
  try {
    movie = await getMovie(id);
  } catch (err) {
    // server-side logging for debugging
    console.error('getMovie failed for id=', id, err);
    return notFound();
  }

  if (!movie) return notFound();

  // safe accessors / fallbacks
  const poster = movie.poster_path ? posterUrl(movie.poster_path, 'w500') : '/poster-placeholder.png';
  const title = movie.title || 'Untitled';
  const releaseYear = movie.release_date ? movie.release_date.slice(0, 4) : '';
  const formattedDate = movie.release_date
    ? new Date(movie.release_date).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';
  const runtimeText = movie.runtime ? ` · ${movie.runtime} min` : '';
  const genresText = movie.genres?.map((g) => g.name).join(', ') || '—';
  const ratingText = movie.vote_average != null ? `${movie.vote_average.toFixed(1)} / 10` : '—';
  const castText =
    movie.credits?.cast?.slice(0, 6).map((c) => c.name).join(', ') || '—';

  return (
    <article style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}>
      <img
        src={poster}
        alt={`${title} poster`}
        style={{ width: '100%', borderRadius: 8, objectFit: 'cover' }}
      />

      <div>
        {/* Title row: title left, watchlist button at far right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <h1 style={{ margin: 0 }}>
            {title} {releaseYear && `(${releaseYear})`}
          </h1>

          <div style={{ marginLeft: 'auto' }}>
            {/* client component that toggles saved state */}
            <WatchlistButton movie={movie} />
          </div>
        </div>

        <p style={{ opacity: 0.7, margin: '4px 0' }}>
          {formattedDate}
          {runtimeText}
        </p>

        <p style={{ lineHeight: 1.6, margin: '16px 0' }}>
          {movie.overview || 'No synopsis available.'}
        </p>

        <p>
          <strong>Genres:</strong> {genresText}
        </p>

        <p>
          <strong>Rating:</strong> {ratingText}
        </p>

        <p>
          <strong>Cast:</strong> {castText}
        </p>
      </div>
    </article>
  );
}
