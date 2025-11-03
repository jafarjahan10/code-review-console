
import { NextResponse } from 'next/server';
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
let adminApp: App;
if (!getApps().length) {
  // initializeApp() with no parameters will use Application Default Credentials
  // in the App Hosting environment.
  adminApp = initializeApp();
} else {
  adminApp = getApps()[0];
}

const db = getFirestore(adminApp);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { candidateId, problemId, codeHTML, codeCSS, codeJS } = body;

    if (!candidateId || !problemId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Generate a new document reference in the 'submissions' collection to get an ID upfront.
    const submissionCollection = db.collection('submissions');
    const submissionRef = submissionCollection.doc(); // Create a reference with a new auto-generated ID

    // 2. Use a single `set` operation to create the document with all its data, including the ID.
    await submissionRef.set({
      id: submissionRef.id, // Include the document's own ID
      candidateId,
      problemId,
      codeHTML: codeHTML || '',
      codeCSS: codeCSS || '',
      codeJS: codeJS || '',
      submissionTime: Timestamp.now(),
    });

    // 3. Update the candidate's document with the new submission ID and status
    const candidateRef = db.doc(`candidates/${candidateId}`);
    await candidateRef.update({
      status: 'Completed',
      submissionId: submissionRef.id,
      submitTime: Timestamp.now(),
    });

    return NextResponse.json({ message: 'Submission successful', submissionId: submissionRef.id });

  } catch (error: any) {
    console.error('Submission API Error:', error);
    return NextResponse.json({ error: 'Failed to process submission', details: error.message }, { status: 500 });
  }
}
