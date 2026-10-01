import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'rupal_convene.db');

let dbInstance: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(DB_PATH);
    initSchema(dbInstance);
  }
  return dbInstance;
}

function initSchema(db: DatabaseSync) {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      avatar TEXT,
      provider TEXT DEFAULT 'email',
      role TEXT DEFAULT 'developer',
      organization TEXT DEFAULT 'Rupal Tech Solutions',
      job_title TEXT DEFAULT 'Software Engineer',
      password_hash TEXT,
      tier TEXT DEFAULT 'Developer Pro',
      is_verified INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Rooms table
  db.exec(`
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      room_code TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      host_id TEXT NOT NULL,
      is_recording INTEGER DEFAULT 0,
      is_locked INTEGER DEFAULT 0,
      is_watermark_active INTEGER DEFAULT 1,
      status TEXT DEFAULT 'active',
      started_at TEXT NOT NULL,
      ended_at TEXT
    );
  `);

  // Participants table
  db.exec(`
    CREATE TABLE IF NOT EXISTS participants (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      avatar TEXT,
      is_muted INTEGER DEFAULT 0,
      is_video_off INTEGER DEFAULT 0,
      in_green_room INTEGER DEFAULT 0,
      joined_at TEXT NOT NULL
    );
  `);

  // Messages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      sender_role TEXT NOT NULL,
      sender_avatar TEXT,
      text TEXT NOT NULL,
      type TEXT DEFAULT 'chat',
      code_snippet TEXT,
      upvotes INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);

  // Code files table
  db.exec(`
    CREATE TABLE IF NOT EXISTS code_files (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL,
      name TEXT NOT NULL,
      language TEXT NOT NULL,
      content TEXT NOT NULL,
      is_entrypoint INTEGER DEFAULT 0,
      updated_at TEXT NOT NULL
    );
  `);

  // Whiteboard table
  db.exec(`
    CREATE TABLE IF NOT EXISTS whiteboard_data (
      id TEXT PRIMARY KEY,
      room_id TEXT UNIQUE NOT NULL,
      elements_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Pitch decks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS pitch_decks (
      id TEXT PRIMARY KEY,
      room_id TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      slides_json TEXT NOT NULL,
      watermark_text TEXT,
      updated_at TEXT NOT NULL
    );
  `);

  // Meeting minutes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS meeting_minutes (
      id TEXT PRIMARY KEY,
      room_id TEXT UNIQUE NOT NULL,
      executive_summary TEXT,
      technical_decisions_json TEXT,
      action_items_json TEXT,
      risks_json TEXT,
      investor_highlights_json TEXT,
      generated_at TEXT NOT NULL
    );
  `);

  // Storage files table
  db.exec(`
    CREATE TABLE IF NOT EXISTS storage_files (
      id TEXT PRIMARY KEY,
      room_id TEXT,
      uploader_id TEXT,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      storage_path TEXT NOT NULL,
      public_url TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
}

// User helpers
export function dbCreateUser(user: {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider?: string;
  role?: string;
  organization?: string;
  jobTitle?: string;
  passwordHash?: string;
  tier?: string;
  isVerified?: boolean;
}) {
  const db = getDb();
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO users (
      id, name, email, avatar, provider, role, organization, job_title, password_hash, tier, is_verified, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    user.id,
    user.name,
    user.email,
    user.avatar || '',
    user.provider || 'email',
    user.role || 'developer',
    user.organization || 'Rupal Tech Solutions',
    user.jobTitle || 'Software Engineer',
    user.passwordHash || '',
    user.tier || 'Developer Pro',
    user.isVerified ? 1 : 0,
    now,
    now
  );
  return dbFindUserByEmail(user.email);
}

export function dbFindUserByEmail(email: string) {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  const row = stmt.get(email) as any;
  if (!row) return null;
  return formatUserRow(row);
}

export function dbFindUserById(id: string) {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  const row = stmt.get(id) as any;
  if (!row) return null;
  return formatUserRow(row);
}

function formatUserRow(row: any) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    avatar: row.avatar,
    provider: row.provider,
    role: row.role,
    organization: row.organization,
    jobTitle: row.job_title,
    passwordHash: row.password_hash,
    tier: row.tier,
    isVerified: Boolean(row.is_verified),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Room helpers
