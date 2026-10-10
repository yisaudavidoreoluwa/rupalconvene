import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ScheduledConference, INITIAL_SCHEDULED_CONFERENCES } from '@/types/schedule';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    const db = getDb();

    if (db) {
      try {
        db.exec(`
          CREATE TABLE IF NOT EXISTS scheduled_conferences (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            duration_minutes INTEGER DEFAULT 45,
            category TEXT DEFAULT 'general',
            host_id TEXT NOT NULL,
            host_name TEXT NOT NULL,
            host_avatar TEXT,
            host_role TEXT,
            room_code TEXT UNIQUE NOT NULL,
            invite_code TEXT NOT NULL,
            attendees_count INTEGER DEFAULT 1,
            tags_json TEXT,
            enable_notes INTEGER DEFAULT 1,
            enable_green_room INTEGER DEFAULT 1,
            timezone TEXT,
            created_at TEXT NOT NULL
          );
        `);

        // Ensure legacy dummy records are cleaned out so users start fresh
        db.exec(`DELETE FROM scheduled_conferences WHERE id LIKE 'conf-%';`);

        let query = 'SELECT * FROM scheduled_conferences ORDER BY date ASC, time ASC';
        let params: any[] = [];
        if (userId) {
          query = 'SELECT * FROM scheduled_conferences WHERE host_id = ? ORDER BY date ASC, time ASC';
          params = [userId];
        }

        const stmt = db.prepare(query);
        const rows = (params.length ? stmt.all(params[0]) : stmt.all()) as any[];

        if (rows && rows.length > 0) {
          const list: ScheduledConference[] = rows.map(r => ({
            id: r.id,
            title: r.title,
            description: r.description || '',
            date: r.date,
            time: r.time,
            durationMinutes: r.duration_minutes,
            category: r.category,
            hostName: r.host_name,
            hostAvatar: r.host_avatar || '',
            hostRole: r.host_role || '',
            hostId: r.host_id,
            roomCode: r.room_code,
            inviteCode: r.invite_code,
            attendeesCount: r.attendees_count,
            tags: JSON.parse(r.tags_json || '[]'),
            enableNotes: Boolean(r.enable_notes),
            enableGreenRoom: Boolean(r.enable_green_room),
            timezone: r.timezone || 'UTC',
            createdAt: r.created_at,
          }));

          return NextResponse.json({ conferences: list });
        }
      } catch (err) {
        console.warn('DB schedule fetch warning:', err);
      }
    }

    // Default clean fallback
    return NextResponse.json({ conferences: [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: ScheduledConference = await req.json();
    const db = getDb();

    if (db) {
      try {
        db.exec(`
          CREATE TABLE IF NOT EXISTS scheduled_conferences (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            duration_minutes INTEGER DEFAULT 45,
            category TEXT DEFAULT 'general',
            host_id TEXT NOT NULL,
            host_name TEXT NOT NULL,
            host_avatar TEXT,
            host_role TEXT,
            room_code TEXT UNIQUE NOT NULL,
            invite_code TEXT NOT NULL,
            attendees_count INTEGER DEFAULT 1,
            tags_json TEXT,
            enable_notes INTEGER DEFAULT 1,
            enable_green_room INTEGER DEFAULT 1,
            timezone TEXT,
            created_at TEXT NOT NULL
          );
        `);

        const stmt = db.prepare(`
          INSERT OR REPLACE INTO scheduled_conferences (
            id, title, description, date, time, duration_minutes, category,
            host_id, host_name, host_avatar, host_role, room_code, invite_code,
            attendees_count, tags_json, enable_notes, enable_green_room, timezone, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
          body.id,
          body.title,
          body.description || '',
          body.date,
          body.time,
          body.durationMinutes || 45,
          body.category || 'general',
          body.hostId || 'guest_host',
          body.hostName || 'Meeting Host',
          body.hostAvatar || '',
          body.hostRole || 'Host',
          body.roomCode,
          body.inviteCode,
          body.attendeesCount || 1,
          JSON.stringify(body.tags || []),
          body.enableNotes ? 1 : 0,
          body.enableGreenRoom ? 1 : 0,
          body.timezone || 'UTC',
          body.createdAt || new Date().toISOString()
        );
      } catch (err) {
        console.warn('DB schedule insert warning:', err);
      }
    }

    return NextResponse.json({ success: true, conference: body });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing schedule id' }, { status: 400 });
    }

    const db = getDb();
    if (db) {
      try {
        const stmt = db.prepare('DELETE FROM scheduled_conferences WHERE id = ?');
        stmt.run(id);
      } catch (err) {
        console.warn('DB schedule delete warning:', err);
      }
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

