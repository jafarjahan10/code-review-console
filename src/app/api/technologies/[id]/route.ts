
import { initializeFirebase } from '@/firebase';
import { doc, getDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';

const { firestore } = initializeFirebase();
const TECHNOLOGIES_COLLECTION = 'technologies';

// GET a single technology by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const docRef = doc(firestore, TECHNOLOGIES_COLLECTION, id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return NextResponse.json({ error: 'Technology not found' }, { status: 404 });
        }

        const data = docSnap.data();
        const createdAt = data.createdAt ? (data.createdAt as Timestamp).toDate().toISOString() : new Date().toISOString();

        const technology = {
            id: docSnap.id,
            name: data.name,
            createdAt: createdAt,
        };

        return NextResponse.json(technology);

    } catch (error: any) {
        console.error(`Error fetching technology ${params.id}:`, error);
        return NextResponse.json({ error: error.message || 'Failed to fetch technology' }, { status: 500 });
    }
}


// UPDATE a technology
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const body = await request.json();
        const { name } = body;

        if (!name) {
            return NextResponse.json({ error: 'Technology name is required' }, { status: 400 });
        }

        const docRef = doc(firestore, TECHNOLOGIES_COLLECTION, id);
        await updateDoc(docRef, { 
            name,
            name_lowercase: name.toLowerCase() 
        });

        return NextResponse.json({ message: 'Technology updated successfully' });

    } catch (error: any) {
        console.error(`Error updating technology ${params.id}:`, error);
        return NextResponse.json({ error: error.message || 'Failed to update technology' }, { status: 500 });
    }
}

// DELETE a technology
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const docRef = doc(firestore, TECHNOLOGIES_COLLECTION, id);
        
        // Optional: Check if doc exists before trying to delete
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
             return NextResponse.json({ error: 'Technology not found' }, { status: 404 });
        }

        await deleteDoc(docRef);

        return NextResponse.json({ message: 'Technology deleted successfully' }, { status: 200 });
    } catch (error: any) {
        console.error(`Error deleting technology ${params.id}:`, error);
        return NextResponse.json({ error: error.message || 'Failed to delete technology' }, { status: 500 });
    }
}
