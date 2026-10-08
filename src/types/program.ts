export type ProgramCategory = 
  | 'hackathon' 
  | 'workshop' 
  | 'meetup' 
  | 'broadcast' 
  | 'bootcamp' 
  | 'architecture-demo';

export interface ProgramCategoryMeta {
  id: ProgramCategory;
  title: string;
  subtitle: string;
  iconName: 'Zap' | 'Wrench' | 'Users' | 'Radio' | 'GraduationCap' | 'Building2';
  iconEmoji: string;
  accentColor: string;
  badgeBg: string;
  defaultDurationMinutes: number;
  highlightDescription: string;
  keyFeatures: string[];
}

export const PROGRAM_CATEGORIES_META: Record<ProgramCategory, ProgramCategoryMeta> = {
  'hackathon': {
    id: 'hackathon',
    title: 'Hackathon',
    subtitle: 'Competitive 24–48h developer build sprint',
    iconName: 'Zap',
    iconEmoji: '⚡',
    accentColor: '#2563eb',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    defaultDurationMinutes: 1440, // 24h default
    highlightDescription: 'Built for high-energy sprints with live countdown clock, team breakout squads, project submission staging, and real-time judging leaderboards.',
    keyFeatures: ['24-48h Sprint Clock', 'Team Breakout Squads', 'Project Submission Portal', 'Live Judging Leaderboard']
  },
  'workshop': {
    id: 'workshop',
    title: 'Hands-on Workshop',
    subtitle: 'In-depth code labs and system tutorials',
    iconName: 'Wrench',
    iconEmoji: '🛠️',
    accentColor: '#d97706',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    defaultDurationMinutes: 120, // 2h default
    highlightDescription: 'Interactive coding tutorials with step-by-step lab instructions, 1-click code copying into the IDE, instructor checkpoint pushes, and TA help queue.',
    keyFeatures: ['Step-by-Step Code Labs', 'Copy-to-IDE Integration', 'Instructor Checkpoint Push', 'Mentor / TA Help Queue']
  },
  'meetup': {
    id: 'meetup',
    title: 'Developer Meetup',
    subtitle: 'Community tech gathering & lightning talks',
    iconName: 'Users',
    iconEmoji: '👥',
    accentColor: '#059669',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    defaultDurationMinutes: 90, // 1.5h default
    highlightDescription: 'Community gatherings featuring 5-minute lightning talk timers with visual warnings, speaker lineup management, community-upvoted Q&A, and virtual reactions.',
    keyFeatures: ['Lightning Talk Timer (5/10 min)', 'Speaker Lineup Queue', 'Upvoted Community Q&A', 'Virtual Applause & Soundboard']
  },
  'broadcast': {
    id: 'broadcast',
    title: 'Virtual Broadcast',
    subtitle: 'Global technical webinar or town hall',
    iconName: 'Radio',
    iconEmoji: '📡',
    accentColor: '#e11d48',
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
    defaultDurationMinutes: 60, // 1h default
    highlightDescription: 'Webinar-scale broadcast with stage presenter vs audience separation, live interactive polls with real-time percentages, audience hand-raise promotion, and stream health metrics.',
    keyFeatures: ['Stage Presenters vs Audience', 'Live Audience Polling', 'Audience Stage Promotion', 'Live Stream Metrics HUD']
  },
  'bootcamp': {
    id: 'bootcamp',
    title: 'University Bootcamp',
    subtitle: 'Student training & career incubator',
    iconName: 'GraduationCap',
    iconEmoji: '🎓',
    accentColor: '#4f46e5',
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    defaultDurationMinutes: 180, // 3h default
    highlightDescription: 'Structured cohorts with student roll-call attendance check-in, curriculum syllabus module checklists, code review assignment submissions, and verifiable digital certificates.',
    keyFeatures: ['Roll Call & Attendance Check-in', 'Curriculum Module Tracker', 'Assignment Code Review', 'Certificate Generator']
  },
  'architecture-demo': {
    id: 'architecture-demo',
    title: 'Architecture Demo',
    subtitle: 'Executive symposium or industry tech day',
    iconName: 'Building2',
    iconEmoji: '🏢',
    accentColor: '#0284c7',
    badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
    defaultDurationMinutes: 75, // 1h 15m default
    highlightDescription: 'Enterprise architecture reviews with pre-loaded microservices blueprints for whiteboard, executive deal room document vault, hands-on-deck presenter handoff, and spec exports.',
    keyFeatures: ['Pre-loaded Whiteboard Topologies', 'Executive Deal Room & SLA Vault', 'Hands-on-Deck Presenter Baton', 'Architecture Spec Export']
  }
};

