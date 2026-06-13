# Forgeit PA — System Architecture

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FORGEIT PA PLATFORM                       │
├─────────────────────┬───────────────────────────────────────┤
│   PUBLIC INTERFACE  │         ADMIN INTERFACE                │
│   (Visitor Chat)    │         (Founder Dashboard)            │
├─────────────────────┴───────────────────────────────────────┤
│                    Next.js 15 Frontend                       │
│              TypeScript · Tailwind · shadcn/ui               │
├─────────────────────────────────────────────────────────────┤
│                    Next.js API Routes                        │
│              (Edge Functions / Server Actions)               │
├──────────────┬──────────────────┬───────────────────────────┤
│   Supabase   │   Claude API     │   External Services        │
│   - Auth     │   - Sonnet 4.6   │   - Resend (Email)         │
│   - Postgres │   - System Prompt│   - Upstash (Rate Limit)   │
│   - Realtime │   - Tools        │   - Vercel Blob (Files)    │
│   - Storage  │                  │                            │
└──────────────┴──────────────────┴───────────────────────────┘
```

## Frontend Architecture

```
app/
├── (public)/              ← Public routes (no auth)
│   ├── page.tsx           ← Landing / Chat Interface
│   └── layout.tsx
├── (auth)/                ← Auth routes
│   ├── login/
│   └── signup/
├── (admin)/               ← Protected admin routes
│   ├── layout.tsx         ← Admin shell + sidebar
│   ├── dashboard/         ← Home dashboard
│   ├── requests/          ← Request management
│   ├── tasks/             ← Task management
│   ├── meetings/          ← Meeting management
│   ├── knowledge/         ← Knowledge base CRUD
│   ├── memory/            ← Digital memory editor
│   ├── team/              ← Team management
│   ├── analytics/         ← Charts and metrics
│   ├── train/             ← Train My PA
│   └── settings/          ← App settings
└── api/
    ├── chat/              ← Main AI chat endpoint
    ├── classify/          ← Request classification
    └── notify/            ← Notification dispatch
```

## AI System Architecture

```
Incoming Message
      │
      ▼
┌─────────────────┐
│  Context Build  │  ← Memories + Knowledge Base + Conversation History
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Claude Sonnet  │  ← System Prompt + Context
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Response Type?  │
├────────┬────────┤
│  FAQ   │  Lead  │
│Answer  │Collect │
└────────┴────────┘
         │
         ▼
┌─────────────────┐
│  Save to DB     │  ← conversation_messages + requests
└─────────────────┘
```

## Database Architecture

12 core tables with full RLS:
- profiles, settings
- memories, knowledge_base
- conversations, conversation_messages
- requests, tasks, meeting_requests
- team_members, notifications, audit_logs

## Security Architecture

- Supabase Auth (JWT)
- Row Level Security on all tables
- is_admin() / is_admin_or_member() helper functions
- API rate limiting via Upstash Redis
- Input sanitization middleware
- CORS configured for production domain only

## Deployment Architecture

```
GitHub (main branch)
      │
      ▼ (Auto deploy)
Netlify CDN
      │
      ├── Next.js App (SSR + Static)
      ├── API Routes (Netlify Functions)
      └── Environment Variables (Netlify Env)
            │
            ├── Supabase (ap-northeast-1)
            └── Anthropic API
```

## Realtime Architecture

Supabase Realtime subscriptions for:
- New requests → Dashboard notification
- New messages → Chat updates
- Task updates → Admin views
- Notifications → Bell icon badge
