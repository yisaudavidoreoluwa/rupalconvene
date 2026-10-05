import { NextRequest, NextResponse } from 'next/server';
import { 
  dbGetRoomByCode, 
  dbGetParticipants, 
  dbAddParticipant, 
  dbRemoveParticipant 
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
    return NextResponse.json({
      success: true,
      roomId: room.id,
      roomCode: room.roomCode,
      participants,
      totalCount: participants.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching participants' }, { status: 500 });
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

    const body = await req.json().catch(() => ({}));
    const { userId, name, role = 'developer', avatar = '' } = body;

    if (!userId || !name) {
      return NextResponse.json({ error: 'userId and name are required' }, { status: 400 });
    }

    const participantId = `${room.id}_${userId}`;
    await dbAddParticipant({
      id: participantId,
      roomId: room.id,
      userId,
      name,
      role,
      avatar,
    });

    const participants = await dbGetParticipants(room.id);
    return NextResponse.json({
      success: true,
      participantId,
      participants,
      totalCount: participants.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error adding participant' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const room = await dbGetRoomByCode(code);

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId parameter required' }, { status: 400 });
    }

    await dbRemoveParticipant(room.id, userId);
    return NextResponse.json({ success: true, removedUserId: userId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error removing participant' }, { status: 500 });
  }
}
