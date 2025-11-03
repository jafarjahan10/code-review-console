
import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase/server-init';
import { Timestamp } from 'firebase-admin/firestore';

export async function GET(req: NextRequest) {
  try {
    const { firestore } = initializeFirebase();
    const { searchParams } = new URL(req.url);
    
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const sortBy = searchParams.get('sortBy') || 'submissionTime';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Fetch all submissions, candidates, and problems first
    const [submissionsSnap, candidatesSnap, problemsSnap] = await Promise.all([
        firestore.collection('submissions').get(),
        firestore.collection('candidates').get(),
        firestore.collection('problems').get()
    ]);

    const candidatesMap = new Map(candidatesSnap.docs.map(doc => [doc.id, doc.data()]));
    const problemsMap = new Map(problemsSnap.docs.map(doc => [doc.id, doc.data()]));

    let allSubmissions = submissionsSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        candidate: candidatesMap.get(data.candidateId),
        problem: problemsMap.get(data.problemId),
      };
    });

    // Server-side search
    if (search) {
        allSubmissions = allSubmissions.filter(sub => {
            const candidateName = sub.candidate?.name?.toLowerCase() || '';
            const candidateEmail = sub.candidate?.email?.toLowerCase() || '';
            const problemTitle = sub.problem?.title?.toLowerCase() || '';
            return candidateName.includes(search) || 
                   candidateEmail.includes(search) || 
                   problemTitle.includes(search);
        });
    }

    // Server-side sort
    allSubmissions.sort((a, b) => {
        let valA, valB;
        
        switch (sortBy) {
            case 'candidateName':
                valA = a.candidate?.name || '';
                valB = b.candidate?.name || '';
                break;
            case 'problemTitle':
                valA = b.problem?.title || '';
                valB = b.problem?.title || '';
                break;
            case 'status':
                valA = a.candidate?.status || '';
                valB = b.candidate?.status || '';
                break;
            case 'submissionTime':
                valA = a.submissionTime instanceof Timestamp ? a.submissionTime.toMillis() : 0;
                valB = b.submissionTime instanceof Timestamp ? b.submissionTime.toMillis() : 0;
                break;
            default:
                valA = 0;
                valB = 0;
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    // Server-side pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedSubmissions = allSubmissions.slice(startIndex, endIndex);
    const hasNextPage = endIndex < allSubmissions.length;

    return NextResponse.json({ submissions: paginatedSubmissions, hasNextPage });

  } catch (error: any) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
