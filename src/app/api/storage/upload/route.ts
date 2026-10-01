import { NextRequest, NextResponse } from 'next/server';
import { saveUploadedBuffer } from '@/lib/storage';
import { isCloudinaryConfigured, uploadBufferToCloudinary } from '@/lib/cloudinary';
import { dbSaveStorageFile } from '@/lib/db';
import crypto from 'node:crypto';

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

    // Check if Cloudinary is configured
    if (isCloudinaryConfigured()) {
      const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
      const cloudinaryResult = await uploadBufferToCloudinary(buffer, {
        folder: 'rupal-convene/decks',
        filename: `file_${crypto.randomUUID()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
        resourceType: isPdf ? 'auto' : 'auto',
      });

      const fileRecord = {
        id: 'file_' + crypto.randomUUID(),
        roomId,
        uploaderId,
        filename: cloudinaryResult.public_id,
        originalName: file.name,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: cloudinaryResult.bytes || file.size,
        storagePath: cloudinaryResult.public_id,
        publicUrl: cloudinaryResult.secure_url,
      };

      try {
        await dbSaveStorageFile(fileRecord);
      } catch (dbErr) {
        console.warn('Could not record file in database:', dbErr);
      }

      return NextResponse.json({
        success: true,
        provider: 'cloudinary',
        file: {
          ...fileRecord,
          url: cloudinaryResult.secure_url,
          format: cloudinaryResult.format,
        },
      }, { status: 201 });
    }

    // Fallback to local disk storage if Cloudinary keys are not yet provided
    const result = await saveUploadedBuffer(
      buffer,
      file.name,
      file.type || 'application/octet-stream',
      roomId,
      uploaderId
    );

    return NextResponse.json({
      success: true,
      provider: 'local',
      notice: 'Using local storage. Add Cloudinary credentials for high-speed cloud CDN hosting.',
      file: result,
    }, { status: 201 });
  } catch (err: any) {
    console.error('Storage upload error:', err);
    return NextResponse.json({ error: err.message || 'File upload failed' }, { status: 500 });
  }
}
