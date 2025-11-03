
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
  addDoc,
  serverTimestamp,
  getDoc,
  doc,
} from 'firebase/firestore';
import { headers } from 'next/headers';
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
    const limitParam = parseInt(searchParams.get('limit') || '10', 10);

    const constraints: QueryConstraint[] = [];

    if (search) {
      constraints.push(where('name', '>=', search));
      constraints.push(where('name', '<=', search + '\uf8ff'));
    }

    if (sortBy) {
      constraints.push(orderBy(sortBy, sortOrder));
    }
    
    // For pagination: get all docs and slice them. Not efficient for large datasets.
    // Firestore's cursor-based pagination is better but more complex to implement with page numbers.
    const allDocsQuery = query(collection(firestore, TECHNOLOGIES_COLLECTION), ...constraints);
    const allDocsSnapshot = await getDocs(allDocsQuery);

    const startIndex = (page - 1) * limitParam;
    const endIndex = startIndex + limitParam;
    
    const paginatedDocs = allDocsSnapshot.docs.slice(startIndex, endIndex);

    const technologies: Technology[] = paginatedDocs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
      };
    });

    return NextResponse.json({
        technologies,
        page,
        limit: limitParam,
        hasNextPage: endIndex < allDocsSnapshot.docs.length,
    });

  } catch (error: any) {
    console.error('Error fetching technologies:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch technologies' }, { status: 500 });
  }
}


export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name } = body;

        if (!name) {
            return NextResponse.json({ error: 'Technology name is required' }, { status: 400 });
        }

        const newTechnology = {
            name,
            createdAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(firestore, TECHNOLOGIES_COLLECTION), newTechnology);

        return NextResponse.json({ id: docRef.id, ...newTechnology }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating technology:', error);
        return NextResponse.json({ error: error.message || 'Failed to create technology' }, { status: 500 });
    }
}
