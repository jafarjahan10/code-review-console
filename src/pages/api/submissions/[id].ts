
import type { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore, doc, getDoc } from 'firebase-admin/firestore';
import { initializeFirebase } from '@/firebase/server-init';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  try {
    const { firestore } = initializeFirebase();
    const submissionRef = doc(firestore, 'submissions', id);
    const docSnap = await getDoc(submissionRef);

    if (docSnap.exists()) {
      res.status(200).json({ id: docSnap.id, ...docSnap.data() });
    } else {
      res.status(404).json({ error: 'Submission not found' });
    }
  } catch (error: any) {
    console.error(`Error fetching submission ${id}:`, error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
