# Forgeit PA — Security Checklist

## ✅ Implemented in v1.0

### Authentication
- [x] Supabase Auth (email + password + magic link)
- [x] JWT-based session management
- [x] Auto-profile creation on signup (SECURITY DEFINER function)
- [x] Auth middleware protects all /admin/* routes
- [x] Redirect to /login for unauthenticated admin access

### Database Security
- [x] Row Level Security enabled on all 12 tables
- [x] is_admin() helper function (SECURITY DEFINER)
- [x] is_admin_or_member() helper function
- [x] Public INSERT allowed for conversations + requests (chat functionality)
- [x] Service role key only used server-side (never exposed to client)
- [x] UNIQUE constraints prevent duplicate session abuse
- [x] CHECK constraints on importance (1-10) and message roles

### API Security
- [x] Input validation with Zod on all API routes
- [x] Max message length enforced (2000 chars)
- [x] Role check on /api/train (admin only)
- [x] Server-side Supabase client for AI context building
- [x] HTTP security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- [x] CORS handled by Next.js defaults

### Frontend Security
- [x] No sensitive env vars exposed to client (SUPABASE_SERVICE_ROLE_KEY is server-only)
- [x] Input sanitization (React's built-in XSS protection)
- [x] No eval() or dangerouslySetInnerHTML usage

---

## ⚠️ Recommended Before Production

### Rate Limiting
- [ ] Add Upstash Redis rate limiting to /api/chat (10 req/min per session)
- [ ] Add rate limiting to /api/train (5 req/min per user)
- [ ] Cloudflare or Netlify rate limiting at edge level

### Input Validation
- [ ] Add honeypot field to chat to catch bots
- [ ] Validate session_id format more strictly
- [ ] Add CAPTCHA for high-frequency senders

### Monitoring
- [ ] Set up Sentry error tracking
- [ ] Enable Supabase audit logs review schedule
- [ ] Set up uptime monitoring (BetterUptime or UptimeRobot)
- [ ] Claude API usage alerts (budget cap in Anthropic console)

### Data
- [ ] Set up Supabase daily backups
- [ ] Define data retention policy (e.g. delete conversations > 6 months)
- [ ] GDPR: add data deletion request flow for visitors

### Secrets Rotation
- [ ] Rotate Supabase service role key quarterly
- [ ] Rotate Anthropic API key if shared or compromised
- [ ] Never log API keys in server logs

---

## RLS Policy Summary

| Table | Public | Member | Admin |
|-------|--------|--------|-------|
| profiles | own read/update | own + admin | all |
| settings | — | read | all |
| knowledge_base | active read | read | all |
| memories | active read | read | all |
| conversations | insert | read | all |
| conversation_messages | insert | read | all |
| requests | insert | read + update | all |
| tasks | — | all | all |
| meeting_requests | insert | read | all |
| notifications | own | own | own + send |
| audit_logs | — | — | read |
| team_members | — | read | all |

---

## Threat Model

| Threat | Mitigation |
|--------|------------|
| Prompt injection via chat | System prompt separation; Claude's built-in safety |
| Data exfiltration via chat | Knowledge base has no private business data |
| Admin impersonation | Supabase JWT + role checks on every admin route |
| CSRF | Next.js same-origin API routes; Supabase JWT |
| XSS | React's DOM sanitization; no dangerouslySetInnerHTML |
| SQL injection | Supabase query builder (parameterized) |
| Brute force login | Supabase's built-in lockout after failed attempts |
| API key exposure | All secrets in server-side env only |
