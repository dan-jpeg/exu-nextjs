import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { auth } from '../../../../auth';
import type { Work } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const snapshot = await adminDb
    .collection('edie_works')
    .orderBy('order', 'asc')
    .get();

  const works: Work[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Work, 'id'>),
  }));

  return NextResponse.json(works);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();

  // Get current max order
  const snapshot = await adminDb
    .collection('edie_works')
    .orderBy('order', 'desc')
    .limit(1)
    .get();

  const maxOrder = snapshot.empty ? 0 : (snapshot.docs[0].data().order ?? 0);

  const docRef = await adminDb.collection('edie_works').add({
    ...body,
    order: maxOrder + 1,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ id: docRef.id }, { status: 201 });
}
