
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore'

let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

// This function ensures Firebase is initialized only once.
const initializeAppOnce = () => {
  if (getApps().length > 0) {
    return getApp();
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

app = initializeAppOnce();
auth = getAuth(app);
firestore = getFirestore(app);

// This function now returns the already-initialized instances.
export function initializeFirebase() {
  return {
    firebaseApp: app,
    auth: auth,
    firestore: firestore,
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
