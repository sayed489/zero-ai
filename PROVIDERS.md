# Zero AI — Provider & Model Setup Guide

## ⚙️ Architecture for High Concurrent Load (10K+ Users)

To handle massive load affordably, Zero AI uses a waterfall fallback strategy:

1. **Browser WebLLM (Nano)**: Takes ~40% of the load completely client-side in the user's browser. Zero server cost.
2. **Rotated Free APIs**: We rotate 6 free SiliconFlow API keys (6,000 req/day).
3. **Sequential HF Spaces**: We maintain cloned HuggingFace spaces. Instead of all being awake, the system routes traffic to exactly **one HF space for 50 hours minimum**, while others sleep, preventing account limits. When one rotates, the next wakes up.

## 🧠 Qwen 3.5 7B & 9B HuggingFace Setup

For Prime (7B) and Apex (9B), here is how to handle concurrent load via HuggingFace Spaces:

### 1. Create the Inference Space
Do NOT use the standard Python Gradio interface for heavy concurrent load. Python single-thread Gradio will choke.
Instead, create a **Docker Space** and run `vLLM` or `Text Generation Inference (TGI)` under the hood.

1. Go to [huggingface.co/spaces](https://huggingface.co/spaces) → Create new Space.
2. Select **Docker** → Blank template.
3. Use this `Dockerfile` for massive concurrency:

```dockerfile
# Use TGI (Text Generation Inference) for ultra-high throughput
FROM ghcr.io/huggingface/text-generation-inference:latest

# Set your model here (Update to 3.5 when available, using 2.5 for now)
ENV MODEL_ID="Qwen/Qwen2.5-7B-Instruct"
# For Apex, change MODEL_ID to Qwen2.5-14B / 9B
ENV PORT=7860
ENV MAX_CONCURRENT_REQUESTS=512

EXPOSE 7860
CMD ["--model-id", "Qwen/Qwen2.5-7B-Instruct", "--port", "7860"]
```

### 2. Duplicate the Space
Once built, clone it so you have 6 Prime spaces:
`user/zero-prime-1`, `user/zero-prime-2`, etc.

### 3. Let the System Handle Rotation
Put all 6 names in your `.env.local`. Zero AI's cron job will pick `zero-prime-1`, wake it, and route *all* HF traffic to it for exactly 50 hours, then naturally switch to `zero-prime-2`.

---

## 🔑 All Providers at a Glance

| Provider | Free? | Purpose | Sign Up |
|----------|-------|---------|---------|
| Gemini | ✅ Free | Nano/Apex fallback, embeddings, image analysis | [ai.google.dev](https://ai.google.dev) |
| SiliconFlow | ✅ Free | Prime tier (Qwen 7B/32B/72B) | [siliconflow.cn](https://siliconflow.cn) |
| Cerebras | ✅ Free | Ultra-fast Llama/Qwen | [cerebras.ai](https://cerebras.ai) |
| Fireworks AI | 💰 Paid | Apex tier (Qwen 72B) | [fireworks.ai](https://fireworks.ai) |
| Together AI | 💰 Paid | Apex tier fallback | [together.ai](https://together.ai) |
| UPSTASH Redis | ✅ Free | Rate limiting | [upstash.com](https://upstash.com) |
| Supabase | ✅ Free | Vector DB | [supabase.com](https://supabase.com) |

---

## 🤖 Nano Mode (WebGPU / Browser LLM)

Zero AI's **Nano Mode** runs AI directly on the user's GPU using WebGPU, supporting infinite concurrent users at zero cost.

- **Model Used:** `Qwen2.5-1.5B-Instruct-q4f16_1-MLC` (The smallest, smartest Qwen instruction-tuned model compiled for WebGL/WebGPU by MLC AI).
- **How it works:** When a user with a capable device opens Zero, the `useNano` hook checks WebGPU. It downloads ~900MB to Chrome's IndexedDB cache. For all future queries, text generation occurs instantly inside the browser.
- **Why it matters:** It handles all the "dumb" or simple queries (summarize, translate, chat) client-side, saving your API limits for complex coding or logic tasks on Prime/Apex.

---

## 📋 Environment Variables (.env.local)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# Gemini (create 4 keys for rotation)
GEMINI_KEY=

# SiliconFlow (create 6 keys)
SILICONFLOW_KEY_1=
SILICONFLOW_KEY_2=
SILICONFLOW_KEY_...

# HF Spaces (Rotate array)
HF_TOKEN_1=
HF_TOKEN_APEX_1=
HF_SPACE_PRIME_1=username/space-name-1
HF_SPACE_PRIME_2=username/space-name-2
HF_SPACE_PRIME_3=username/space-name-3
HF_SPACE_APEX_1=username/space-apex-1

# Upstash + E2B + N8N
UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=
E2B_KEY=
...
```
