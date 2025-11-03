
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let adminApp: App;

if (!getApps().length) {
  // In a managed environment like Firebase App Hosting or Cloud Functions,
  // initializeApp() will automatically use the Application Default Credentials.
  adminApp = initializeApp();
} else {
  adminApp = getApps()[0];
}

const db = getFirestore(adminApp);

/**
 * Returns an initialized Firebase Admin App and Firestore instance.
 * This is for server-side use only.
 */
export function initializeFirebase() {
  return {
    firebaseAdminApp: adminApp,
    firestore: db,
  };
}
