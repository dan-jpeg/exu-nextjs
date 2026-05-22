import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';

let app: App | null = null;

function ensureApp(): App {
  if (app) return app;
  const existing = getApps()[0];
  if (existing) {
    app = existing;
    return app;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Firebase admin env vars are missing (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY). ' +
        'Ensure these are configured in the Netlify environment.'
    );
  }

  app = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
  return app;
}

export function getAdminDb(): Firestore {
  return getFirestore(ensureApp());
}

export function getAdminStorage(): Storage {
  return getStorage(ensureApp());
}

// Backwards-compatible lazy proxies — defer Firebase initialization until first
// access so importing this module at build time doesn't require env vars.
export const adminDb: Firestore = new Proxy({} as Firestore, {
  get(_target, prop) {
    const real = getAdminDb() as unknown as Record<string | symbol, unknown>;
    const value = real[prop];
    return typeof value === 'function' ? (value as Function).bind(real) : value;
  },
});

export const adminStorage: Storage = new Proxy({} as Storage, {
  get(_target, prop) {
    const real = getAdminStorage() as unknown as Record<string | symbol, unknown>;
    const value = real[prop];
    return typeof value === 'function' ? (value as Function).bind(real) : value;
  },
});
