// app/page.js  (server)
import Link from 'next/link';

const GENRE_CATS = [
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

const containerStyle = {
  minHeight: '70vh',
  display: 'grid',
  placeItems: 'center',
  textAlign: 'center',
  padding: 24,
};

const innerStyle = { maxWidth: 680, width: '100%' };

const inputStyle = {
  padding: '12px 14px',
  borderRadius: 8,
  border: '1px solid #333',
  background: '#151515',
  color: '#eee',
  outline: 'none',
};

export default function Home() {
  return (
    <section style={containerStyle}>
      <div style={innerStyle}>
        <h1 style={{ marginBottom: 16, fontSize: 32 }}>Find your next movie</h1>

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
          {/* accessible, visually-hidden label */}
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
            style={inputStyle}
          />

          {/* unified button style: use the .btn class from globals.css */}
          <button type="submit" className="btn" aria-label="Search">
            Search
          </button>
        </form>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
          {GENRE_CATS.map((g) => (
            // Use header-control so the chips visually match header controls/back button
            <Link
              key={g.id}
              href={`/search?genre=${g.id}`}
              className="header-control"
              aria-label={`Browse ${g.label} movies`}
              title={g.label}
              style={{ textDecoration: 'none' }}
            >
              {g.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
