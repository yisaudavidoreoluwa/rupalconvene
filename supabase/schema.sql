-- ====================================================================
-- RUPAL CONVENE PRODUCTION SUPABASE SCHEMA & FIX
-- Execute this entire script in your Supabase Dashboard -> SQL Editor
-- ====================================================================

-- 1. Create or Update Profiles Table (Safely handling OAuth metadata)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT DEFAULT 'Convene Engineer',
  email TEXT DEFAULT '',
  avatar TEXT DEFAULT '',
  provider TEXT DEFAULT 'email',
  role TEXT DEFAULT 'developer',
  organization TEXT DEFAULT 'Rupal Tech Solutions',
  job_title TEXT DEFAULT 'Software Engineer',
  tier TEXT DEFAULT 'Developer Pro',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure columns exist and relax NOT NULL if table already existed
ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN name DROP NOT NULL;

-- Enable Row Level Security on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Public profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their profile" ON public.profiles;
CREATE POLICY "Users can insert their profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Service role bypass on profiles" ON public.profiles;
CREATE POLICY "Service role bypass on profiles"
  ON public.profiles FOR ALL
  TO service_role
  USING (true);

-- Trigger to automatically create a profile row upon auth.users signup
-- Completely resilient with EXCEPTION block so user registration never fails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  extracted_email TEXT;
  extracted_name TEXT;
  extracted_avatar TEXT;
  extracted_provider TEXT;
BEGIN
  extracted_email := COALESCE(
    new.email, 
    new.raw_user_meta_data->>'email', 
    'user_' || substr(new.id::text, 1, 8) || '@rupalconvene.io'
  );
  
  extracted_name := COALESCE(
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'user_name',
    new.raw_user_meta_data->>'preferred_username',
    split_part(extracted_email, '@', 1),
    'Convene Engineer'
  );

  extracted_avatar := COALESCE(
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'avatar',
    new.raw_user_meta_data->>'picture',
    ''
  );

  extracted_provider := COALESCE(
    new.raw_app_meta_data->>'provider', 
    new.app_metadata->>'provider', 
    'oauth'
  );

  INSERT INTO public.profiles (id, email, name, avatar, provider)
  VALUES (
    new.id,
    extracted_email,
    extracted_name,
    extracted_avatar,
    extracted_provider
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    avatar = CASE WHEN EXCLUDED.avatar <> '' THEN EXCLUDED.avatar ELSE public.profiles.avatar END,
    updated_at = now();

  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Resilient fallback: log warning and continue without crashing auth.users creation!
    RAISE WARNING 'handle_new_user notice: %', SQLERRM;
    RETURN new;
END;
$$;

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
DROP POLICY IF EXISTS "Authenticated users can view rooms" ON public.rooms;
CREATE POLICY "Authenticated users can view rooms" ON public.rooms FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Authenticated users can create rooms" ON public.rooms;
CREATE POLICY "Authenticated users can create rooms" ON public.rooms FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Hosts can update their rooms" ON public.rooms;
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
DROP POLICY IF EXISTS "Authenticated users can view participants" ON public.participants;
CREATE POLICY "Authenticated users can view participants" ON public.participants FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Authenticated users can insert participants" ON public.participants;
CREATE POLICY "Authenticated users can insert participants" ON public.participants FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Participants can update their status" ON public.participants;
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
DROP POLICY IF EXISTS "Authenticated users can view room messages" ON public.messages;
CREATE POLICY "Authenticated users can view room messages" ON public.messages FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Authenticated users can send messages" ON public.messages;
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
DROP POLICY IF EXISTS "Authenticated users can view code files" ON public.code_files;
CREATE POLICY "Authenticated users can view code files" ON public.code_files FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Authenticated users can modify code files" ON public.code_files;
CREATE POLICY "Authenticated users can modify code files" ON public.code_files FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated users can update code files" ON public.code_files;
CREATE POLICY "Authenticated users can update code files" ON public.code_files FOR UPDATE TO authenticated USING (true);

-- 6. Architecture Whiteboard Data
CREATE TABLE IF NOT EXISTS public.whiteboard_data (
  id TEXT PRIMARY KEY,
  room_id TEXT UNIQUE NOT NULL,
  elements_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.whiteboard_data ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can view whiteboard" ON public.whiteboard_data;
CREATE POLICY "Authenticated users can view whiteboard" ON public.whiteboard_data FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Authenticated users can save whiteboard" ON public.whiteboard_data;
CREATE POLICY "Authenticated users can save whiteboard" ON public.whiteboard_data FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated users can update whiteboard" ON public.whiteboard_data;
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
DROP POLICY IF EXISTS "Authenticated users can view pitch decks" ON public.pitch_decks;
CREATE POLICY "Authenticated users can view pitch decks" ON public.pitch_decks FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Authenticated users can save pitch decks" ON public.pitch_decks;
CREATE POLICY "Authenticated users can save pitch decks" ON public.pitch_decks FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated users can update pitch decks" ON public.pitch_decks;
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
DROP POLICY IF EXISTS "Authenticated users can view storage files" ON public.storage_files;
CREATE POLICY "Authenticated users can view storage files" ON public.storage_files FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Authenticated users can upload storage files" ON public.storage_files;
CREATE POLICY "Authenticated users can upload storage files" ON public.storage_files FOR INSERT TO authenticated WITH CHECK (true);

-- 9. Grants for Supabase internal and authenticated roles
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;
