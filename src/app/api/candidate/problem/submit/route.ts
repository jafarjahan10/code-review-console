
import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase/server-init';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(request: Request) {
  try {
    const { firestore } = initializeFirebase();
    const body = await request.json();
    const { candidateId, problemId, answers } = body;

    if (!candidateId || !problemId || !answers) {
      return NextResponse.json({ error: 'Missing required fields: candidateId, problemId, and answers are required.' }, { status: 400 });
    }

    // 1. Generate a new document reference in the 'submissions' collection.
    const submissionRef = firestore.collection('submissions').doc();
    const submissionTime = Timestamp.now();

    // 2. Define the new submission data.
    const newSubmission = {
      id: submissionRef.id,
      candidateId,
      problemId,
      answers,
      submissionTime,
      remarks: [],
    };

    // 3. Define the reference to the candidate document that needs updating.
    const candidateRef = firestore.doc(`candidates/${candidateId}`);
    
    // 4. Use a batched write to perform an atomic update.
    const batch = firestore.batch();
    
    // Add the new submission to the batch
    batch.set(submissionRef, newSubmission);
    
    // Add the candidate update to the batch
    batch.update(candidateRef, {
      status: 'Completed',
      submissionId: submissionRef.id,
      submitTime: submissionTime,
    });
    
    // 5. Commit the batch.
    await batch.commit();

    return NextResponse.json({ message: 'Submission successful', submissionId: submissionRef.id });

  } catch (error: any) {
    console.error('Submission API Error:', error);
    
    let errorMessage = 'Failed to process submission';
    if (error.code === 'PERMISSION_DENIED') {
      errorMessage = 'Firebase permission denied. Check your server-side authentication and Firestore rules.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json({ error: errorMessage, details: error.toString() }, { status: 500 });
  }
}
