
'use client';

import React, { useEffect, useState, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { setPersistence, browserLocalPersistence } from 'firebase/auth';

// This component ensures that Firebase is initialized on the client and that
// auth persistence is set before rendering the rest of the app.
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);

  useEffect(() => {
    // Initialize Firebase services
    const { auth, firestore, firebaseApp } = initializeFirebase();

    // Set auth persistence
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        // Firebase is ready
        setIsFirebaseReady(true);
      })
      .catch((error) => {
        console.error('Error setting auth persistence:', error);
        // Even if persistence fails, we can still proceed.
        setIsFirebaseReady(true);
      });
  }, []);

  // Don't render children until Firebase setup is complete
  if (!isFirebaseReady) {
    // You can render a global loading spinner here if you like
    return null;
  }

  // Once ready, get the initialized instances and pass them to the provider
  const { auth, firestore, firebaseApp } = initializeFirebase();

  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      auth={auth}
      firestore={firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
