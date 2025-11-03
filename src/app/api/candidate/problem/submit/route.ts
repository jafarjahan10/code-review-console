
import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase/server-init';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(request: Request) {
  try {
    const { firestore: db } = initializeFirebase();
    const body = await request.json();
    const { candidateId, problemId, answers } = body;

    if (!candidateId || !problemId || !answers) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Generate a new document reference in the 'submissions' collection to get an ID upfront.
    const submissionRef = db.collection('submissions').doc();
    const submissionTime = Timestamp.now();

    // 2. Create the submission document using a single `set` operation.
    await submissionRef.set({
      id: submissionRef.id,
      candidateId,
      problemId,
      answers,
      submissionTime: submissionTime,
      remarks: [],
    });

    // 3. Update the candidate's document with the new submission ID and status
    const candidateRef = db.doc(`candidates/${candidateId}`);
    await candidateRef.update({
      status: 'Completed',
      submissionId: submissionRef.id,
      submitTime: submissionTime,
    });

    return NextResponse.json({ message: 'Submission successful', submissionId: submissionRef.id });

  } catch (error: any) {
    console.error('Submission API Error:', error);
    // Propagate a more specific error message if available
    const errorMessage = error.code === 'PERMISSION_DENIED'
      ? 'Firebase permission denied. Check your server-side authentication and Firestore rules.'
      : 'Failed to process submission';
    return NextResponse.json({ error: errorMessage, details: error.message }, { status: 500 });
  }
}
