
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore'

let cachedAuth: Auth | null = null;
let cachedFirestore: Firestore | null = null;

// This function ensures Firebase is initialized only once.
const initializeAppOnce = () => {
  if (getApps().length > 0) {
    return getApp();
  }
  
  // Check if we're in a build environment or if config is not available
  if (typeof window === 'undefined' && !firebaseConfig.projectId) {
    // During build time, return a placeholder that won't be used
    console.warn('Firebase config not available during build, skipping initialization');
    return null;
  }
  
  try {
    // Attempt to initialize via Firebase App Hosting environment variables
    return initializeApp();
  } catch (e) {
    if (process.env.NODE_ENV === "production") {
      console.warn('Automatic initialization failed. Falling back to firebase config object.', e);
    }
    // Fallback to local config for development or if auto-init fails
    return initializeApp(firebaseConfig);
  }
};

// This function now returns the already-initialized instances.
export function initializeFirebase() {
  // Return cached instances if they exist
  if (cachedAuth && cachedFirestore) {
    return {
      firebaseApp: getApp(),
      auth: cachedAuth,
      firestore: cachedFirestore,
    };
  }

  const app = initializeAppOnce();
  
  // If app is null (build time), return placeholder values
  if (!app) {
    return {
      firebaseApp: null as any,
      auth: null as any,
      firestore: null as any,
    };
  }

  cachedAuth = getAuth(app);
  cachedFirestore = getFirestore(app);

  return {
    firebaseApp: app,
    auth: cachedAuth,
    firestore: cachedFirestore,
  };
}



export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
