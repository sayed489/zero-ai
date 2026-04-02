# Zero AI - Complete Setup Guide

Zero AI is a production-ready multi-model AI assistant with memory, powered by intelligent routing across Nano, Prime, Apex, and Agentic Chad models.

## Quick Start (5 minutes)

```bash
# 1. Clone and install
git clone <your-repo>
cd zero-ai
pnpm install

# 2. Set up Supabase
# Go to supabase.com → Create project
# Copy .env variables:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY

# Run SQL schema in Supabase editor (see SUPABASE_SCHEMA.sql)

# 3. Get API keys (fastest path)
# GROQ: console.groq.com (14.4k/day free)
# GEMINI: aistudio.google.com (1.5k/day free)
# CLOUDFLARE: dash.cloudflare.com/workers/ai (10k/day free)

# 4. Set .env.local with your keys
cp .env.example .env.local
# Edit with your API keys

# 5. Run dev server
pnpm dev

# Open http://localhost:3000
```

---

## Environment Variables

Copy this to `.env.local` and fill in your keys:

```env
# SUPABASE (required for auth + storage)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# GROQ (14.4k req/day, free)
# Get at: console.groq.com
GROQ_API_KEY=your-groq-key

# GEMINI (1.5k req/day per project, free)
# Get at: aistudio.google.com
GOOGLE_GEMINI_API_KEY=your-gemini-key

# CLOUDFLARE WORKERS AI (10k req/day, free)
# Get at: dash.cloudflare.com/workers/ai
CF_ACCOUNT_ID=your-account-id
CF_API_TOKEN_1=your-api-token

# TAVILY WEB SEARCH (optional, 1000/month free)
TAVILY_API_KEY_1=your-tavily-key

# PAYMENTS (optional for Pro tiers)
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-pub
STRIPE_SECRET_KEY=your-stripe-secret

# APP
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Model Tiers

### Zero Nano
- **Use for:** Quick replies, autocomplete
- **Providers:** Gemini 1.5 Flash, Cloudflare Gemma
- **Free limit:** 3,000 req/day combined

### Zero Smart
- **Use for:** Writing, coding, everyday chat
- **Providers:** Qwen 7B, Groq Llama 8B
- **Free limit:** 20,000 req/day combined

### Zero Prime
- **Use for:** Complex tasks, long docs, analysis
- **Providers:** Groq Llama 70B, Gemini 2.0 Flash
- **Free limit:** 25,000 req/day combined

### Zero Apex (Pro only)
- **Use for:** Best quality, hard problems
- **Providers:** Gemini 2.5 Pro, SambaNova 72B
- **Limit:** 1,200 req/day (premium tier)

### Agentic Chad (Ultra only)
- **Use for:** App Factory, autonomous tasks
- **How it works:** Planner (Gemini Flash) breaks task → Executor (Groq 70B) runs steps
- **Limit:** 800 req/day (ultra tier)

---

## API Routes (All Implemented)

| Endpoint | Purpose | Input | Output |
|----------|---------|-------|--------|
| `POST /api/chat` | Main chat | `{messages, model}` | Streaming text |
| `POST /api/search` | Web search | `{query}` | `{results, answer}` |
| `POST /api/imagine` | Image generation | `{prompt}` | `{url}` |
| `POST /api/execute` | Code execution | `{code, language}` | `{output, stderr}` |
| `POST /api/compare` | Zero vs X | `{messages}` | `{nano, smart, prime}` |
| `POST /api/memory/extract` | Extract facts | `{messages}` | `{memories[]}` |
| `POST /api/memory/retrieve` | Get memories | `{userId, query}` | `{memories[]}` |

---

## Database Schema (Supabase SQL)

```sql
-- Run this in Supabase SQL editor

create extension if not exists vector;

create table profiles (
  id uuid references auth.users primary key,
  name text,
  plan text default 'starter',
  messages_today int default 0,
  last_reset date default current_date,
  created_at timestamptz default now()
);

create table chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text,
  model text,
  created_at timestamptz default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid references chats(id) on delete cascade,
  role text,
  content text,
  model_used text,
  created_at timestamptz default now()
);

create table user_memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  memory text,
  category text,
  embedding vector(768),
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table chats enable row level security;
alter table messages enable row level security;
alter table user_memories enable row level security;

