import { NextRequest, NextResponse } from 'next/server';
import { ConveneProgram, ProgramCategory } from '@/types/program';
import { INITIAL_PROGRAMS } from '@/lib/program-defaults';

// In-memory runtime cache for created programs (persists during server lifetime)
let activePrograms: ConveneProgram[] = [...INITIAL_PROGRAMS];

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get('category') as ProgramCategory | null;

    let result = activePrograms;
    if (category) {
      result = result.filter((p) => p.category === category);
    }

    return NextResponse.json({
      success: true,
      programs: result,
      totalCount: result.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching programs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      title,
      description,
      category = 'hackathon',
      roomCode,
      inviteCode,
      hostId,
      hostName,
      hostRole,
      hostAvatar,
      scheduledDate,
      scheduledTime,
      durationMinutes = 60,
      tags = [],
    } = body;

    if (!title || !roomCode) {
      return NextResponse.json({ error: 'Title and roomCode are required' }, { status: 400 });
    }

    const newProgram: ConveneProgram = {
      id: `prog-${Date.now()}`,
      roomCode: roomCode.trim().toUpperCase(),
      inviteCode: inviteCode ? inviteCode.trim().toUpperCase() : `INV-${roomCode.slice(-6)}`,
      title: title.trim(),
      description: description?.trim() || '',
      category,
      hostId: hostId || 'host_user',
      hostName: hostName || 'Program Host',
      hostRole: hostRole || 'Organizer',
      hostAvatar: hostAvatar || '',
      scheduledDate: scheduledDate || new Date().toISOString().split('T')[0],
      scheduledTime: scheduledTime || '14:00',
      durationMinutes: Number(durationMinutes),
      status: 'scheduled',
      tags: Array.isArray(tags) ? tags : [],
      attendeesCount: 1,
      createdAt: new Date().toISOString(),
    };

    activePrograms = [newProgram, ...activePrograms];

    return NextResponse.json({
      success: true,
      program: newProgram,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error creating program' }, { status: 500 });
  }
}
