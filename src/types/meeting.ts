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

export type CodeLanguage = 
  | 'typescript' 
  | 'javascript' 
  | 'html' 
  | 'css' 
  | 'markdown' 
  | 'python' 
  | 'go' 
  | 'rust' 
  | 'sql' 
  | 'json' 
  | 'xml';

export interface CodeFile {
  id: string;
  name: string;
  language: CodeLanguage;
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
  type: 'rect' | 'circle' | 'cloud' | 'database' | 'service' | 'arrow' | 'text' | 'sticky' | 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  color: string;
  fillColor?: string;
  toElementId?: string;
  imageUrl?: string;
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

export interface RoomRecord {
  id: string;
  roomCode: string;
  title: string;
  description?: string;
  hostId: string;
  inviteCode: string;
  isInviteOnly: boolean;
  isRecording?: boolean;
  isLocked?: boolean;
  isWatermarkActive?: boolean;
  status: string;
  startedAt: string;
  endedAt?: string | null;
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

export interface DrawingStroke {
  id: string;
  tool: 'pen' | 'brush' | 'line' | 'arrow' | 'rect';
  points: { x: number; y: number }[];
  color: string;
  size: number;
}

export interface RoomPermissions {
  codeEditMode: 'host-only' | 'everyone' | 'selected';
  allowedEditorIds: string[];
  handsOnDeck: boolean;
  allowedPresenterIds: string[];
  whiteboardDrawMode?: 'host-only' | 'everyone' | 'selected';
  allowedWhiteboardIds?: string[];
}

export interface AccessRequest {
  id: string;
  type: 'code-edit' | 'hands-on-deck' | 'whiteboard-draw';
  userId: string;
  userName: string;
  timestamp: string;
}

