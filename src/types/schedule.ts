export interface ScheduledConference {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM (24h)
  durationMinutes: number;
  category: 'keynote' | 'engineering' | 'investor' | 'product' | 'general' | 'hackathon' | 'workshop' | 'meetup' | 'broadcast' | 'bootcamp' | 'architecture-demo';
  hostName: string;
  hostAvatar?: string;
  hostRole?: string;
  hostId?: string;
  hostEmail?: string;
  roomCode: string;
  inviteCode: string;
  attendeesCount: number;
  tags: string[];
  enableNotes?: boolean;
  enableGreenRoom?: boolean;
  timezone?: string;
  createdAt?: string;
}

export interface UserCalendarSettings {
  userId: string;
  timezone: string; // e.g. 'UTC', 'America/New_York', 'Europe/London', etc.
  workingHoursStart: string; // '09:00'
  workingHoursEnd: string; // '18:00'
  workingDays: number[]; // [1, 2, 3, 4, 5] (Monday - Friday)
  defaultDurationMinutes: number; // 15, 30, 45, 60
  bufferMinutes: number; // 0, 5, 10, 15
  defaultCategory: 'keynote' | 'engineering' | 'investor' | 'product' | 'general' | 'hackathon' | 'workshop' | 'meetup' | 'broadcast' | 'bootcamp' | 'architecture-demo';
  autoEnableNotes: boolean; // default true
  autoEnableGreenRoom: boolean; // default true
  notifyMinutesBefore: number; // 5, 10, 15, 30
  connectedCalendars: {
    google: boolean;
    googleEmail?: string;
    outlook: boolean;
    outlookEmail?: string;
    appleIcal: boolean;
  };
  icalFeedToken: string;
}

export function getDefaultCalendarSettings(userId: string): UserCalendarSettings {
  let detectedTimezone = 'UTC';
  try {
    if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
      detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    }
  } catch {}

  return {
    userId,
    timezone: detectedTimezone,
    workingHoursStart: '09:00',
    workingHoursEnd: '18:00',
    workingDays: [1, 2, 3, 4, 5],
    defaultDurationMinutes: 45,
    bufferMinutes: 5,
    defaultCategory: 'engineering',
    autoEnableNotes: true,
    autoEnableGreenRoom: true,
    notifyMinutesBefore: 10,
    connectedCalendars: {
      google: false,
      outlook: false,
      appleIcal: true,
    },
    icalFeedToken: `feed_${Math.random().toString(36).slice(2, 10)}`,
  };
}

export function getGoogleCalendarLink(conf: ScheduledConference, origin = 'https://rupalconvene.vercel.app'): string {
  const startIso = conf.date.replace(/-/g, '') + 'T' + conf.time.replace(/:/g, '') + '00Z';
  const startHour = parseInt(conf.time.split(':')[0] || '0', 10);
  const startMin = parseInt(conf.time.split(':')[1] || '0', 10);
  const totalMin = startHour * 60 + startMin + conf.durationMinutes;
  const endHour = String(Math.floor(totalMin / 60) % 24).padStart(2, '0');
  const endMin = String(totalMin % 60).padStart(2, '0');
  const endIso = conf.date.replace(/-/g, '') + 'T' + endHour + endMin + '00Z';

  const details = encodeURIComponent(
    `${conf.description}\n\nJoin Link: ${origin}/?room=${conf.roomCode}&invite=${conf.inviteCode}\nRoom Code: ${conf.roomCode}\nPasscode: ${conf.inviteCode}`
  );
  const title = encodeURIComponent(conf.title);
  const location = encodeURIComponent(`${origin}/?room=${conf.roomCode}`);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${startIso}/${endIso}`;
}

export function getOutlookCalendarLink(conf: ScheduledConference, origin = 'https://rupalconvene.vercel.app'): string {
  const title = encodeURIComponent(conf.title);
  const details = encodeURIComponent(
    `${conf.description}\n\nJoin Link: ${origin}/?room=${conf.roomCode}&invite=${conf.inviteCode}\nRoom Code: ${conf.roomCode}\nPasscode: ${conf.inviteCode}`
  );
  const location = encodeURIComponent(`${origin}/?room=${conf.roomCode}`);
  const startDt = `${conf.date}T${conf.time}:00`;

  return `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${title}&body=${details}&location=${location}&startdt=${startDt}`;
}

export const INITIAL_SCHEDULED_CONFERENCES: ScheduledConference[] = [];


