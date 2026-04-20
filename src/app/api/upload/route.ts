import { NextResponse } from 'next/server';
import { adminStorage } from '@/lib/firebase-admin';
import { auth } from '../../../../auth';

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const bucket = adminStorage.bucket();
  const filename = `edie/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
  const fileRef = bucket.file(filename);

  await fileRef.save(buffer, { contentType: file.type });
  await fileRef.makePublic();

  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

  return NextResponse.json({ url: publicUrl });
}
