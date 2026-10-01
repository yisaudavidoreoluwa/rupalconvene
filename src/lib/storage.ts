import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { dbSaveStorageFile } from './db';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export interface UploadResult {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
}

export async function saveUploadedBuffer(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  roomId?: string,
  uploaderId?: string
): Promise<UploadResult> {
  const ext = path.extname(originalName) || '.bin';
  const id = 'file_' + crypto.randomUUID();
  const safeFilename = `${id}${ext}`;
  const filePath = path.join(UPLOAD_DIR, safeFilename);

  await fs.promises.writeFile(filePath, buffer);

  const publicUrl = `/uploads/${safeFilename}`;

  dbSaveStorageFile({
    id,
    roomId,
    uploaderId,
    filename: safeFilename,
    originalName,
    mimeType,
    sizeBytes: buffer.length,
    storagePath: filePath,
    publicUrl,
  });

  return {
    id,
    filename: safeFilename,
    originalName,
    mimeType,
    sizeBytes: buffer.length,
    url: publicUrl,
  };
}

export function getStorageFilePath(filename: string): string | null {
  const filePath = path.join(UPLOAD_DIR, path.basename(filename));
  if (fs.existsSync(filePath)) {
    return filePath;
  }
  return null;
}