export function dbCreateRoom(room: {
  id?: string;
  roomCode: string;
  title: string;
  description?: string;
  hostId: string;
  isWatermarkActive?: boolean;
}) {
  const db = getDb();
  const id = room.id || 'room_' + Date.now().toString(36);
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO rooms (
      id, room_code, title, description, host_id, is_recording, is_locked, is_watermark_active, status, started_at
    ) VALUES (?, ?, ?, ?, ?, 0, 0, ?, 'active', ?)
  `);
  stmt.run(
    id,
    room.roomCode,
    room.title,
    room.description || '',
    room.hostId,
    room.isWatermarkActive === false ? 0 : 1,
    now
  );
  return dbGetRoomByCode(room.roomCode);
}

export function dbGetRoomByCode(code: string) {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM rooms WHERE room_code = ?');
  const row = stmt.get(code) as any;
  if (!row) return null;
  return {
    id: row.id,
    roomCode: row.room_code,
    title: row.title,
    description: row.description,
    hostId: row.host_id,
    isRecording: Boolean(row.is_recording),
    isLocked: Boolean(row.is_locked),
    isWatermarkActive: Boolean(row.is_watermark_active),
    status: row.status,
    startedAt: row.started_at,
    endedAt: row.ended_at,
  };
}

export function dbGetRecentRooms(limit = 10) {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM rooms ORDER BY started_at DESC LIMIT ?');
  const rows = stmt.all(limit) as any[];
  return rows.map((r) => ({
    id: r.id,
    roomCode: r.room_code,
    title: r.title,
    hostId: r.host_id,
    status: r.status,
    startedAt: r.started_at,
  }));
}

// Participant helpers
export function dbAddParticipant(p: {
  id: string;
  roomId: string;
  userId: string;
  name: string;
  role: string;
  avatar?: string;
}) {
  const db = getDb();
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO participants (
      id, room_id, user_id, name, role, avatar, is_muted, is_video_off, in_green_room, joined_at
    ) VALUES (?, ?, ?, ?, ?, ?, 0, 0, 0, ?)
  `);
  stmt.run(p.id, p.roomId, p.userId, p.name, p.role, p.avatar || '', now);
}

export function dbGetParticipants(roomId: string) {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM participants WHERE room_id = ?');
  const rows = stmt.all(roomId) as any[];
  return rows.map((r) => ({
    id: r.id,
    roomId: r.room_id,
    userId: r.user_id,
    name: r.name,
    role: r.role,
    avatar: r.avatar,
    isMuted: Boolean(r.is_muted),
    isVideoOff: Boolean(r.is_video_off),
    inGreenRoom: Boolean(r.in_green_room),
    joinedAt: r.joined_at,
  }));
}

// Messages helpers
export function dbSaveMessage(msg: {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderAvatar?: string;
  text: string;
  type?: string;
  codeSnippet?: any;
}) {
  const db = getDb();
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO messages (
      id, room_id, sender_id, sender_name, sender_role, sender_avatar, text, type, code_snippet, upvotes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
  `);
  stmt.run(
    msg.id,
    msg.roomId,
    msg.senderId,
    msg.senderName,
    msg.senderRole,
    msg.senderAvatar || '',
    msg.text,
    msg.type || 'chat',
    msg.codeSnippet ? JSON.stringify(msg.codeSnippet) : null,
    now
  );
}

export function dbGetMessages(roomId: string) {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM messages WHERE room_id = ? ORDER BY created_at ASC');
  const rows = stmt.all(roomId) as any[];
  return rows.map((r) => ({
    id: r.id,
    roomId: r.room_id,
    senderId: r.sender_id,
    senderName: r.sender_name,
    senderRole: r.sender_role,
    senderAvatar: r.sender_avatar,
    text: r.text,
    type: r.type,
    codeSnippet: r.code_snippet ? JSON.parse(r.code_snippet) : undefined,
    upvotes: r.upvotes,
    createdAt: r.created_at,
  }));
}

// Code files helpers
export function dbSaveCodeFile(file: {
  id: string;
  roomId: string;
  name: string;
  language: string;
  content: string;
  isEntrypoint?: boolean;
}) {
  const db = getDb();
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO code_files (
      id, room_id, name, language, content, is_entrypoint, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    file.id,
    file.roomId,
    file.name,
    file.language,
    file.content,
    file.isEntrypoint ? 1 : 0,
    now
  );
}

export function dbGetCodeFiles(roomId: string) {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM code_files WHERE room_id = ?');
  const rows = stmt.all(roomId) as any[];
  return rows.map((r) => ({
    id: r.id,
    roomId: r.room_id,
    name: r.name,
    language: r.language,
    content: r.content,
    isEntrypoint: Boolean(r.is_entrypoint),
    updatedAt: r.updated_at,
  }));
}

// Storage files helpers
export function dbSaveStorageFile(file: {
  id: string;
  roomId?: string;
  uploaderId?: string;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
  publicUrl: string;
}) {
  const db = getDb();
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO storage_files (
      id, room_id, uploader_id, filename, original_name, mime_type, size_bytes, storage_path, public_url, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    file.id,
    file.roomId || null,
    file.uploaderId || null,
    file.filename,
    file.originalName,
    file.mimeType,
    file.sizeBytes,
    file.storagePath,
    file.publicUrl,
    now
  );
}
