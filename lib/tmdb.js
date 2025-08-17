// lib/tmdb.js

const API = 'https://api.themoviedb.org/3';

/** Core fetcher using v3 API key as query param */
async function tmdb(path, params = {}) {
  if (!process.env.TMDB_API_KEY) {
    throw new Error('Missing TMDB_API_KEY');
  }
  const url = new URL(`${API}${path}`);
  url.searchParams.set('api_key', process.env.TMDB_API_KEY);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) {
      url.searchParams.set(k, String(v));
    }
  });
  const res = await fetch(url.toString(), { cache: 'no-store' });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`TMDB ${res.status}: ${body}`);
  }
  return res.json();
}

/** Build poster URL or placeholder */
const IMG_BASE = process.env.NEXT_PUBLIC_TMDB_IMG_BASE || 'https://image.tmdb.org/t/p';
export function posterUrl(path, size = 'w342') {
  return path
    ? `${IMG_BASE}/${size}${path}`
    : 'https://via.placeholder.com/342x513?text=No+Image';
}

/** Shuffle helper */
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Keyword search: fetch 3 pages (max 60 items), dedupe, sort by popularity, return 50.
 */
export async function searchMovies50(query, appPage = 1) {
  if (!query?.trim()) {
    return { results: [], appPage: 1, appTotalPages: 1, totalResults: 0 };
  }

  // totals
  const totals = await tmdb('/search/movie', { query, page: 1, include_adult: 'false' });
  const totalResults = totals.total_results ?? 0;
  const tmdbTotalPages = Math.min(totals.total_pages ?? 1, 500);
  const appTotalPages = Math.max(1, Math.ceil(totalResults / 50));

  // pages to fetch
  const start = (appPage - 1) * 3 + 1;
  if (start > tmdbTotalPages) {
    return { results: [], appPage, appTotalPages, totalResults };
  }
  const pages = [start, start + 1, start + 2].filter(p => p <= tmdbTotalPages);

  // fetch
  const chunks = await Promise.all(
    pages.map(p => tmdb('/search/movie', { query, page: p, include_adult: 'false' }))
  );

  // combine/dedupe/sort
  const combined = chunks.flatMap(c => c.results ?? []);
  const uniq = Array.from(new Map(combined.map(m => [m.id, m])).values());
  uniq.sort((a, b) => {
    const pd = (b.popularity ?? 0) - (a.popularity ?? 0);
    return pd !== 0 ? pd : (b.vote_count ?? 0) - (a.vote_count ?? 0);
  });

  return {
    results: uniq.slice(0, 50),
    appPage,
    appTotalPages,
    totalResults,
  };
}

/**
 * Random genre: fetch 4 random pages, shuffle, return up to count.
 */
export async function discoverGenreRandom50(genreId, count = 50) {
  const gid = Number(genreId);
  if (!Number.isFinite(gid) || gid <= 0) return [];

  // totals
  const totals = await tmdb('/discover/movie', {
    with_genres: String(gid),
    sort_by: 'popularity.desc',
    include_adult: 'false',
    page: 1,
  });
  const totalPages = Math.min(totals.total_pages ?? 1, 500);
  if (totalPages < 1) return [];

  // pick pages
  const pages = new Set();
  while (pages.size < Math.min(4, totalPages)) {
    pages.add(1 + Math.floor(Math.random() * totalPages));
  }

  // fetch those pages
  const chunks = await Promise.all(
    [...pages].map(p =>
      tmdb('/discover/movie', {
        with_genres: String(gid),
        sort_by: 'popularity.desc',
        include_adult: 'false',
        page: p,
      })
    )
  );

  // combine/dedupe/shuffle
  const combined = chunks.flatMap(c => c.results ?? []);
  const uniq = Array.from(new Map(combined.map(m => [m.id, m])).values());
  return shuffle(uniq).slice(0, count);
}

/**
 * Fetch full movie details + credits (for your detail page).
 */
export async function getMovie(id) {
  return tmdb(`/movie/${id}`, { append_to_response: 'credits' });
}
