import { NextRequest, NextResponse } from 'next/server';
import { dbGetRoomByCode, dbSaveCodeFile, dbGetCodeFiles } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const room = await dbGetRoomByCode(code);
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
    const files = await dbGetCodeFiles(room.id);
    return NextResponse.json({ success: true, files });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const room = await dbGetRoomByCode(code);
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const body = await req.json();
    const { id, name, language, content, isEntrypoint } = body;

    await dbSaveCodeFile({
      id: id || 'file_' + Date.now().toString(36),
      roomId: room.id,
      name: name || 'file.ts',
      language: language || 'typescript',
      content: content || '',
      isEntrypoint: Boolean(isEntrypoint),
    });

    const files = await dbGetCodeFiles(room.id);
    return NextResponse.json({ success: true, files });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
