'use client';

import React, { useEffect, useRef, useState, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { setPersistence, browserLocalPersistence } from 'firebase/auth';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

// Initialize Firebase services once at module level to prevent re-initialization
const firebaseServices = initializeFirebase();

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [isPersistenceReady, setIsPersistenceReady] = useState(false);
  const persistenceSetRef = useRef(false);

  useEffect(() => {
    // Only set persistence once
    if (persistenceSetRef.current) {
      setIsPersistenceReady(true);
      return;
    }

    persistenceSetRef.current = true;
    
    // Set auth persistence as soon as the component mounts
    setPersistence(firebaseServices.auth, browserLocalPersistence)
      .then(() => {
        setIsPersistenceReady(true);
      })
      .catch((error) => {
        console.error('Error setting auth persistence:', error);
        // Still mark as ready to not block the app
        setIsPersistenceReady(true);
      });
  }, []);

  // Don't render children until persistence is set
  if (!isPersistenceReady) {
    return null;
  }

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}