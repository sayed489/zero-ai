# Zero AI — Initial Architecture Setup Guide (v2.0)

This guide walks you through configuring the full 6-tier routing architecture with key rotation, Supabase tracking, Redis limits, and WebLLM for the Zero AI platform.

---

## 1. Environment & Keys Setup

Duplicate `.env.example` to `.env.local` and populate the keys.

**Key Requirements per Tier:**
- **Nano (Free)**: 6x SiliconFlow keys (each user gets 10 queries/day).
- **Pro / App Gen**: Gemini Keys (Including Gemini 1.5 Flash and Gemini 2.5 Flash).
- **Prime**: Fireworks AI + Cerebras for ultra-fast Llama 3.3.
- **Agentic**: Novita (for FLUX / 3D), Fireworks (Llama 4 Scout), and Gemini (Orchestrator).
- **Redis (Upstash)**: Essential for round-robin timeouts and rate limiting. Get keys from Upstash console.

---

## 2. Supabase Setup & Migration

### Step 2.1: Run the Complete Migration
Navigate to your Supabase project's SQL editor and paste the contents of `supabase/migrations/setup_complete_v2.sql`.

This script provisions:
1. Core features (`vector`, `pg_cron`)
2. Extended `profiles` and auth user updates
3. Accurate limits and global budgets via `user_usage` and `apex_budget`
4. The `conversations` and `messages` tracking
5. App builds history tracking
6. Auto-creation triggers for new user profiles

```bash
# If using supabase CLI (optional)
supabase db reset
supabase migration up
```

### Step 2.2: Agentic Mode Migration
You must also run the new Agentic configuration table. Paste `supabase/migrations/003_agentic.sql` in the SQL editor:
1. `agentic_sessions`
2. `agentic_memory`
3. `agentic_actions`

### Step 2.3: Test Usage Increments
You can manually test the usage API tracking system directly:
```sql
-- Test tracking works via RPC
SELECT increment_usage(
  'test-uuid-from-auth', 
  'agentic', 
  'gemini-1.5-flash', 
  CURRENT_DATE
);
```

---

## 3. Zero Agentic (Python Local Agent)

The "One Man CEO" mode requires a local WebSocket agent strictly bound to `localhost:7821`.
This script automates browser clicks, executes terminal commands, and creates files.

To install and run:
```bash
# In an external terminal
cd zero-agent
pip install -r requirements.txt
playwright install chromium
python agent.py
```
> **Security Note:** The WebSocket server rejects connections from any non-localhost origins to ensure your laptop isn't compromised remotely.

---

## 4. WebLLM (Pico Tier) Setup Support

If deploying to Vercel, ensure the `next.config.mjs` properly provisions `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` headers. WebLLM uses `SharedArrayBuffer` logic which requires a strict cross-origin isolation environment on localhost and production.

We have included the required configuration in the root `next.config.mjs`.

## 5. Run the Dev Server

Once the keys are in `.env.local` and your database is configured:

```bash
npm install
npm run dev
```

The application is now actively using the "One Man CEO" websocket bridge, real routing tiers, and deep web-search capabilities for all AI models.
