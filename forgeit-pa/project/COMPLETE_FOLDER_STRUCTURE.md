# Forgeit PA — Complete Next.js Project Folder Structure

```
forgeit-pa/
├── .env.local                        ← Environment variables (never commit)
├── .env.example                      ← Template for env vars
├── .gitignore
├── next.config.ts                    ← Next.js config with PWA
├── netlify.toml                      ← Netlify deployment config
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── middleware.ts                     ← Auth middleware
├── public/
│   ├── manifest.json                 ← PWA manifest
│   ├── sw.js                         ← Service worker
│   ├── icons/
│   │   ├── icon-72x72.png
│   │   ├── icon-96x96.png
│   │   ├── icon-128x128.png
│   │   ├── icon-144x144.png
│   │   ├── icon-152x152.png
│   │   ├── icon-192x192.png
│   │   ├── icon-384x384.png
│   │   └── icon-512x512.png
│   └── splash/
│       └── splash.png
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                ← Root layout (theme provider, fonts)
│   │   ├── globals.css               ← Global styles + CSS variables
│   │   │
│   │   ├── (public)/                 ← Unauthenticated routes
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx              ← Public chat interface (PA entry point)
│   │   │
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── signup/
│   │   │   │   └── page.tsx
│   │   │   └── callback/
│   │   │       └── route.ts          ← Supabase auth callback
│   │   │
│   │   ├── (admin)/                  ← Protected admin routes
│   │   │   ├── layout.tsx            ← Admin shell (sidebar, topbar)
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx          ← Dashboard with metrics
│   │   │   ├── requests/
│   │   │   │   ├── page.tsx          ← Request list
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      ← Request detail
│   │   │   ├── tasks/
│   │   │   │   └── page.tsx          ← Task management (list/kanban/calendar)
│   │   │   ├── meetings/
│   │   │   │   └── page.tsx          ← Meeting requests
│   │   │   ├── knowledge/
│   │   │   │   ├── page.tsx          ← Knowledge base list
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      ← Knowledge entry editor
│   │   │   ├── memory/
│   │   │   │   └── page.tsx          ← Memory management
│   │   │   ├── team/
│   │   │   │   └── page.tsx          ← Team management
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx          ← Charts and metrics
│   │   │   ├── train/
│   │   │   │   └── page.tsx          ← Train My PA interface
│   │   │   ├── notifications/
│   │   │   │   └── page.tsx          ← Notification center
│   │   │   └── settings/
│   │   │       └── page.tsx          ← App settings
│   │   │
│   │   └── api/
│   │       ├── chat/
│   │       │   └── route.ts          ← Main AI chat endpoint (POST)
│   │       ├── classify/
│   │       │   └── route.ts          ← AI classification endpoint
│   │       ├── train/
│   │       │   └── route.ts          ← Train PA endpoint
│   │       └── notify/
│   │           └── route.ts          ← Notification dispatch
│   │
│   ├── components/
│   │   ├── ui/                       ← shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── table.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── sonner.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── ...
│   │   │
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx     ← Public-facing chat widget
│   │   │   ├── ChatMessage.tsx       ← Message bubble
│   │   │   ├── ChatInput.tsx         ← Message input area
│   │   │   └── TypingIndicator.tsx
│   │   │
│   │   ├── admin/
│   │   │   ├── Sidebar.tsx           ← Admin navigation
│   │   │   ├── TopBar.tsx            ← Top header with notifications
│   │   │   ├── NotificationBell.tsx
│   │   │   └── CommandPalette.tsx    ← Cmd+K search
│   │   │
│   │   ├── dashboard/
│   │   │   ├── MetricCard.tsx
│   │   │   ├── RequestsChart.tsx
│   │   │   ├── CategoryBreakdown.tsx
│   │   │   ├── RecentActivity.tsx
│   │   │   └── AiInsights.tsx
│   │   │
│   │   ├── requests/
│   │   │   ├── RequestCard.tsx
│   │   │   ├── RequestFilters.tsx
│   │   │   ├── RequestDetail.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   └── PriorityBadge.tsx
│   │   │
│   │   ├── tasks/
│   │   │   ├── TaskList.tsx
│   │   │   ├── KanbanBoard.tsx
│   │   │   ├── TaskCard.tsx
│   │   │   └── TaskForm.tsx
│   │   │
│   │   ├── knowledge/
│   │   │   ├── KbCard.tsx
│   │   │   ├── KbEditor.tsx
│   │   │   └── KbSearch.tsx
│   │   │
│   │   └── shared/
│   │       ├── ThemeToggle.tsx
│   │       ├── LoadingSpinner.tsx
│   │       ├── EmptyState.tsx
│   │       └── PageHeader.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             ← Browser Supabase client
│   │   │   ├── server.ts             ← Server Supabase client
│   │   │   └── middleware.ts         ← Auth middleware helper
│   │   ├── ai/
│   │   │   ├── chat.ts               ← Chat API call logic
│   │   │   ├── classify.ts           ← Classification logic
│   │   │   ├── context.ts            ← Build AI context (memories + KB)
│   │   │   └── prompts.ts            ← System prompt templates
│   │   ├── email/
│   │   │   └── resend.ts             ← Email notification helper
│   │   └── utils.ts                  ← General utility functions
│   │
│   ├── hooks/
│   │   ├── useRealtimeRequests.ts    ← Realtime request subscription
│   │   ├── useNotifications.ts       ← Notification management
│   │   ├── useChat.ts                ← Chat state management
│   │   └── useAdmin.ts               ← Admin auth check
│   │
│   └── types/
│       ├── database.ts               ← Supabase generated types
│       ├── chat.ts                   ← Chat message types
│       └── api.ts                    ← API request/response types
│
└── docs/                             ← Documentation (this folder)
    ├── PRD.md
    ├── SYSTEM_ARCHITECTURE.md
    ├── DEPLOYMENT_GUIDE.md
    ├── DATABASE_DESIGN.md
    ├── SECURITY.md
    └── ROADMAP.md
```

## Key Files Explained

### `src/app/api/chat/route.ts`
The heart of the platform. Receives messages, builds AI context from memories + KB, calls Claude, saves messages, classifies when ready, creates requests.

### `src/lib/ai/context.ts`
Loads active memories ordered by importance + searches knowledge base by trigram similarity to the current message. Builds the `{{MEMORIES}}` and `{{KNOWLEDGE}}` sections of the system prompt.

### `src/components/chat/ChatInterface.tsx`
Full-screen public chat component. Manages session ID, message history, typing indicators, and streaming responses.

### `middleware.ts`
Protects all `/admin/*` routes. Redirects unauthenticated users to `/login`.

### `public/sw.js`
Service worker for PWA: caches app shell, handles offline, manages push notifications.
