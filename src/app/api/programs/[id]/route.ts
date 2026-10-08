import { NextRequest, NextResponse } from 'next/server';
import { ConveneProgram } from '@/types/program';
import { INITIAL_PROGRAMS } from '@/lib/program-defaults';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const program = INITIAL_PROGRAMS.find(
      (p) => p.id === id || p.roomCode.toUpperCase() === id.toUpperCase()
    );

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      program,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching program' }, { status: 500 });
  }
}
