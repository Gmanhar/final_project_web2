import "./globals.css";
import Image from "next/image";
import Link from "next/link";
import { AuthProvider } from "@/app/components/AuthProvider";
import HeaderAuth from "@/app/components/HeaderAuth";
import BackButton from "@/app/components/BackButton";

export const metadata = {
  title: "MovieKnight",
  description: "Discover random movies by genre",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ colorScheme: "dark", color: "#eaeaea" }}>
        {/* Fixed overlay: sits above the background image but behind header/main */}
        <div id="bg-overlay" />

        {/* AuthProvider wraps header + main so header client components have access to auth */}
        <AuthProvider>
          <header
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              borderBottom: "1px solid #222",
              position: "sticky",
              top: 0,
              left: 0,
              right: 0,
              background: "rgba(0,0,0,0.28)",
              zIndex: 1000,
              backdropFilter: "blur(4px)",
            }}
          >
            {/* Left: logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Link
                href="/"
                style={{
                  display: "flex",
                  alignItems: "center",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <Image
                  src="/knight.png"
                  alt="MovieKnight logo - knight"
                  width={40}
                  height={40}
                  priority
                  style={{ borderRadius: 6, marginRight: 10 }}
                />
                <span style={{ fontWeight: 700, color: "#fff", fontSize: 18 }}>
                  Movie Knight
                </span>
              </Link>
            </div>

            {/* Right: navigation - pushed to the far right */}
            <nav
              style={{
                marginLeft: "auto",
                display: "flex",
                gap: 12,
                alignItems: "center",
              }}
            >
              <Link
                href="/watchlist"
                className="header-control"
                style={{ fontSize: 14, textDecoration: "none" }}
                title="Your watchlist"
              >
                Watchlist
              </Link>

              {/* HeaderAuth shows signed-in user + Sign out (or Sign in) */}
              <HeaderAuth />
            </nav>
          </header>

          {/* Main content area */}
          <main style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
            {/* Back button sits here at the very top-left under the header */}
            <div
              style={{
                marginBottom: 16,
                display: "flex",
                justifyContent: "flex-start",
              }}
            >
              <BackButton />
            </div>

            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
