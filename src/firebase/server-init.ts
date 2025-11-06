
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let adminApp: App | null = null;
let db: any = null;

// IMPORTANT: Do not use this method in a production environment.
// It is intended for local development and testing only.
// In a managed environment (like App Hosting or Cloud Functions),
// call initializeApp() with no arguments to use Application Default Credentials.
function initializeAdminAppWithServiceAccount() {
  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
      console.warn("FIREBASE_SERVICE_ACCOUNT_KEY not found, trying default initialization");
      return initializeApp();
    }
    const serviceAccount = JSON.parse(serviceAccountKey);
    return initializeApp({
      credential: cert(serviceAccount),
    });
  } catch (e) {
    console.error("Failed to initialize Firebase Admin with service account. Ensure FIREBASE_SERVICE_ACCOUNT_KEY is set and valid.", e);
    // As a last resort for environments that support it and where the SDK can find it.
    return initializeApp();
  }
}

function getAdminApp(): App {
  // If there are already initialized apps, return the first one.
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // If running in a Google Cloud environment (like App Hosting), the SDK can
  // often initialize without any parameters.
  if (process.env.GCLOUD_PROJECT) {
    try {
      return initializeApp();
    } catch (e) {
      console.warn("Initializing without params failed, falling back to service account.", e);
      // Fallback for cases where it's expected but fails.
      return initializeAdminAppWithServiceAccount();
    }
  }

  // For local development, rely on the service account environment variable.
  return initializeAdminAppWithServiceAccount();
}

/**
 * Returns an initialized Firebase Admin App and Firestore instance.
 * This is for server-side use only.
 */
export function initializeFirebase() {
  // Lazy initialization - only initialize when actually called
  if (!adminApp) {
    adminApp = getAdminApp();
    db = getFirestore(adminApp);
  }
  
  return {
    firebaseAdminApp: adminApp,
    firestore: db,
  };
}

