-- ============================================================
-- FORGEIT PA — Complete Database Schema
-- Project: signxblexkwzccyfsnuz (Manish's PA)
-- Applied: June 2026
-- ============================================================

-- NOTE: This schema has already been applied to the Supabase project.
-- This file is for reference and re-application if needed.

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "moddatetime";

-- ============================================================
-- ENUM TYPES
-- ============================================================
CREATE TYPE request_category AS ENUM (
  'client_lead', 'team_request', 'partnership', 'event_invitation',
  'media_request', 'personal_request', 'vendor_request', 'investor_inquiry', 'general_inquiry'
);
CREATE TYPE priority_level AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE request_status AS ENUM ('new', 'reviewing', 'waiting', 'completed', 'rejected');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'waiting', 'done', 'cancelled');
CREATE TYPE team_role AS ENUM ('founder', 'cto', 'cdo', 'cmo', 'pro', 'developer', 'designer', 'member');
CREATE TYPE notification_type AS ENUM ('request', 'task', 'meeting', 'system', 'ai_insight');
CREATE TYPE app_role AS ENUM ('admin', 'member', 'viewer');
CREATE TYPE meeting_status AS ENUM ('pending', 'confirmed', 'rejected', 'completed', 'cancelled');
CREATE TYPE knowledge_category AS ENUM (
  'about_founder', 'about_company', 'services', 'faqs', 'preferences', 'policies', 'team', 'other'
);
CREATE TYPE conversation_channel AS ENUM ('web', 'api', 'whatsapp', 'telegram', 'email');
CREATE TYPE audit_action AS ENUM ('create', 'update', 'delete', 'view', 'login', 'logout', 'ai_response');

-- ============================================================
-- TABLE: profiles
-- ============================================================
CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           CITEXT UNIQUE NOT NULL,
  full_name       TEXT,
  avatar_url      TEXT,
  role            app_role NOT NULL DEFAULT 'viewer',
  is_founder      BOOLEAN NOT NULL DEFAULT FALSE,
  phone           TEXT,
  timezone        TEXT DEFAULT 'Asia/Kolkata',
  bio             TEXT,
  company         TEXT,
  website         TEXT,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: settings
-- ============================================================
CREATE TABLE settings (
  id                        UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  owner_id                  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ai_personality            TEXT DEFAULT 'professional',
  working_hours_start       TIME DEFAULT '09:00',
  working_hours_end         TIME DEFAULT '21:00',
  preferred_meeting_times   TEXT[] DEFAULT ARRAY['17:00','18:00','19:00'],
  auto_reply_enabled        BOOLEAN DEFAULT TRUE,
  auto_classify             BOOLEAN DEFAULT TRUE,
  email_notifications       BOOLEAN DEFAULT TRUE,
  push_notifications        BOOLEAN DEFAULT TRUE,
  whatsapp_enabled          BOOLEAN DEFAULT FALSE,
  telegram_enabled          BOOLEAN DEFAULT FALSE,
  custom_rules              JSONB DEFAULT '[]',
  founder_intro             TEXT,
  pa_name                   TEXT DEFAULT 'Forgeit PA',
  pa_tagline                TEXT DEFAULT 'Executive Assistant to the Founder',
  metadata                  JSONB DEFAULT '{}',
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(owner_id)
);

