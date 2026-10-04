import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { getSupabaseServerClient, isSupabaseServerConfigured } from './supabase/server';

// Local SQLite fallback setup
const DATA_DIR = process.env.VERCEL 
  ? path.join('/tmp', 'rupal-data')
  : path.join(process.cwd(), 'data');

if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch {
    // Ignore read-only filesystem errors in cloud environments
  }
}

const DB_PATH = path.join(DATA_DIR, 'rupal_convene.db');
let dbInstance: DatabaseSync | null = null;

export function getDb(): DatabaseSync | null {
  if (dbInstance) return dbInstance;
  try {
    dbInstance = new DatabaseSync(DB_PATH);
    initSchema(dbInstance);
    return dbInstance;
  } catch (err) {
    console.warn('SQLite fallback unavailable, relying on Supabase:', err);
    return null;
  }
}

function initSchema(db: DatabaseSync) {
  try {
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

      CREATE TABLE IF NOT EXISTS rooms (
        id TEXT PRIMARY KEY,
        room_code TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        host_id TEXT NOT NULL,
        invite_code TEXT,
        is_invite_only INTEGER DEFAULT 1,
        is_recording INTEGER DEFAULT 0,
        is_locked INTEGER DEFAULT 0,
        is_watermark_active INTEGER DEFAULT 1,
        status TEXT DEFAULT 'active',
        started_at TEXT NOT NULL,
        ended_at TEXT
      );

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

      CREATE TABLE IF NOT EXISTS code_files (
        id TEXT PRIMARY KEY,
        room_id TEXT NOT NULL,
        name TEXT NOT NULL,
        language TEXT NOT NULL,
        content TEXT NOT NULL,
        is_entrypoint INTEGER DEFAULT 0,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS whiteboard_data (
        id TEXT PRIMARY KEY,
        room_id TEXT UNIQUE NOT NULL,
        elements_json TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS pitch_decks (
        id TEXT PRIMARY KEY,
        room_id TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        slides_json TEXT NOT NULL,
        watermark_text TEXT,
        updated_at TEXT NOT NULL
      );

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

    // Ensure migration for existing SQLite databases
    try {
      db.exec('ALTER TABLE rooms ADD COLUMN invite_code TEXT;');
    } catch {}
    try {
      db.exec('ALTER TABLE rooms ADD COLUMN is_invite_only INTEGER DEFAULT 1;');
    } catch {}
  } catch (e) {
    console.warn('SQLite initSchema warning:', e);
  }
}

export function generateInviteCode(roomCode?: string): string {
  if (roomCode) {
    const clean = roomCode.replace(/[^A-Z0-9]/g, '');
    const suffix = clean.length >= 6 ? clean.slice(-6) : clean.padEnd(6, '9');
    return `INV-${suffix}`;
  }
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let rand = '';
  for (let i = 0; i < 6; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `INV-${rand}`;
}

// -------------------------------------------------------------
// USER HELPERS
// -------------------------------------------------------------
export async function dbCreateUser(user: {
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
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || '',
        provider: user.provider || 'email',
        role: user.role || 'developer',
        organization: user.organization || 'Rupal Tech Solutions',
        job_title: user.jobTitle || 'Software Engineer',
        tier: user.tier || 'Developer Pro',
      })
      .select()
      .single();

    if (!error && data) {
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        avatar: data.avatar,
        provider: data.provider,
        role: data.role,
        organization: data.organization,
        jobTitle: data.job_title,
        passwordHash: data.password_hash || user.passwordHash || '',
        tier: data.tier,
        isVerified: true,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    }
  }

  // SQLite fallback
  const db = getDb();
  if (!db) return null;
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

export async function dbFindUserByEmail(email: string) {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (data) {
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        avatar: data.avatar,
        provider: data.provider,
        role: data.role,
        organization: data.organization,
        jobTitle: data.job_title,
        passwordHash: data.password_hash || '',
        tier: data.tier,
        isVerified: true,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    }
  }

  const db = getDb();
  if (!db) return null;
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  const row = stmt.get(email) as any;
  if (!row) return null;
  return formatUserRow(row);
}

export async function dbFindUserById(id: string) {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (data) {
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        avatar: data.avatar,
        provider: data.provider,
        role: data.role,
        organization: data.organization,
        jobTitle: data.job_title,
        passwordHash: data.password_hash || '',
        tier: data.tier,
        isVerified: true,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    }
  }

  const db = getDb();
  if (!db) return null;
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

// -------------------------------------------------------------
// ROOM HELPERS
// -------------------------------------------------------------
export async function dbCreateRoom(room: {
  id?: string;
  roomCode: string;
  title: string;
  description?: string;
  hostId: string;
  isWatermarkActive?: boolean;
  inviteCode?: string;
  isInviteOnly?: boolean;
}) {
  const id = room.id || 'room_' + Date.now().toString(36);
  const now = new Date().toISOString();
  const inviteCode = room.inviteCode || generateInviteCode(room.roomCode);
  const isInviteOnly = room.isInviteOnly !== false;

  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .insert({
          id,
          room_code: room.roomCode,
          title: room.title,
          description: room.description || '',
          host_id: room.hostId,
          is_watermark_active: room.isWatermarkActive !== false,
          invite_code: inviteCode,
          is_invite_only: isInviteOnly,
          status: 'active',
          started_at: now,
        })
        .select()
        .single();

      if (!error && data) {
        return {
          id: data.id,
          roomCode: data.room_code,
          title: data.title,
          description: data.description,
          hostId: data.host_id,
          inviteCode: data.invite_code || inviteCode,
          isInviteOnly: data.is_invite_only !== undefined ? Boolean(data.is_invite_only) : isInviteOnly,
          isRecording: Boolean(data.is_recording),
          isLocked: Boolean(data.is_locked),
          isWatermarkActive: Boolean(data.is_watermark_active),
          status: data.status,
          startedAt: data.started_at,
          endedAt: data.ended_at,
        };
      }
    } catch (e) {
      console.warn('Supabase room insert warning:', e);
    }
  }

  const db = getDb();
  if (!db) {
    return {
      id,
      roomCode: room.roomCode,
      title: room.title,
      description: room.description || '',
      hostId: room.hostId,
      inviteCode,
      isInviteOnly,
      isRecording: false,
      isLocked: false,
      isWatermarkActive: room.isWatermarkActive !== false,
      status: 'active',
      startedAt: now,
      endedAt: null,
    };
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO rooms (
        id, room_code, title, description, host_id, invite_code, is_invite_only, is_recording, is_locked, is_watermark_active, status, started_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, ?, 'active', ?)
    `);
    stmt.run(
      id,
      room.roomCode,
      room.title,
      room.description || '',
      room.hostId,
      inviteCode,
      isInviteOnly ? 1 : 0,
      room.isWatermarkActive === false ? 0 : 1,
      now
    );
  } catch (err) {
    // Fallback if schema doesn't have invite_code yet
    const fallbackStmt = db.prepare(`
      INSERT INTO rooms (
        id, room_code, title, description, host_id, is_recording, is_locked, is_watermark_active, status, started_at
      ) VALUES (?, ?, ?, ?, ?, 0, 0, ?, 'active', ?)
    `);
    fallbackStmt.run(
      id,
      room.roomCode,
      room.title,
      room.description || '',
      room.hostId,
      room.isWatermarkActive === false ? 0 : 1,
      now
    );
  }
  return dbGetRoomByCode(room.roomCode);
}

export async function dbGetRoomByCode(code: string) {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { data } = await supabase
      .from('rooms')
      .select('*')
      .eq('room_code', code)
      .maybeSingle();

    if (data) {
      return {
        id: data.id,
        roomCode: data.room_code,
        title: data.title,
        description: data.description,
        hostId: data.host_id,
        inviteCode: data.invite_code || generateInviteCode(data.room_code),
        isInviteOnly: data.is_invite_only !== undefined ? Boolean(data.is_invite_only) : true,
        isRecording: Boolean(data.is_recording),
        isLocked: Boolean(data.is_locked),
        isWatermarkActive: Boolean(data.is_watermark_active),
        status: data.status,
        startedAt: data.started_at,
        endedAt: data.ended_at,
      };
    }
  }

  const db = getDb();
  if (!db) return null;
  const stmt = db.prepare('SELECT * FROM rooms WHERE room_code = ?');
  const row = stmt.get(code) as any;
  if (!row) return null;
  return {
    id: row.id,
    roomCode: row.room_code,
    title: row.title,
    description: row.description,
    hostId: row.host_id,
    inviteCode: row.invite_code || generateInviteCode(row.room_code),
    isInviteOnly: row.is_invite_only !== undefined ? Boolean(row.is_invite_only) : true,
    isRecording: Boolean(row.is_recording),
    isLocked: Boolean(row.is_locked),
    isWatermarkActive: Boolean(row.is_watermark_active),
    status: row.status,
    startedAt: row.started_at,
    endedAt: row.ended_at,
  };
}

export async function dbGetRecentRooms(limit = 10) {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { data } = await supabase
      .from('rooms')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(limit);

    if (data && data.length > 0) {
      return data.map((r: any) => ({
        id: r.id,
        roomCode: r.room_code,
        title: r.title,
        hostId: r.host_id,
        status: r.status,
        startedAt: r.started_at,
      }));
    }
  }

  const db = getDb();
  if (!db) return [];
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

export async function dbUpdateRoomStatus(code: string, status: string = 'ended') {
  const now = new Date().toISOString();
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      await supabase
        .from('rooms')
        .update({ 
          status, 
          ended_at: status === 'ended' ? now : null 
        })
        .eq('room_code', code);
    } catch (e) {
      console.warn('Supabase update room error:', e);
    }
  }

  const db = getDb();
  if (db) {
    try {
      const stmt = db.prepare('UPDATE rooms SET status = ?, ended_at = ? WHERE room_code = ?');
      stmt.run(status, status === 'ended' ? now : null, code);
    } catch (err) {
      console.warn('SQLite update room status error:', err);
    }
  }

  return { success: true, roomCode: code, status, endedAt: status === 'ended' ? now : null };
}

// -------------------------------------------------------------
// PARTICIPANT HELPERS
// -------------------------------------------------------------
export async function dbAddParticipant(p: {
  id: string;
  roomId: string;
  userId: string;
  name: string;
  role: string;
  avatar?: string;
}) {
  const now = new Date().toISOString();
  const supabase = getSupabaseServerClient();
  if (supabase) {
    await supabase.from('participants').upsert({
      id: p.id,
      room_id: p.roomId,
      user_id: p.userId,
      name: p.name,
      role: p.role,
      avatar: p.avatar || '',
      is_muted: false,
      is_video_off: false,
      in_green_room: false,
      joined_at: now,
    });
    return;
  }

  const db = getDb();
  if (!db) return;
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO participants (
      id, room_id, user_id, name, role, avatar, is_muted, is_video_off, in_green_room, joined_at
    ) VALUES (?, ?, ?, ?, ?, ?, 0, 0, 0, ?)
  `);
  stmt.run(p.id, p.roomId, p.userId, p.name, p.role, p.avatar || '', now);
}

