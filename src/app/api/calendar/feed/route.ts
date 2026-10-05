import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { INITIAL_SCHEDULED_CONFERENCES, ScheduledConference } from '@/types/schedule';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('user');
    const token = req.nextUrl.searchParams.get('token');

    let conferences: ScheduledConference[] = INITIAL_SCHEDULED_CONFERENCES;
    const db = getDb();

    if (db) {
      try {
        let query = 'SELECT * FROM scheduled_conferences';
        let params: any[] = [];
        if (userId) {
          query = 'SELECT * FROM scheduled_conferences WHERE host_id = ?';
          params = [userId];
        }
        const stmt = db.prepare(query);
        const rows = (params.length ? stmt.all(params[0]) : stmt.all()) as any[];
        if (rows && rows.length > 0) {
          conferences = rows.map(r => ({
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
        }
      } catch (err) {
        console.warn('DB feed fetch warning:', err);
      }
    }

    let icsEvents = '';
    conferences.forEach(c => {
      const icsDate = c.date.replace(/-/g, '') + 'T' + c.time.replace(/:/g, '') + '00';
      icsEvents += `
BEGIN:VEVENT
UID:${c.id}@convene.rupal.tech
SUMMARY:${c.title}
DESCRIPTION:${c.description}\\nRoom: ${c.roomCode}\\nInvite: ${c.inviteCode}
DTSTART:${icsDate}
DURATION:PT${c.durationMinutes}M
STATUS:CONFIRMED
END:VEVENT`;
    });

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Rupal Convene//Calendar Live Feed//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Rupal Convene Schedule
${icsEvents}
END:VCALENDAR`;

    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'inline; filename="convene-calendar.ics"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

