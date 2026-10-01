import { NextRequest, NextResponse } from 'next/server';
import { 
  dbGetRoomByCode, 
  dbGetParticipants, 
  dbGetMessages, 
  dbGetCodeFiles 
} from '@/lib/db';

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

    const participants = await dbGetParticipants(room.id);
    const messages = await dbGetMessages(room.id);
    const codeFiles = await dbGetCodeFiles(room.id);

    return NextResponse.json({
      success: true,
      room,
      participants,
      messages,
      codeFiles,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching room' }, { status: 500 });
  }
}
