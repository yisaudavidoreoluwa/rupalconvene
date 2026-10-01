-- ====================================================================
-- RUPAL CONVENE PRODUCTION SUPABASE SCHEMA
-- Execute this entire script in your Supabase Dashboard -> SQL Editor
-- ====================================================================

-- 1. Profiles Table (Automatically synced from Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Convene Engineer',
  email TEXT NOT NULL,
  avatar TEXT,
  provider TEXT DEFAULT 'email',
  role TEXT DEFAULT 'developer',
  organization TEXT DEFAULT 'Rupal Tech Solutions',
  job_title TEXT DEFAULT 'Software Engineer',
  tier TEXT DEFAULT 'Developer Pro',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Trigger to automatically create a profile row upon auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar, provider)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'avatar', ''),
    COALESCE(new.app_metadata->>'provider', 'email')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Conference Rooms Table
CREATE TABLE IF NOT EXISTS public.rooms (
  id TEXT PRIMARY KEY,
  room_code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  host_id TEXT NOT NULL,
  is_recording BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  is_watermark_active BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'active',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ
);

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view rooms" ON public.rooms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create rooms" ON public.rooms FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Hosts can update their rooms" ON public.rooms FOR UPDATE TO authenticated USING (true);

-- 3. Room Participants Table
CREATE TABLE IF NOT EXISTS public.participants (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer',
  avatar TEXT,
  is_muted BOOLEAN DEFAULT false,
  is_video_off BOOLEAN DEFAULT false,
  in_green_room BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view participants" ON public.participants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert participants" ON public.participants FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Participants can update their status" ON public.participants FOR UPDATE TO authenticated USING (true);

-- 4. Chat Messages & Code Snippets Table
CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL DEFAULT 'developer',
  sender_avatar TEXT,
  text TEXT NOT NULL,
  type TEXT DEFAULT 'chat',
  code_snippet JSONB,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view room messages" ON public.messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can send messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (true);

-- 5. In-Call Collaborative IDE Files Table
CREATE TABLE IF NOT EXISTS public.code_files (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  name TEXT NOT NULL,
  language TEXT NOT NULL,
  content TEXT NOT NULL,
  is_entrypoint BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.code_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view code files" ON public.code_files FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can modify code files" ON public.code_files FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update code files" ON public.code_files FOR UPDATE TO authenticated USING (true);

-- 6. Architecture Whiteboard Data
CREATE TABLE IF NOT EXISTS public.whiteboard_data (
  id TEXT PRIMARY KEY,
  room_id TEXT UNIQUE NOT NULL,
  elements_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.whiteboard_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view whiteboard" ON public.whiteboard_data FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can save whiteboard" ON public.whiteboard_data FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update whiteboard" ON public.whiteboard_data FOR UPDATE TO authenticated USING (true);

-- 7. Pitch Decks Table
CREATE TABLE IF NOT EXISTS public.pitch_decks (
  id TEXT PRIMARY KEY,
  room_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  slides_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  watermark_text TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pitch_decks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view pitch decks" ON public.pitch_decks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can save pitch decks" ON public.pitch_decks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update pitch decks" ON public.pitch_decks FOR UPDATE TO authenticated USING (true);

-- 8. Cloudinary / Supabase Storage Files Catalog
CREATE TABLE IF NOT EXISTS public.storage_files (
  id TEXT PRIMARY KEY,
  room_id TEXT,
  uploader_id TEXT,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  provider TEXT DEFAULT 'cloudinary',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.storage_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view storage files" ON public.storage_files FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can upload storage files" ON public.storage_files FOR INSERT TO authenticated WITH CHECK (true);

-- Enable Realtime publications on messages, participants, code_files
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.code_files;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
