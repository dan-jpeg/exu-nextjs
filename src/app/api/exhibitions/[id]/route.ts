import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { auth } from '../../../../../auth';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const doc = await adminDb.collection('edie_exhibitions').doc(params.id).get();
  if (!doc.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ id: doc.id, ...doc.data() });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  await adminDb.collection('edie_exhibitions').doc(params.id).update({
    ...body,
    updatedAt: new Date().toISOString(),
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await adminDb.collection('edie_exhibitions').doc(params.id).delete();
  return NextResponse.json({ success: true });
}
