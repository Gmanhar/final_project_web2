// app/layout.js
import './globals.css';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'MovieKnight',
  description: 'Discover random movies by genre',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ colorScheme: 'dark', color: '#eaeaea' }}>
        {/* Fixed overlay: sits above the background image but behind header/main */}
        <div id="bg-overlay" />

        <header
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            padding: '12px 16px',
            borderBottom: '1px solid #222',
            position: 'sticky',
            top: 0,
            background: 'rgba(0,0,0,0.28)', // subtle translucent header
            zIndex: 1000, // must be above the overlay
          }}
        >
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
            <Image
              src="/knight.png"
              alt="MovieKnight logo - knight"
              width={40}
              height={40}
              priority
              style={{ borderRadius: 6, marginRight: 10 }}
            />
            <span style={{ fontWeight: 700, color: '#fff', fontSize: 18 }}>Movie Knight</span>
          </Link>
        </header>

        <main style={{ maxWidth: 1100, margin: '0 auto', padding: 16 }}>
          {children}
        </main>

        <script src="/regen.js" defer></script>
      </body>
    </html>
  );
}
