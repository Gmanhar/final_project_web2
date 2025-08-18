"use client";
import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  registerWithEmail,
  signInWithEmail,
  signInWithGoogle,
} from "@/lib/firebaseAuth";
import { auth } from "@/lib/firebaseClient";
import {
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";

export default function AuthForm({ onSuccess }) {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // set persistence based on "remember" checkbox
  async function applyPersistence() {
    try {
      const persistence = remember
        ? browserLocalPersistence
        : browserSessionPersistence;
      await setPersistence(auth, persistence);
    } catch (pErr) {
      // Not fatal — log and continue with default persistence
      console.warn("Could not set auth persistence", pErr);
    }
  }

  async function handleSubmit(e) {
    e?.preventDefault?.();
    if (busy) return;
    setErr("");
    if (!email || !password) {
      setErr("Please enter both email and password.");
      return;
    }

    setBusy(true);
    try {
      await applyPersistence();

      if (mode === "signin") {
        await signInWithEmail(email.trim(), password);
      } else {
        await registerWithEmail(email.trim(), password);
      }

      // clear inputs on success
      setEmail("");
      setPassword("");
      if (typeof onSuccess === "function") onSuccess();
    } catch (error) {
      console.error("Auth error", error);
      // Better user-facing error messaging
      const msg = error?.message
        ? error.message.replace(/Firebase: /i, "")
        : "Authentication failed — try again.";
      setErr(msg);
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    if (busy) return;
    setErr("");
    setBusy(true);
    try {
      // apply persistence for popup-based sign-in too
      await applyPersistence();

      if (typeof signInWithGoogle === "function") {
        await signInWithGoogle();
        if (typeof onSuccess === "function") onSuccess();
      } else {
        throw new Error(
          "Google sign-in not implemented (check lib/firebaseAuth)."
        );
      }
    } catch (error) {
      console.error("Google sign-in error", error);
      setErr(error?.message || "Google sign in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-card" role="dialog" aria-labelledby="auth-title">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h2 id="auth-title" style={{ margin: 0 }}>
          {mode === "signin" ? "Sign in" : "Create account"}
        </h2>
<button
  type="button"
  className={`bubble-btn ${mode === 'signin' ? 'create-btn' : 'have-btn'}`}
  onClick={() => setMode(mode === 'signin' ? 'register' : 'signin')}
  disabled={busy}
>
  {mode === 'signin' ? 'Create account' : 'Have an account?'}
</button>

      </div>

      <p
        style={{
          marginTop: 0,
          marginBottom: 12,
          color: "var(--muted, #bdbdbd)",
          fontSize: 13,
        }}
      >
        {mode === "signin"
          ? "Sign in to save movies and build your watchlist."
          : "Create an account to save movies and access your watchlist from any device."}
      </p>

      <form onSubmit={handleSubmit}>
        <label className="field">
          <span className="field-label">Email</span>
          <input
            className="input"
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
            disabled={busy}
          />
        </label>

        <label className="field">
          <span className="field-label">Password</span>
          <div style={{ position: "relative" }}>
            <input
              className="input"
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose a password"
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
              required
              disabled={busy}
            />
            <button
              type="button"
              aria-label={showPwd ? "Hide password" : "Show password"}
              onClick={() => setShowPwd((s) => !s)}
              className="pwd-toggle"
              disabled={busy}
            >
              {showPwd ? "🙈" : "👁️"}
            </button>
          </div>
        </label>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
            marginTop: 8,
          }}
        >
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              disabled={busy}
            />
            <span style={{ fontSize: 13, color: "var(--muted, #bdbdbd)" }}>
              Remember me
            </span>
          </label>

          <button
            type="submit"
            className="btn"
            disabled={busy}
            aria-busy={busy}
          >
            {busy
              ? mode === "signin"
                ? "Signing in…"
                : "Creating…"
              : mode === "signin"
              ? "Sign in"
              : "Create account"}
          </button>
        </div>
      </form>

      <div style={{ marginTop: 14 }}>
        <div
          style={{
            textAlign: "center",
            fontSize: 13,
            color: "var(--muted, #bdbdbd)",
            marginBottom: 8,
          }}
        >
          or
        </div>
        <button
          type="button"
          className="btn google-btn"
          onClick={handleGoogle}
          disabled={busy}
          aria-disabled={busy}
        >
          <span style={{ marginRight: 10 }}>🔵</span>
          Continue with Google
        </button>
      </div>

      {err && (
        <div
          role="alert"
          className="error"
          aria-live="polite"
          style={{ marginTop: 12 }}
        >
          {err}
        </div>
      )}
    </div>
  );
}

AuthForm.propTypes = {
  onSuccess: PropTypes.func,
};
AuthForm.defaultProps = {
  onSuccess: undefined,
};
