// app/layout.js


export const metadata = { title: 'MovieFinder', description: 'Search movies' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ colorScheme: 'dark', background: '#111', color: '#eee' }}>
        <header style={{display:'flex',gap:12,alignItems:'center',padding:'12px 16px',borderBottom:'1px solid #333',position:'sticky',top:0}}>
          <a href="/" style={{fontWeight:700, textDecoration:'none', color:'#fff'}}> Movie Knight</a>
          <form action="/search" style={{display:'inline-flex', gap:8, marginLeft:16}}>


          </form>
        </header>
        <main style={{maxWidth:1100, margin:'0 auto', padding:16}}>{children}</main>
      </body>
    </html>
    
  );
}