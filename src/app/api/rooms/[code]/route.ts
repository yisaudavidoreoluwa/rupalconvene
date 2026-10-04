import { NextRequest, NextResponse } from 'next/server';
import { 
  dbGetRoomByCode, 
  dbGetParticipants, 
  dbGetMessages, 
  dbGetCodeFiles,
  dbUpdateRoomStatus
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

    const inviteQuery = (req.nextUrl.searchParams.get('invite')?.trim() || '').toUpperCase();
    const roomInviteCode = (room.inviteCode || '').toUpperCase();
    const isInviteOnly = room.isInviteOnly !== false;
    const isInviteValid = !isInviteOnly || (
      inviteQuery.length > 0 && 
      roomInviteCode.length > 0 && 
      inviteQuery === roomInviteCode
    );

    const isEnded = room.status === 'ended';

    const participants = await dbGetParticipants(room.id);
    const messages = await dbGetMessages(room.id);
    const codeFiles = await dbGetCodeFiles(room.id);

    const hostParticipant = participants.find((p: any) => p.userId === room.hostId || p.role === 'host') || participants[0];

    return NextResponse.json({
      success: true,
      room,
      isEnded,
      status: room.status,
      isInviteOnly,
      isInviteValid,
      inviteCode: room.inviteCode,
      host: hostParticipant ? {
        id: hostParticipant.userId,
        name: hostParticipant.name,
        role: hostParticipant.role,
        avatar: hostParticipant.avatar,
      } : {
        id: room.hostId,
        name: 'Authorized Host',
        role: 'host',
      },
      participants,
      messages,
      codeFiles,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching room' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await req.json().catch(() => ({}));
    const status = body?.status || 'ended';
    const result = await dbUpdateRoomStatus(code, status);
    return NextResponse.json({ ...result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error updating room status' }, { status: 500 });
  }
}
