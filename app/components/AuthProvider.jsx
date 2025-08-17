'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebaseClient';

// convenience helpers exported from lib/firebaseAuth (optional)
import {
  signOut as fbSignOut,
  signInWithEmail as fbSignInWithEmail,
  registerWithEmail as fbRegisterWithEmail,
  signInWithGoogle as fbSignInWithGoogle,
} from '@/lib/firebaseAuth';

const AuthContext = createContext({
  user: null,
  loading: true,
  signOut: undefined,
  signInWithEmail: undefined,
  registerWithEmail: undefined,
  signInWithGoogle: undefined,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth || typeof onAuthStateChanged !== 'function') {
      console.warn('Firebase auth not initialized correctly.');
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    return () => {
      try {
        unsub && unsub();
      } catch (e) {
      }
    };
  }, []);

  // wrappers that call the functions exported from lib/firebaseAuth if they exist.
  const signOut = async () => {
    if (typeof fbSignOut === 'function') return fbSignOut();
    throw new Error('signOut helper not available (missing lib/firebaseAuth).');
  };

  const signInWithEmail = async (email, password) => {
    if (typeof fbSignInWithEmail === 'function') return fbSignInWithEmail(email, password);
    throw new Error('signInWithEmail helper not available (missing lib/firebaseAuth).');
  };

  const registerWithEmail = async (email, password) => {
    if (typeof fbRegisterWithEmail === 'function') return fbRegisterWithEmail(email, password);
    throw new Error('registerWithEmail helper not available (missing lib/firebaseAuth).');
  };

  const signInWithGoogle = async () => {
    if (typeof fbSignInWithGoogle === 'function') return fbSignInWithGoogle();
    throw new Error('signInWithGoogle helper not available (missing lib/firebaseAuth).');
  };

  const value = {
    user,
    loading,
    signOut,
    signInWithEmail,
    registerWithEmail,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);
