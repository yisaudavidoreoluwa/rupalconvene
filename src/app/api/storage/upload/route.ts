import { NextRequest, NextResponse } from 'next/server';
import { saveUploadedBuffer } from '@/lib/storage';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const roomId = (formData.get('roomId') as string) || undefined;
    const uploaderId = (formData.get('uploaderId') as string) || undefined;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Limit to 50MB
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File size exceeds maximum 50MB limit' }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await saveUploadedBuffer(
      buffer,
      file.name,
      file.type || 'application/octet-stream',
      roomId,
      uploaderId
    );

    return NextResponse.json({
      success: true,
      file: result,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'File upload failed' }, { status: 500 });
  }
}
