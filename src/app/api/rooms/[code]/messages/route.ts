import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { dbGetRoomByCode, dbSaveMessage, dbGetMessages } from '@/lib/db';
import { getUserAvatar } from '@/lib/avatar';

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
    const messages = await dbGetMessages(room.id);
    return NextResponse.json({ success: true, messages });
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
    const { text, senderId, senderName, senderRole, type, codeSnippet } = body;

    if (!text && !codeSnippet) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    const msgId = 'msg_' + crypto.randomUUID().slice(0, 10);
    const senderAvatar = body.senderAvatar || getUserAvatar(undefined, senderName || 'User');

    await dbSaveMessage({
      id: msgId,
      roomId: room.id,
      senderId: senderId || 'user_' + crypto.randomUUID().slice(0, 6),
      senderName: senderName || 'Participant',
      senderRole: senderRole || 'developer',
      senderAvatar,
      text: text || '',
      type: type || 'chat',
      codeSnippet,
    });

    const messages = await dbGetMessages(room.id);
    return NextResponse.json({ success: true, messages }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
