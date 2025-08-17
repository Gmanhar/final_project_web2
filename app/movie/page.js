// app/movie/page.js
import { getMovie, posterUrl } from '@/lib/tmdb';
import { notFound } from 'next/navigation';

export default async function MoviePage({ searchParams }) {
  const id = searchParams?.id;
  if (!id) return notFound();

  let movie;
  try {
    movie = await getMovie(id);
  } catch {
    return notFound();
  }

  return (
    <article style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}>
      <img
        src={posterUrl(movie.poster_path, 'w500')}
        alt={`${movie.title} poster`}
        style={{ width: '100%', borderRadius: 8 }}
      />

      <div>
        <h1 style={{ margin: '0 0 8px' }}>
          {movie.title}{' '}
          {movie.release_date && `(${movie.release_date.slice(0, 4)})`}
        </h1>
        <p style={{ opacity: 0.7, margin: '4px 0' }}>
          {movie.release_date
            ? new Date(movie.release_date).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : ''}
          {movie.runtime ? ` · ${movie.runtime} min` : ''}
        </p>

        <p style={{ lineHeight: 1.6, margin: '16px 0' }}>
          {movie.overview || 'No synopsis available.'}
        </p>

        <p>
          <strong>Genres:</strong>{' '}
          {movie.genres?.map((g) => g.name).join(', ') || '—'}
        </p>

        <p>
          <strong>Rating:</strong>{' '}
          {movie.vote_average != null
            ? `${movie.vote_average.toFixed(1)} / 10`
            : '—'}
        </p>

        <p>
          <strong>Cast:</strong>{' '}
          {movie.credits?.cast
            ?.slice(0, 6)
            .map((c) => c.name)
            .join(', ') || '—'}
        </p>
      </div>
    </article>
  );
}
