
import type { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase/server-init';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { firestore } = initializeFirebase();
    const submissionsRef = collection(firestore, 'submissions');
    const q = query(submissionsRef, orderBy('submissionTime', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const submissions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(submissions);
  } catch (error: any) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
