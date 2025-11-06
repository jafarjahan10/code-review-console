
import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase/server-init';
import { doc, getDoc } from 'firebase-admin/firestore';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  if (!id) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  try {
    const { firestore } = initializeFirebase();
    const submissionRef = doc(firestore, 'submissions', id);
    const docSnap = await getDoc(submissionRef);

    if (docSnap.exists()) {
      return NextResponse.json({ id: docSnap.id, ...docSnap.data() });
    } else {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }
  } catch (error: any) {
    console.error(`Error fetching submission ${id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
