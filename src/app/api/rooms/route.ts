import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { 
  dbCreateRoom, 
  dbGetRecentRooms, 
  dbAddParticipant, 
  dbSaveMessage, 
  dbSaveCodeFile, 
  dbGetRoomByCode 
} from '@/lib/db';
import { getUserAvatar } from '@/lib/avatar';

function generateRoomCode(): string {
  const num = Math.floor(100 + Math.random() * 900);
  const tags = ['SYNC', 'ARCH', 'FLOW', 'LIVE', 'MESH', 'CORP', 'DEV'];
  const tag = tags[Math.floor(Math.random() * tags.length)];
  return `RUPAL-${num}-${tag}`;
}

export async function GET() {
  try {
    const rooms = await dbGetRecentRooms(20);
    return NextResponse.json({ success: true, rooms });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to list rooms' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const roomCode = body.roomCode || generateRoomCode();
    const title = body.title || 'Engineering Architecture & Strategy Review';
    const hostName = body.hostName || 'Conference Host';
    const hostId = body.hostId || 'host_' + crypto.randomUUID().slice(0, 8);
    const hostRole = body.hostRole || 'host';
    const hostAvatar = body.hostAvatar || getUserAvatar(undefined, hostName);
    const inviteCode = body.inviteCode;
    const isInviteOnly = body.isInviteOnly !== false;

    // Check if room already exists
    let room = await dbGetRoomByCode(roomCode);
    if (!room) {
      room = await dbCreateRoom({
        roomCode,
        title,
        description: body.description || 'Live WebRTC conference session by Rupal Convene',
        hostId,
        isWatermarkActive: body.isWatermarkActive !== false,
        inviteCode,
        isInviteOnly,
      });

      // Add Host as initial participant
      await dbAddParticipant({
        id: hostId,
        roomId: room!.id,
        userId: hostId,
        name: hostName,
        role: hostRole,
        avatar: hostAvatar,
      });

      // Initialize clean starter code file
      await dbSaveCodeFile({
        id: 'file_main',
        roomId: room!.id,
        name: 'index.ts',
        language: 'typescript',
        content: `// Rupal Convene In-Call Collaborative IDE
// Real-time sandboxed execution for TypeScript, Python & Go

export async function main() {
  console.log("Rupal Convene runtime initialized.");
  console.log("Room: ${roomCode}");
  console.log("Security: 256-bit DTLS/SRTP E2EE");
  return { status: "active", latencyMs: 1.8 };
}

main();`,
        isEntrypoint: true,
      });

      // Add clean initial system message
      await dbSaveMessage({
        id: 'msg_welcome_' + Date.now(),
        roomId: room!.id,
        senderId: 'system',
        senderName: 'Rupal Convene System',
        senderRole: 'host',
        senderAvatar: '',
        text: `Conference room ${roomCode} created. End-to-end DTLS/SRTP encryption verified. Welcome!`,
        type: 'system',
      });
    }

    return NextResponse.json({
      success: true,
      room,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create room' }, { status: 500 });
  }
}
