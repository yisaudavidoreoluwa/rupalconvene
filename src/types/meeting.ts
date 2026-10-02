export type ParticipantRole = 
  | 'host' 
  | 'co-host' 
  | 'tech-lead' 
  | 'developer' 
  | 'business-partner' 
  | 'investor' 
  | 'guest';

export interface Participant {
  id: string;
  name: string;
  email: string;
  role: ParticipantRole;
  avatar: string;
  organization: string;
  jobTitle: string;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  isSpeaking: boolean;
  handRaised: boolean;
  inGreenRoom: boolean;
  isPinned?: boolean;
  audioLevel?: number; // 0 to 100
  stream?: MediaStream | null;
}

export type ActiveWorkspaceTab = 
  | 'stage' 
  | 'code-ide' 
  | 'whiteboard' 
  | 'pitch-deck' 
  | 'agenda' 
  | 'ai-intelligence';

export type StageLayout = 
  | 'gallery' 
  | 'speaker-focus' 
  | 'split-workspace' 
  | 'pip';

export interface CodeFile {
  id: string;
  name: string;
  language: 'typescript' | 'javascript' | 'python' | 'go' | 'rust' | 'sql' | 'json';
  content: string;
  isEntrypoint?: boolean;
}

export interface TerminalLog {
  id: string;
  type: 'stdout' | 'stderr' | 'system' | 'benchmark';
  text: string;
  timestamp: string;
}

export interface WhiteboardElement {
  id: string;
  type: 'rect' | 'circle' | 'cloud' | 'database' | 'service' | 'arrow' | 'text' | 'sticky';
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  color: string;
  fillColor?: string;
  toElementId?: string;
}

export interface SlideMetric {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
}

export interface PitchSlide {
  id: number;
  title: string;
  category: string;
  subtitle: string;
  bulletPoints: string[];
  metrics?: SlideMetric[];
  speakerNotes: string;
  codeSnippet?: string;
  diagramSnippet?: string;
  imageUrl?: string;
  fileUrl?: string;
  fileType?: string;
  fileSizeBytes?: number;
}

export interface AgendaItem {
  id: string;
  title: string;
  time: string;
  durationMinutes: number;
  speakerIds: string[];
  status: 'completed' | 'current' | 'upcoming';
  track: 'Engineering' | 'Executive' | 'Product' | 'Joint';
  description: string;
  resources?: { name: string; url: string }[];
}

export interface ActionItem {
  id: string;
  task: string;
  assignee: string;
  assigneeRole: string;
  priority: 'high' | 'medium' | 'low';
  due: string;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface MeetingMinutes {
  id: string;
  generatedAt: string;
  executiveSummary: string;
  keyTechnicalDecisions: string[];
  actionItems: ActionItem[];
  risksAndBlockers: string[];
  investorHighlights: string[];
}

export interface LiveCaption {
  id: string;
  speakerId: string;
  speakerName: string;
  speakerRole: ParticipantRole;
  text: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: ParticipantRole;
  senderAvatar: string;
  text: string;
  timestamp: string;
  type: 'chat' | 'qa' | 'code-share' | 'system';
  upvotes?: number;
  resolved?: boolean;
  codeSnippet?: {
    language: string;
    code: string;
  };
}

export interface MeetingSession {
  roomCode: string;
  title: string;
  description: string;
  startedAt: string;
  isRecording: boolean;
  isLocked: boolean;
  isWatermarkActive: boolean;
  watermarkText: string;
  activeTab: ActiveWorkspaceTab;
  activeLayout: StageLayout;
}
