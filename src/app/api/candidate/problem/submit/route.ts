
import { NextResponse } from 'next/server';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { firebaseConfig } from '@/firebase/config';

// Initialize Firebase Admin SDK
let adminApp: App;
if (!getApps().length) {
  adminApp = initializeApp({
    // If you have service account credentials, add them here
    // credential: admin.credential.cert(serviceAccount)
  });
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

    // 1. Create a new submission document
    const submissionData = {
      candidateId,
      problemId,
      codeHTML: codeHTML || '',
      codeCSS: codeCSS || '',
      codeJS: codeJS || '',
      submissionTime: Timestamp.now(),
    };

    const submissionRef = await db.collection(`candidates/${candidateId}/submissions`).add(submissionData);

    // 2. Update the candidate's document
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
