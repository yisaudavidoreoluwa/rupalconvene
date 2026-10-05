export interface ScheduledConference {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM (24h)
  durationMinutes: number;
  category: 'keynote' | 'engineering' | 'investor' | 'product' | 'general';
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
  defaultCategory: 'keynote' | 'engineering' | 'investor' | 'product' | 'general';
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

export const INITIAL_SCHEDULED_CONFERENCES: ScheduledConference[] = [
  {
    id: 'conf-1',
    title: 'Q4 Global Engineering & Distributed Mesh Keynote',
    description: 'Executive roadmap presentation on sub-10ms WebRTC SFU topologies, edge token bucket rate limiting, and Gemini 3.5 live intelligence.',
    date: '2026-10-06',
    time: '14:00',
    durationMinutes: 60,
    category: 'keynote',
    hostName: 'Aarav Mehta',
    hostAvatar: '/attendees/speaker-tl.png',
    hostRole: 'Tech Lead',
    hostId: 'host-aarav',
    roomCode: 'RUPAL-914-SYNC',
    inviteCode: 'INV-914KEY',
    attendeesCount: 42,
    tags: ['Keynote', 'WebRTC', 'Architecture', 'AI']
  },
  {
    id: 'conf-2',
    title: 'Series B Syndicate Term Sheet Review',
    description: 'Financial covenants review, unit economics, 184% YoY ARR metrics, and capital allocation plan with partner syndicate.',
    date: '2026-10-10',
    time: '16:30',
    durationMinutes: 45,
    category: 'investor',
    hostName: 'Elena Rostova',
    hostAvatar: '/attendees/attendee-tr.png',
    hostRole: 'Managing Partner',
    hostId: 'host-elena',
    roomCode: 'RUPAL-420-CORP',
    inviteCode: 'INV-420VC8',
    attendeesCount: 8,
    tags: ['Syndicate', 'Investor Review', 'Series B']
  },
  {
    id: 'conf-3',
    title: 'Distributed Edge Mesh Architecture Sync',
    description: 'Hands-on architectural review of Kafka event backplane, WebSocket heartbeat state, and zero-trust DTLS-SRTP encryption standards.',
    date: '2026-10-14',
    time: '11:00',
    durationMinutes: 45,
    category: 'engineering',
    hostName: 'Marcus Vance',
    hostAvatar: '/attendees/attendee-bl.png',
    hostRole: 'Principal Architect',
    hostId: 'host-marcus',
    roomCode: 'RUPAL-804-SYNC',
    inviteCode: 'INV-804ARC',
    attendeesCount: 16,
    tags: ['Edge Routing', 'Kafka', 'Security']
  },
  {
    id: 'conf-4',
    title: 'Rupal Convene 2.0 Product Launch & Live Sandbox',
    description: 'Public interactive walkthrough of real-time multi-tenant IDE sandbox, side-by-side rendering engine, and Gemini auto-minutes.',
    date: '2026-10-22',
    time: '15:00',
    durationMinutes: 90,
    category: 'product',
    hostName: 'David Kim',
    hostAvatar: '/attendees/attendee-br.png',
    hostRole: 'Staff Systems Engineer',
    hostId: 'host-david',
    roomCode: 'RUPAL-550-LIVE',
    inviteCode: 'INV-550DEM',
    attendeesCount: 120,
    tags: ['Product Launch', 'Live Sandbox', 'Showcase']
  },
  {
    id: 'conf-5',
    title: 'Executive Board Strategy & Partner Summit',
    description: 'Quarterly board meeting aligning international expansion, enterprise SLAs, and SOC2/HIPAA compliance certifications.',
    date: '2026-10-28',
    time: '13:00',
    durationMinutes: 60,
    category: 'keynote',
    hostName: 'Conference Host',
    hostRole: 'Executive Chair',
    hostId: 'host-board',
    roomCode: 'RUPAL-702-CORP',
    inviteCode: 'INV-702BOD',
    attendeesCount: 12,
    tags: ['Executive', 'Board', 'Compliance']
  }
];
