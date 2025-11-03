
import type { NextApiRequest, NextApiResponse } from 'next';
import { initializeFirebase } from '@/firebase/server-init';
import { Collection, DocumentData, Timestamp } from 'firebase-admin/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { firestore } = initializeFirebase();
    const { 
        page = '1', 
        limit = '10', 
        search = '',
        sortBy = 'submissionTime',
        sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const searchTerm = (search as string).toLowerCase();

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
    if (searchTerm) {
        allSubmissions = allSubmissions.filter(sub => {
            const candidateName = sub.candidate?.name?.toLowerCase() || '';
            const candidateEmail = sub.candidate?.email?.toLowerCase() || '';
            const problemTitle = sub.problem?.title?.toLowerCase() || '';
            return candidateName.includes(searchTerm) || 
                   candidateEmail.includes(searchTerm) || 
                   problemTitle.includes(searchTerm);
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
                valA = a.problem?.title || '';
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
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;
    const paginatedSubmissions = allSubmissions.slice(startIndex, endIndex);
    const hasNextPage = endIndex < allSubmissions.length;

    res.status(200).json({ submissions: paginatedSubmissions, hasNextPage });

  } catch (error: any) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
