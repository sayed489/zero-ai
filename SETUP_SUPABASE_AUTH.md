# Supabase Authentication & Database Setup Guide

Everything in your backend is wired up to use `@supabase/ssr` to flawlessly handle session cookies. Follow these exact steps to activate your Database and configure Google, GitHub, and Email providers.

---

## 1. Run the SQL Script
All of the tables, Row Level Security (RLS) policies, PgVector search functions, and cron jobs have been written into your repository.

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open the **SQL Editor** on the left menu.
3. Click "New Query".
4. Copy the entire contents of the file located at:
   `supabase/migrations/001_zero_ai.sql`
   (You can find this file inside your codebase).
5. Paste it into the query window and hit **Run**. 
*This will create the `profiles`, `user_memories`, `conversations`, `messages`, `app_builds`, and `subscriptions` tables across your database!*

---

## 2. Configure Authentication Providers
Your code relies on `app/auth/callback/route.ts` to log users in securely. You need to enable the providers in Supabase.

Go to **Authentication > Providers** in the Supabase Dashboard.

### ✉️ Email (Magic Link)
1. Open **Email** provider.
2. Ensure **Enable Email provider** is ON.
3. Ensure **Confirm email** is ON.
4. **Important**: Under **Authentication > URL Configuration**, you must set your **Site URL** to your local dev server for now:
   `http://localhost:3000`

### 🐙 GitHub
1. Go to [GitHub Developer Settings -> OAuth Apps](https://github.com/settings/developers).
2. Click **New OAuth App**.
3. **Application Name**: Zero AI
4. **Homepage URL**: `http://localhost:3000`
5. **Authorization callback URL**: 
   Find your *Callback URL* in Supabase under Authentication > URL Configuration. It looks like:
   `https://[YOUR-PROJECT-ID].supabase.co/auth/v1/callback`
6. Copy the **Client ID** and generate a **Client Secret** in Github.
7. Go back to Supabase -> Authentication -> Providers -> **GitHub**.
8. Paste the Client ID and Secret and turn it ON.

### 🎮 Discord
1. Go to the [Discord Developer Portal](https://discord.com/developers/applications).
2. Click **New Application** and name it "Zero AI", then agree to the terms.
3. On the left menu, click **OAuth2**.
4. Copy the **Client ID** and generate a **Client Secret** (click Reset Secret).
5. Add your **Redirect URI**:
   (Your Supabase callback URL again)
   `https://[YOUR-PROJECT-ID].supabase.co/auth/v1/callback`
6. Go back to Supabase -> Authentication -> Providers -> **Discord**.
7. Paste the Client ID and Secret and turn it ON.

---

## 3. Redirect URLs (Crucial Step)

For users to smoothly bounce back to your app after clicking login on Google or GitHub:

1. Go to **Authentication > URL Configuration** in Supabase.
2. Under **Redirect URLs**, add the following authorized paths:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/chat`
   - `https://your-production-domain.com/auth/callback` (When you deploy)

Everything in the code is completely ready. Once you drop in your keys and run the SQL, your users can log in via Google/Github or Email and start using Nano, App Factory, and Voice immediately.
