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
  roomCode: string;
  inviteCode: string;
  attendeesCount: number;
  tags: string[];
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
    roomCode: 'RUPAL-702-CORP',
    inviteCode: 'INV-702BOD',
    attendeesCount: 12,
    tags: ['Executive', 'Board', 'Compliance']
  }
];