export async function dbGetParticipants(roomId: string) {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { data } = await supabase
      .from('participants')
      .select('*')
      .eq('room_id', roomId);

    if (data) {
      return data.map((r: any) => ({
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
  }

  const db = getDb();
  if (!db) return [];
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

// -------------------------------------------------------------
// MESSAGES HELPERS
// -------------------------------------------------------------
export async function dbSaveMessage(msg: {
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
  const now = new Date().toISOString();
  const supabase = getSupabaseServerClient();
  if (supabase) {
    await supabase.from('messages').insert({
      id: msg.id,
      room_id: msg.roomId,
      sender_id: msg.senderId,
      sender_name: msg.senderName,
      sender_role: msg.senderRole,
      sender_avatar: msg.senderAvatar || '',
      text: msg.text,
      type: msg.type || 'chat',
      code_snippet: msg.codeSnippet || null,
      upvotes: 0,
      created_at: now,
    });
    return;
  }

  const db = getDb();
  if (!db) return;
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

export async function dbGetMessages(roomId: string) {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });

    if (data) {
      return data.map((r: any) => ({
        id: r.id,
        roomId: r.room_id,
        senderId: r.sender_id,
        senderName: r.sender_name,
        senderRole: r.sender_role,
        senderAvatar: r.sender_avatar,
        text: r.text,
        type: r.type,
        codeSnippet: r.code_snippet,
        upvotes: r.upvotes,
        createdAt: r.created_at,
      }));
    }
  }

  const db = getDb();
  if (!db) return [];
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

// -------------------------------------------------------------
// CODE FILES HELPERS
// -------------------------------------------------------------
export async function dbSaveCodeFile(file: {
  id: string;
  roomId: string;
  name: string;
  language: string;
  content: string;
  isEntrypoint?: boolean;
}) {
  const now = new Date().toISOString();
  const supabase = getSupabaseServerClient();
  if (supabase) {
    await supabase.from('code_files').upsert({
      id: file.id,
      room_id: file.roomId,
      name: file.name,
      language: file.language,
      content: file.content,
      is_entrypoint: Boolean(file.isEntrypoint),
      updated_at: now,
    });
    return;
  }

  const db = getDb();
  if (!db) return;
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

export async function dbGetCodeFiles(roomId: string) {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { data } = await supabase
      .from('code_files')
      .select('*')
      .eq('room_id', roomId);

    if (data) {
      return data.map((r: any) => ({
        id: r.id,
        roomId: r.room_id,
        name: r.name,
        language: r.language,
        content: r.content,
        isEntrypoint: Boolean(r.is_entrypoint),
        updatedAt: r.updated_at,
      }));
    }
  }

  const db = getDb();
  if (!db) return [];
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

// -------------------------------------------------------------
// STORAGE FILES HELPERS
// -------------------------------------------------------------
export async function dbSaveStorageFile(file: {
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
  const now = new Date().toISOString();
  const supabase = getSupabaseServerClient();
  if (supabase) {
    await supabase.from('storage_files').insert({
      id: file.id,
      room_id: file.roomId || null,
      uploader_id: file.uploaderId || null,
      filename: file.filename,
      original_name: file.originalName,
      mime_type: file.mimeType,
      size_bytes: file.sizeBytes,
      storage_path: file.storagePath,
      public_url: file.publicUrl,
      provider: 'cloudinary',
      created_at: now,
    });
    return;
  }

  const db = getDb();
  if (!db) return;
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
