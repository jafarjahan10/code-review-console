
import { initializeApp, getApps, getApp, App, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config';

// This is a server-side only file.

// This is a placeholder for your service account key.
// In a real production environment, you should use environment variables
// to store your service account credentials, and not hardcode them.
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

let adminApp: App;

if (!getApps().length) {
  if (serviceAccount) {
    adminApp = initializeApp({
      credential: cert(serviceAccount),
      databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
    });
  } else {
    // In environments like Firebase App Hosting, you can initialize without credentials
    // and it will use the application's default credentials.
    adminApp = initializeApp();
  }
} else {
  adminApp = getApps()[0];
}

const db = getFirestore(adminApp);

export function initializeFirebase() {
  return {
    firebaseAdminApp: adminApp,
    firestore: db,
  };
}
