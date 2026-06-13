# Forgeit PA — Deployment Guide

## Prerequisites

- Node.js 20+
- Supabase project (already created: `signxblexkwzccyfsnuz`)
- Anthropic API key
- Netlify account
- GitHub account

---

## Step 1: Clone & Install

```bash
git clone https://github.com/YOUR_ORG/forgeit-pa.git
cd forgeit-pa
npm install
```

---

## Step 2: Environment Variables

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://signxblexkwzccyfsnuz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Supabase Service Role (server-side only, never expose to client)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Anthropic
ANTHROPIC_API_KEY=your_anthropic_api_key

# App
NEXT_PUBLIC_APP_URL=https://pa.forgeit.co
NEXT_PUBLIC_APP_NAME=Forgeit PA

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=pa@forgeit.co

# Rate Limiting (Upstash Redis - optional)
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
```

---

## Step 3: Supabase Setup

The database schema is already applied to project `signxblexkwzccyfsnuz`.

### Get your keys:
1. Go to https://supabase.com/dashboard/project/signxblexkwzccyfsnuz/settings/api
2. Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
3. Copy `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Copy `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### Create admin user:
1. Go to Authentication → Users → Invite User
2. Invite your email address
3. After signup, run this SQL to make yourself admin:

```sql
UPDATE profiles 
SET role = 'admin', is_founder = TRUE 
WHERE email = 'your@email.com';
```

### Enable Email Auth:
1. Authentication → Providers → Email → Enable

### Enable Realtime:
1. Database → Replication → Enable for: requests, notifications, conversation_messages

---

## Step 4: Local Development

```bash
npm run dev
```

Open http://localhost:3000

---

## Step 5: Deploy to Netlify

### Option A: Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify env:set NEXT_PUBLIC_SUPABASE_URL "your_value"
netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "your_value"
netlify env:set SUPABASE_SERVICE_ROLE_KEY "your_value"
netlify env:set ANTHROPIC_API_KEY "your_value"
netlify env:set RESEND_API_KEY "your_value"
netlify deploy --prod
```

### Option B: GitHub → Netlify

1. Push to GitHub
2. Go to app.netlify.com → Add new site → Import from GitHub
3. Build command: `npm run build`
4. Publish directory: `.next`
5. Add all environment variables in Netlify dashboard
6. Deploy

### netlify.toml (already in project root):

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
```

---

## Step 6: Custom Domain

1. Netlify → Domain settings → Add domain: `pa.forgeit.co`
2. Add DNS records at your registrar:
   - CNAME `pa` → `your-site.netlify.app`
3. SSL is automatic via Netlify

---

## Step 7: PWA Icons

Generate icons from your logo:
```bash
npx pwa-asset-generator logo.png public/icons --manifest public/manifest.json
```

---

## Post-Deployment Checklist

- [ ] Admin user created and role set
- [ ] Knowledge base reviewed and updated
- [ ] Memories verified
- [ ] Test public chat works
- [ ] Test request classification
- [ ] Email notifications working
- [ ] PWA installs on mobile
- [ ] Custom domain live with SSL
