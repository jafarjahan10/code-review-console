import { initializeFirebase } from '@/firebase';
import { Technology } from '@/types';
import {
  collection,
  query,
  getDocs,
  where,
  orderBy,
  limit,
  startAfter,
  QueryConstraint,
  QueryDocumentSnapshot,
  DocumentData,
  Timestamp,
} from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';

const { firestore } = initializeFirebase();
const TECHNOLOGIES_COLLECTION = 'technologies';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('limit') || '10', 10);
    const lastVisibleId = searchParams.get('lastVisible');

    const constraints: QueryConstraint[] = [];

    // Note: Firestore does not support case-insensitive search or partial string matching natively.
    // A simple equality where clause is used here. For more complex search, a third-party service like Algolia is recommended.
    if (search) {
      // This is a basic search. For full-text search, consider a dedicated search service.
      // This query requires a composite index on name and the sortBy field.
      constraints.push(where('name', '>=', search));
      constraints.push(where('name', '<=', search + '\uf8ff'));
    }

    if (sortBy) {
      constraints.push(orderBy(sortBy, sortOrder));
    }

    let lastDoc: QueryDocumentSnapshot<DocumentData> | undefined;
    if (lastVisibleId && page > 1) {
        const lastDocRef = (await getDocs(query(collection(firestore, TECHNOLOGIES_COLLECTION), where('id', '==', lastVisibleId)))).docs[0];
        if (lastDocRef) {
            lastDoc = lastDocRef;
            constraints.push(startAfter(lastDoc));
        }
    }
    
    constraints.push(limit(pageSize));
    
    const q = query(collection(firestore, TECHNOLOGIES_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);

    const technologies: Technology[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        // Convert Firestore Timestamp to ISO string
        createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
      };
    });

    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

    return NextResponse.json({
        technologies,
        lastVisibleId: lastVisible ? lastVisible.id : null,
        page,
        pageSize,
        hasNextPage: querySnapshot.docs.length === pageSize,
    });

  } catch (error: any) {
    console.error('Error fetching technologies:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch technologies' }, { status: 500 });
  }
}
