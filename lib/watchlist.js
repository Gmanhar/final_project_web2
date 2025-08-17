import {
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  collection,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  getDoc,
} from 'firebase/firestore';
import { db } from './firebaseClient';

/**
 * Add a movie to the user's watchlist.
 * Uses merge: true so adding fields later won't wipe older fields.
 * @param {string} uid
 * @param {object} movie - TMDB/movie object (expects movie.id)
 */
export async function addToWatchlist(uid, movie) {
  if (!uid) throw new Error('addToWatchlist: missing uid');
  if (!movie || (movie.id == null)) throw new Error('addToWatchlist: missing movie.id');

  const ref = doc(db, 'users', uid, 'watchlist', String(movie.id));
  const payload = {
    id: movie.id,
    title: movie.title ?? movie.name ?? '',
    poster: movie.poster_path ?? movie.poster ?? null,
    release_date: movie.release_date ?? movie.first_air_date ?? null,
    addedAt: serverTimestamp(),
  };

  try {
    // merge:true in case you later want to add more metadata without overwriting
    await setDoc(ref, payload, { merge: true });
    return true;
  } catch (err) {
    console.error('addToWatchlist failed', { uid, movieId: movie.id, err });
    throw err;
  }
}

/**
 * Remove a movie from the user's watchlist.
 * @param {string} uid
 * @param {string|number} movieId
 */
export async function removeFromWatchlist(uid, movieId) {
  if (!uid) throw new Error('removeFromWatchlist: missing uid');
  if (movieId == null) throw new Error('removeFromWatchlist: missing movieId');

  const ref = doc(db, 'users', uid, 'watchlist', String(movieId));
  try {
    await deleteDoc(ref);
    return true;
  } catch (err) {
    console.error('removeFromWatchlist failed', { uid, movieId, err });
    throw err;
  }
}

/**
 * One-time existence check.
 * @param {string} uid
 * @param {string|number} movieId
 * @returns {Promise<boolean>}
 */
export async function isInWatchlist(uid, movieId) {
  if (!uid || movieId == null) return false;
  try {
    const ref = doc(db, 'users', uid, 'watchlist', String(movieId));
    const snap = await getDoc(ref);
    return snap.exists();
  } catch (err) {
    console.error('isInWatchlist failed', { uid, movieId, err });
    return false;
  }
}

/**
 * One-time fetch of the user's watchlist (useful for debug/fallback).
 * Returns an array of items with addedAt included (may be Firestore Timestamp).
 * @param {string} uid
 */
export async function getWatchlistOnce(uid) {
  if (!uid) return [];
  try {
    const collRef = collection(db, 'users', uid, 'watchlist');
    const q = query(collRef, orderBy('addedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: data.id ?? d.id,
        title: data.title ?? '',
        poster: data.poster ?? null,
        release_date: data.release_date ?? null,
        addedAt: data.addedAt ?? null,
      };
    });
  } catch (err) {
    console.error('getWatchlistOnce failed', { uid, err });
    return [];
  }
}

/**
 * Real-time watcher for a user's watchlist. Returns unsubscribe function.
 * If the realtime subscription fails immediately (e.g. permission issues),
 * this will attempt a one-time read fallback and invoke cb([]) or cb(rows).
 *
 * cb receives an array of items: { id, title, poster, release_date, addedAt }
 *
 * @param {string} uid
 * @param {(rows:Array)=>void} cb
 * @returns {() => void} unsubscribe
 */
export function watchWatchlist(uid, cb) {
  if (!uid) {
    // return a noop unsubscribe so callers can safely call it
    return () => {};
  }

  const collRef = collection(db, 'users', uid, 'watchlist');
  // order by addedAt desc for most-recent-first; if addedAt missing,
  // serverTimestamp will populate shortly after write but initial ordering can vary.
  let q;
  try {
    q = query(collRef, orderBy('addedAt', 'desc'));
  } catch (err) {
    // fallback to unsorted collection if orderBy construction fails
    console.warn('watchWatchlist: orderBy failed, falling back to un-ordered collection', err);
    q = collRef;
  }

  let unsub = null;
  try {
    unsub = onSnapshot(
      q,
      (snap) => {
        try {
          const docs = snap.docs.map((d) => {
            const data = d.data();
            return {
              id: data.id ?? d.id,
              title: data.title ?? '',
              poster: data.poster ?? null,
              release_date: data.release_date ?? null,
              addedAt: data.addedAt ?? null,
            };
          });
          cb(docs);
        } catch (mapErr) {
          console.error('watchWatchlist mapping error', mapErr);
          cb([]);
        }
      },
      async (err) => {
        // if realtime stream errors (e.g. permission denied, offline), log and fallback to one-time read
        console.error('watchWatchlist realtime error', err);
        try {
          const fallback = await getWatchlistOnce(uid);
          cb(fallback);
        } catch (fallbackErr) {
          console.error('watchWatchlist fallback read failed', fallbackErr);
          cb([]);
        }
      }
    );
  } catch (err) {
    // onSnapshot setup may throw in some edge cases; do a one-time get as fallback
    console.error('watchWatchlist failed to start realtime listener', err);
    (async () => {
      try {
        const fallback = await getWatchlistOnce(uid);
        cb(fallback);
      } catch (fallbackErr) {
        console.error('watchWatchlist fallback read failed', fallbackErr);
        cb([]);
      }
    })();
    unsub = null;
  }

  // return unsubscribe or noop
  return () => {
    try {
      if (typeof unsub === 'function') unsub();
    } catch (e) {
      /* ignore */
    }
  };
}
