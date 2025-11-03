
import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase/server-init';
import { doc, getDoc } from 'firebase-admin/firestore';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!params.id) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  try {
    const { firestore } = initializeFirebase();
    const submissionRef = doc(firestore, 'submissions', params.id);
    const docSnap = await getDoc(submissionRef);

    if (docSnap.exists()) {
      return NextResponse.json({ id: docSnap.id, ...docSnap.data() });
    } else {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }
  } catch (error: any) {
    console.error(`Error fetching submission ${params.id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
