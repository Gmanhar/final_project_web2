import Link from 'next/link';

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
        <h1 style={{ marginBottom: 16, fontSize: 32 }}>Find your next movie</h1>

        <form
          action="/search"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 8,
            margin: '0 auto 18px',
          }}
        >
          <input
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
          <button type="submit" style={{ padding: '12px 16px', borderRadius: 8 }}>
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
              style={{
                padding: '10px 14px',
                borderRadius: 999,
                border: '1px solid #333',
                background: '#151515',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              {g.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