create policy "Users own their data" on profiles for all using (auth.uid() = id);
create policy "Users own their chats" on chats for all using (auth.uid() = user_id);
create policy "Users own their messages" on messages for all using (
  auth.uid() = (select user_id from chats where id = chat_id)
);
create policy "Users own their memories" on user_memories for all using (auth.uid() = user_id);
```

---

## Features Included

- [x] Multi-model router with intelligent fallback
- [x] Memory extraction and storage (Supabase)
- [x] Web search integration (Tavily)
- [x] Image generation (Pollinations.ai - free)
- [x] Code execution (Piston API - free)
- [x] Voice input (Web Speech API)
- [x] Voice output (speechSynthesis - built-in)
- [x] App Factory (detect build intent → StackBlitz)
- [x] Zero vs X (compare 3 models side-by-side)
- [x] Roast Mode (brutal critique + auto-fix)
- [x] Dark/light theme toggle
- [x] Mobile responsive
- [x] Supabase Auth with Google OAuth
- [x] Free tier limits (30 msg/day)
- [x] Pro tier unlocks (Apex + memory export)

---

## Deployment

### To Vercel (Recommended)

```bash
# 1. Push to GitHub
git push origin main

# 2. Connect to Vercel
vercel link

# 3. Add environment variables in Vercel Dashboard
# Settings → Environment Variables → Add all .env.local keys

# 4. Deploy
vercel deploy --prod
```

### To Other Platforms

Zero AI works on any Node.js 18+ hosting:
- Netlify (Functions)
- AWS Lambda
- Google Cloud Run
- Self-hosted VPS

---

## Getting API Keys (Step by Step)

### Groq (14.4k req/day free)
1. Go to https://console.groq.com
2. Click "Create API Key"
3. Copy key to `GROQ_API_KEY`

### Gemini (1.5k req/day free per project)
1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Select/create a new Google Cloud project
4. Copy key to `GOOGLE_GEMINI_API_KEY`

### Cloudflare Workers AI (10k req/day free)
1. Go to https://dash.cloudflare.com
2. Select your domain → Workers & Pages → AI
3. Copy Account ID to `CF_ACCOUNT_ID`
4. Create API Token in Settings → API Tokens
5. Copy to `CF_API_TOKEN_1`

### Tavily (1000/month free)
1. Go to https://app.tavily.com
2. Sign up and create API key
3. Copy to `TAVILY_API_KEY_1`

### Supabase (50k MAU free)
1. Go to https://supabase.com
2. Create new project
3. Copy URL → `NEXT_PUBLIC_SUPABASE_URL`
4. Get keys from Settings → API

---

## Troubleshooting

### Chat not responding
- Check `GROQ_API_KEY` is set
- If Groq rate-limited, add `GOOGLE_GEMINI_API_KEY`
- Check Supabase auth - run `supabase auth` in console

### Memory not extracting
- Memory requires Gemini API key
- Set `GOOGLE_GEMINI_API_KEY` (free tier: 1.5k/day)

### Image generation not working
- Pollinations.ai doesn't require API key
- Check if NEXT_PUBLIC_APP_URL is set correctly

### Rate limits hit
- Groq: 14.4k/day, resets daily at UTC midnight
- Gemini: 1.5k/day per project (create more projects for more quota)
- Cloudflare: 10k/day, generous on free tier

---

## Architecture

```
/app
  /api - All API routes (chat, search, imagine, etc.)
  /chat - Main chat interface
  /pricing - Subscription management
  /settings - User settings + MCP connectors

/components
  /chat - Chat UI components
  /landing - Landing page sections
  /mascot - Zero mascot animations
  /sidebar - Chat sidebar + history

/lib
  /ai - Model routing, providers (Groq, Gemini, Cloudflare)
  /supabase - Auth and database
  /memory - Memory extraction and retrieval
  model-router.ts - Multi-account key rotation

/public - Static assets
```

---

## Free vs Pro Limits

| Feature | Free | Pro | Ultra |
|---------|------|-----|-------|
| Messages/day | 30 | Unlimited | Unlimited |
| Models | Nano + Smart | + Prime | + Apex + Agentic |
| Memory | View only | Full + Export | Full + Export |
| Voice | No | Yes | Yes |
| Image gen | 5/day | Unlimited | Unlimited |
| App Factory | No | Yes | Yes |
| Zero vs X | No | Yes | Yes |
| Roast Mode | 3/day | Unlimited | Unlimited |

---

## Next Steps

1. **Add your own branding** - Update colors in `/app/globals.css`
2. **Deploy to production** - Push to Vercel or your hosting
3. **Enable payments** - Set up Razorpay (India) or Stripe (global)
4. **Monitor usage** - Check API usage in provider dashboards
5. **Customize models** - Edit `/lib/model-router.ts` for different providers

---

## Support

- Docs: Check this file + inline code comments
- Issues: Check existing issues on GitHub
- API status: Use `next build` to check for TypeScript errors before deploying

---

**Zero AI is ready for production. All features are wired, all APIs are real. Ship it!**