-- ============================================================
-- TABLE: team_members
-- ============================================================
CREATE TABLE team_members (
  id              UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  profile_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  full_name       TEXT NOT NULL,
  role            team_role NOT NULL DEFAULT 'member',
  title           TEXT,
  email           CITEXT,
  phone           TEXT,
  responsibilities TEXT[],
  is_active       BOOLEAN DEFAULT TRUE,
  joined_at       DATE,
  avatar_url      TEXT,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: knowledge_base
-- ============================================================
CREATE TABLE knowledge_base (
  id              UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  title           TEXT NOT NULL,
  content         TEXT NOT NULL,
  category        knowledge_category NOT NULL DEFAULT 'other',
  tags            TEXT[] DEFAULT '{}',
  is_active       BOOLEAN DEFAULT TRUE,
  use_count       INTEGER DEFAULT 0,
  created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: memories
-- ============================================================
CREATE TABLE memories (
  id              UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  key             TEXT NOT NULL,
  value           TEXT NOT NULL,
  category        TEXT NOT NULL DEFAULT 'general',
  importance      INTEGER DEFAULT 5 CHECK (importance BETWEEN 1 AND 10),
  source          TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  last_used_at    TIMESTAMPTZ,
  use_count       INTEGER DEFAULT 0,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(key)
);

-- ============================================================
-- TABLE: conversations
-- ============================================================
CREATE TABLE conversations (
  id              UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  session_id      TEXT NOT NULL,
  channel         conversation_channel NOT NULL DEFAULT 'web',
  visitor_name    TEXT,
  visitor_email   CITEXT,
  visitor_phone   TEXT,
  visitor_ip      TEXT,
  visitor_meta    JSONB DEFAULT '{}',
  is_resolved     BOOLEAN DEFAULT FALSE,
  request_id      UUID,
  summary         TEXT,
  total_messages  INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: conversation_messages
-- ============================================================
CREATE TABLE conversation_messages (
  id              UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content         TEXT NOT NULL,
  tokens_used     INTEGER DEFAULT 0,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: requests
-- ============================================================
CREATE TABLE requests (
  id              UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  category        request_category NOT NULL DEFAULT 'general_inquiry',
  priority        priority_level NOT NULL DEFAULT 'medium',
  status          request_status NOT NULL DEFAULT 'new',
  requester_name  TEXT,
  requester_email CITEXT,
  requester_phone TEXT,
  requester_type  TEXT,
  collected_data  JSONB DEFAULT '{}',
  ai_summary      TEXT,
  ai_classification JSONB DEFAULT '{}',
  assigned_to     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  resolved_at     TIMESTAMPTZ,
  resolved_by     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes           TEXT,
  tags            TEXT[] DEFAULT '{}',
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: tasks
-- ============================================================
CREATE TABLE tasks (
  id              UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  title           TEXT NOT NULL,
  description     TEXT,
  status          task_status NOT NULL DEFAULT 'todo',
  priority        priority_level NOT NULL DEFAULT 'medium',
  assigned_to     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  request_id      UUID REFERENCES requests(id) ON DELETE SET NULL,
  due_date        DATE,
  completed_at    TIMESTAMPTZ,
  tags            TEXT[] DEFAULT '{}',
  checklist       JSONB DEFAULT '[]',
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: meeting_requests
-- ============================================================
CREATE TABLE meeting_requests (
  id              UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  request_id      UUID REFERENCES requests(id) ON DELETE SET NULL,
  requester_name  TEXT NOT NULL,
  requester_email CITEXT NOT NULL,
  requester_phone TEXT,
  company         TEXT,
  purpose         TEXT NOT NULL,
  agenda          TEXT,
  preferred_dates JSONB DEFAULT '[]',
  duration_mins   INTEGER DEFAULT 30,
  meeting_type    TEXT DEFAULT 'virtual',
  status          meeting_status NOT NULL DEFAULT 'pending',
  confirmed_at    TIMESTAMPTZ,
  meeting_link    TEXT,
  meeting_notes   TEXT,
  follow_up_sent  BOOLEAN DEFAULT FALSE,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: notifications
-- ============================================================
CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  recipient_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type            notification_type NOT NULL DEFAULT 'system',
  title           TEXT NOT NULL,
  body            TEXT,
  is_read         BOOLEAN DEFAULT FALSE,
  read_at         TIMESTAMPTZ,
  action_url      TEXT,
  reference_id    UUID,
  reference_type  TEXT,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: audit_logs
-- ============================================================
CREATE TABLE audit_logs (
  id              UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  actor_id        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action          audit_action NOT NULL,
  entity_type     TEXT NOT NULL,
  entity_id       UUID,
  old_data        JSONB,
  new_data        JSONB,
  ip_address      TEXT,
  user_agent      TEXT,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES (see migration file for full list)
-- ============================================================
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_kb_category ON knowledge_base(category);
CREATE INDEX idx_kb_content_trgm ON knowledge_base USING GIN(content gin_trgm_ops);
CREATE INDEX idx_memories_importance ON memories(importance DESC);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_priority ON requests(priority);
CREATE INDEX idx_requests_created ON requests(created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(recipient_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- ============================================================
-- STATUS: All tables, RLS, triggers, seeds applied.
-- Run the Next.js app to begin using.
-- ============================================================
