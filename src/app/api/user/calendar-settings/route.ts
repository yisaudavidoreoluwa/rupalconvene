import { NextRequest, NextResponse } from 'next/server';
import { getDefaultCalendarSettings } from '@/types/schedule';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId') || 'guest_user';
    const db = getDb();
    if (db) {
      try {
        const stmt = db.prepare('SELECT * FROM user_calendar_settings WHERE user_id = ?');
        const row = stmt.get(userId) as any;
        if (row) {
          return NextResponse.json({
            settings: {
              userId: row.user_id,
              timezone: row.timezone,
              workingHoursStart: row.working_hours_start,
              workingHoursEnd: row.working_hours_end,
              workingDays: JSON.parse(row.working_days_json || '[1,2,3,4,5]'),
              defaultDurationMinutes: row.default_duration,
              bufferMinutes: row.buffer_minutes,
              defaultCategory: row.default_category,
              autoEnableNotes: Boolean(row.auto_enable_notes),
              autoEnableGreenRoom: Boolean(row.auto_enable_green_room),
              notifyMinutesBefore: row.notify_minutes_before,
              connectedCalendars: JSON.parse(row.connected_calendars_json || '{"google":false,"outlook":false,"appleIcal":true}'),
              icalFeedToken: row.ical_feed_token || 'feed_token',
            }
          });
        }
      } catch (err) {
        console.warn('DB settings read warning:', err);
      }
    }

    return NextResponse.json({ settings: getDefaultCalendarSettings(userId) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.userId || 'guest_user';
    const db = getDb();
    if (db) {
      try {
        db.exec(`
          CREATE TABLE IF NOT EXISTS user_calendar_settings (
            user_id TEXT PRIMARY KEY,
            timezone TEXT DEFAULT 'UTC',
            working_hours_start TEXT DEFAULT '09:00',
            working_hours_end TEXT DEFAULT '18:00',
            working_days_json TEXT,
            default_duration INTEGER DEFAULT 45,
            buffer_minutes INTEGER DEFAULT 5,
            default_category TEXT DEFAULT 'engineering',
            auto_enable_notes INTEGER DEFAULT 1,
            auto_enable_green_room INTEGER DEFAULT 1,
            notify_minutes_before INTEGER DEFAULT 10,
            connected_calendars_json TEXT,
            ical_feed_token TEXT,
            updated_at TEXT NOT NULL
          );
        `);

        const stmt = db.prepare(`
          INSERT OR REPLACE INTO user_calendar_settings (
            user_id, timezone, working_hours_start, working_hours_end, working_days_json,
            default_duration, buffer_minutes, default_category, auto_enable_notes,
            auto_enable_green_room, notify_minutes_before, connected_calendars_json,
            ical_feed_token, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
          userId,
          body.timezone || 'UTC',
          body.workingHoursStart || '09:00',
          body.workingHoursEnd || '18:00',
          JSON.stringify(body.workingDays || [1, 2, 3, 4, 5]),
          body.defaultDurationMinutes || 45,
          body.bufferMinutes || 5,
          body.defaultCategory || 'engineering',
          body.autoEnableNotes ? 1 : 0,
          body.autoEnableGreenRoom ? 1 : 0,
          body.notifyMinutesBefore || 10,
          JSON.stringify(body.connectedCalendars || {}),
          body.icalFeedToken || 'feed_token',
          new Date().toISOString()
        );
      } catch (err) {
        console.warn('DB settings save warning:', err);
      }
    }

    return NextResponse.json({ success: true, settings: body });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