// -------------------------------------------------------------
// HACKATHON DATA MODELS
// -------------------------------------------------------------
export interface HackathonSquad {
  id: string;
  name: string;
  leadName: string;
  membersCount: number;
  projectTitle: string;
  track: string;
  avatarColor: string;
}

export interface HackathonProject {
  id: string;
  squadName: string;
  projectTitle: string;
  tagline: string;
  githubUrl: string;
  demoUrl: string;
  techStack: string[];
  submittedAt: string;
  scores: {
    innovation: number; // 1 - 10
    technical: number;
    uiux: number;
    impact: number;
  };
  totalScore: number;
}

// -------------------------------------------------------------
// WORKSHOP DATA MODELS
// -------------------------------------------------------------
export interface WorkshopLabStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  codeSnippet: string;
  language: string;
  targetFile: string;
  expectedOutput: string;
  isCompleted: boolean;
}

export interface MentorHelpRequest {
  id: string;
  studentName: string;
  studentAvatar: string;
  stepNumber: number;
  question: string;
  requestedAt: string;
  status: 'waiting' | 'in-progress' | 'resolved';
}

// -------------------------------------------------------------
// MEETUP DATA MODELS
// -------------------------------------------------------------
export interface MeetupSpeaker {
  id: string;
  name: string;
  avatar: string;
  role: string;
  talkTitle: string;
  topicBadge: string;
  durationMinutes: number;
  status: 'upcoming' | 'speaking' | 'completed';
}

// -------------------------------------------------------------
// BROADCAST DATA MODELS
// -------------------------------------------------------------
export interface BroadcastPoll {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    votes: number;
  }[];
  totalVotes: number;
  isActive: boolean;
  userVotedOptionId?: string;
}

// -------------------------------------------------------------
// BOOTCAMP DATA MODELS
// -------------------------------------------------------------
export interface BootcampAttendance {
  studentId: string;
  studentName: string;
  studentAvatar: string;
  email: string;
  isCheckedIn: boolean;
  checkInTime?: string;
}

export interface BootcampModule {
  id: string;
  moduleNumber: number;
  title: string;
  topics: string[];
  isCompleted: boolean;
}

export interface BootcampCertificate {
  certificateId: string;
  studentName: string;
  courseName: string;
  issueDate: string;
  instructorName: string;
  verificationHash: string;
}

// -------------------------------------------------------------
// ARCHITECTURE DEMO DATA MODELS
// -------------------------------------------------------------
export interface ArchitectureTopology {
  id: string;
  title: string;
  description: string;
  category: string;
  nodesCount: number;
  elements: any[]; // Whiteboard elements
}

// -------------------------------------------------------------
// PROGRAM INSTANCE (STORED IN DB & ACTIVE IN MEETING)
// -------------------------------------------------------------
export interface ConveneProgram {
  id: string;
  roomCode: string;
  inviteCode: string;
  title: string;
  description: string;
  category: ProgramCategory;
  hostId: string;
  hostName: string;
  hostAvatar?: string;
  hostRole?: string;
  scheduledDate: string;
  scheduledTime: string;
  durationMinutes: number;
  status: 'scheduled' | 'live' | 'completed';
  tags: string[];
  attendeesCount: number;
  
  // Category-specific configurations & state
  hackathonConfig?: {
    sprintHours: number;
    endsAt: string;
    squads: HackathonSquad[];
    projects: HackathonProject[];
    isSubmissionsOpen: boolean;
  };
  workshopConfig?: {
    labTitle: string;
    activeStepIndex: number;
    steps: WorkshopLabStep[];
    helpRequests: MentorHelpRequest[];
  };
  meetupConfig?: {
    currentSpeakerId?: string;
    speakers: MeetupSpeaker[];
    lightningSecondsRemaining: number;
    isTimerRunning: boolean;
  };
  broadcastConfig?: {
    viewerCount: number;
    stageHostIds: string[];
    polls: BroadcastPoll[];
  };
  bootcampConfig?: {
    cohortName: string;
    modules: BootcampModule[];
    attendance: BootcampAttendance[];
  };
  architectureConfig?: {
    activeTopologyId: string;
    specSummary: string;
  };

  createdAt: string;
  updatedAt?: string;
}
