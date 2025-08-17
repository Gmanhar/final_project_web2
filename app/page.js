// app/page.js  (server)
import React, { Suspense } from 'react';
import HomeClient from './components/HomeClient';

export default function Page() {
  return (
    <main style={{ minHeight: '70vh' }}>
      <Suspense fallback={
        <div style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', padding: 24 }}>
          Loading…
        </div>
      }>
        <HomeClient />
      </Suspense>
    </main>
  );
}
