
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
    const limitParam = parseInt(searchParams.get('limit') || '10', 10);
    const startAfterDocId = searchParams.get('startAfter');

    let constraints: QueryConstraint[] = [];

    if (search) {
      constraints.push(where('name_lowercase', '>=', search.toLowerCase()));
      constraints.push(where('name_lowercase', '<=', search.toLowerCase() + '\uf8ff'));
    }

    const sortField = sortBy === 'name' ? 'name_lowercase' : sortBy;
    constraints.push(orderBy(sortField, sortOrder));

    if (startAfterDocId) {
      const startAfterDoc = await getDoc(doc(firestore, TECHNOLOGIES_COLLECTION, startAfterDocId));
      if (startAfterDoc.exists()) {
        constraints.push(startAfter(startAfterDoc));
      }
    }
    
    constraints.push(limit(limitParam + 1)); // Fetch one extra to check for hasNextPage

    const q = query(collection(firestore, TECHNOLOGIES_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);

    let technologies: Technology[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      const createdAt = data.createdAt ? (data.createdAt as Timestamp).toDate().toISOString() : new Date().toISOString();
      return {
        id: doc.id,
        name: data.name,
        createdAt: createdAt,
      };
    });

    const hasNextPage = technologies.length > limitParam;
    if (hasNextPage) {
      technologies = technologies.slice(0, limitParam); // Remove the extra document
    }

    return NextResponse.json({
        technologies,
        hasNextPage,
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

        const docRef = await addDoc(collection(firestore, TECHNOLOGIES_COLLECTION), {
            name,
            name_lowercase: name.toLowerCase(),
            createdAt: serverTimestamp(),
        });
        
        const responseData = {
            id: docRef.id,
            name: name,
        };

        return NextResponse.json(responseData, { status: 201 });

    } catch (error: any) {
        console.error('Error creating technology:', error);
        return NextResponse.json({ error: error.message || 'Failed to create technology' }, { status: 500 });
    }
}
