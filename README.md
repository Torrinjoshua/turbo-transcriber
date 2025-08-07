# Turbo Transcriber – Next.js Starter

A production-ready starter to transcribe audio/video in seconds. Users can upload files (`.mp3`, `.wav`, `.m4a`, `.mp4`, etc.) **or paste a link** (YouTube, Instagram, TikTok, Twitter/X, etc.). The server downloads remote media via `yt-dlp` and sends it to OpenAI's Speech-to-Text models (`gpt-4o-transcribe` or `gpt-4o-mini-transcribe`).

## Features
- ⚡️ Fast, accurate transcription (OpenAI STT)
- 📦 Upload files or paste a link
- ⬇️ Link downloader via `yt-dlp` (handles many platforms including YouTube/Instagram/TikTok)
- 🗣️ Auto language detection
- 🧩 Simple Next.js App Router API route
- 🛡️ File size & type checks, temp cleanup
- 🚀 Deployable to Railway/Render/VPS (Vercel not recommended if you need `yt-dlp` — use a Node server host)

## Quick Start

1) **Clone & install**
```bash
npm i
```

2) **Create `.env.local`**
```
OPENAI_API_KEY=sk-...yourkey...
# Choose model: gpt-4o-transcribe (best) or gpt-4o-mini-transcribe (cheaper/faster)
TRANSCRIBE_MODEL=gpt-4o-transcribe
# Optional: max upload size in MB
MAX_UPLOAD_MB=100
```

3) **Run dev**
```bash
npm run dev
```

4) Open http://localhost:3000

## Deploy Notes
- Use a host that supports Node.js with native binaries (Railway, Render, Fly.io, a VPS). `yt-dlp` requires a real runtime; serverless platforms can be problematic.
- If you deploy to Vercel, disable the URL feature or move the downloader to a tiny sidecar service (e.g., a Docker microservice exposing `/download?url=...`) and keep the main app on Vercel.

## Legal & Platform Notes
- Only transcribe content you have rights to use. Respect platform Terms of Service.
- Private links or age-restricted content may fail to download; ensure public accessibility.

## Tech
- Next.js 14 App Router
- TypeScript
- `yt-dlp-exec` to fetch remote media
- OpenAI Audio API

## Scripts
- `npm run dev` – start next dev
- `npm run build` – build
- `npm start` – start production

---

## Troubleshooting

**`yt-dlp` not found or fails**
- Some hosts block binary downloads. Deploy on Railway/Render, or use Docker locally/hosted. You can also pre-bundle the binary or switch to a separate downloader microservice.

**Large files time out**
- Increase `MAX_UPLOAD_MB`. Also increase request timeouts in your host. For very large files, you may want to chunk or do background jobs.

**Instagram/Private links** 
- Only public content generally works. For private accounts, you need authenticated downloading — not included for ToS reasons.

---

## License
MIT



## One-click-ish Deployments

### Option A) Deploy on Render (easiest)
1. Create a new **Web Service** on Render.
2. Choose **"Docker"** as the environment and connect your repo. (Or upload this folder as a new repo.)
3. Render will detect `render.yaml` and build using the `Dockerfile`.
4. Set env vars in Render dashboard:
   - `OPENAI_API_KEY` = your key
   - (optional) `TRANSCRIBE_MODEL` = `gpt-4o-transcribe` or `gpt-4o-mini-transcribe`
   - (optional) `MAX_UPLOAD_MB` = `100`
5. Hit **Deploy**. After it's live, open the URL to test.

**Connect your domain**: In Render service → **Settings → Custom Domains**, add your domain. Render will provide DNS records (usually a CNAME). Add them at your domain registrar and wait for propagation.

---

### Option B) Deploy on Railway
1. Create a new Railway project → **"Deploy from Repo"** with this folder as a repo.
2. Railway will detect the `Dockerfile`. No special config needed.
3. Add env vars in Railway:
   - `OPENAI_API_KEY`
   - `TRANSCRIBE_MODEL` (optional)
   - `MAX_UPLOAD_MB` (optional)
4. Deploy. Visit the generated URL to test.

**Connect your domain**: In Railway service → **Settings → Domains**, add your domain. Railway will show DNS targets (CNAME/ALIAS). Add them at your registrar.

---

### Option C) Your own VPS (Docker)
1. Copy files to your server and run:
   ```bash
   docker build -t turbo-transcriber .
   docker run -d --restart=always -p 80:3000 \
     -e OPENAI_API_KEY=sk-... \
     -e TRANSCRIBE_MODEL=gpt-4o-transcribe \
     -e MAX_UPLOAD_MB=100 \
     --name transcriber turbo-transcriber
   ```
2. Point your domain’s DNS **A record** to your server’s IP.
3. For HTTPS, add a reverse proxy like **Caddy** or **nginx + certbot**, or run a companion like `traefik` or `caddy` in Docker.

**Example (Caddyfile):**
```
yourdomain.com {
  reverse_proxy 127.0.0.1:3000
}
```
Run Caddy with a container or system package; it will fetch/renew Let’s Encrypt automatically.

---

## DNS 101 (Custom Domain)
- If hosting on **Render/Railway**: use the CNAME they provide (e.g., `www` → `your-app.onrender.com`). For apex/root domains without CNAME support, use ALIAS/ANAME if your DNS supports it or forward apex to `www`.
- If hosting on a **VPS**: Create an **A record** pointing to your server’s public IP. Use a TLS terminator (Caddy/nginx/Traefik) to get HTTPS.




### Option D) Netlify (frontend + functions) — with external downloader
Netlify’s serverless environment doesn’t reliably run `yt-dlp` + `ffmpeg`. So this repo supports Netlify by hosting the **frontend + transcription API** on Netlify and using a tiny **downloader microservice** (in `downloader-service/`) on Render/Railway/Fly.

**Steps:**
1. Deploy `downloader-service/` to Render/Railway (Docker supported). After deploy, note the public URL, e.g. `https://your-downloader.onrender.com`.
2. In this main app (on Netlify), set env vars:
   - `OPENAI_API_KEY`
   - `TRANSCRIBE_MODEL` (optional)
   - `MAX_UPLOAD_MB` (optional)
   - `DOWNLOADER_URL` = `https://your-downloader.onrender.com`
3. Push this repo and **Connect to Netlify** → Build with default settings (uses `netlify.toml` + Next plugin).
4. Test uploads and URL transcription. (URL mode now streams audio from your downloader service.)
5. Add your custom domain in **Netlify → Domain settings** and set the DNS per Netlify’s instructions.

If you really want everything in Netlify Functions only, you’d need to bundle static `ffmpeg` / `yt-dlp` and stay within size/time limits — not recommended.
