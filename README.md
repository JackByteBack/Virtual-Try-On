<div align="center">

# 🪞 Virtual-Try-On — KAMUI

**A 3D Virtual Try-On e-commerce platform.** Upload a few photos, generate a 3D avatar, and try on clothes virtually before you buy.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?logo=supabase&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?logo=fastapi&logoColor=white)
![Three.js](https://img.shields.io/badge/React%20Three%20Fiber-3D-orange?logo=three.js)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

</div>

---

## 🧵 Overview

**Virtual-Try-On** (codename **KAMUI**) is a full-stack e-commerce platform with an AI-powered virtual fitting room. Users browse a product catalog, upload a handful of upper-body photos, and the AI service builds a 3D avatar that garments can be fit onto — so shoppers get a real sense of fit and look before checkout.

The project is split into three independently deployable services, orchestrated with Docker Compose.

## 🏗️ Architecture

| Service | Stack | Port | Actually used for |
|---|---|---|---|
| `frontend/` | Next.js 14, React Three Fiber, Tailwind CSS | `3000` | UI, and talks **directly** to InsForge for auth/products/orders |
| `backend/` | Node.js, Express, TypeScript, Supabase (Postgres) | `5001` | Scrape-proxy (`/api/scrape`) + try-on proxy to the AI service |
| `ai-service/` | Python, FastAPI, MediaPipe, trimesh, PyTorch | `8000` | Avatar generation + garment fitting |

```
Virtual-Try-On/
└── virtual-tryon-store/
    ├── frontend/       # Next.js storefront + 3D viewer
    ├── backend/        # Express API — scrape-proxy, try-on proxy (see note below)
    ├── ai-service/     # Avatar generation + garment fitting
    └── docker-compose.yml
```

> ⚠️ **Real current split (not a to-do, this is how it actually works right now):** the frontend's `src/lib/api.ts` calls the **InsForge SDK directly** for `auth`, `products`, and `orders` — the Express backend's own `/api/auth`, `/api/products`, and `/api/orders` routes (which talk to Supabase) exist in the codebase but **aren't called by the frontend at all**. The backend is only actually hit for two things: scraping a product URL (`/api/scrape/scrape`, proxied to avoid CORS) and the try-on pipeline (`/api/tryon/*`, proxied to the AI service). The scraped product itself then gets **inserted into InsForge**, not saved via `/api/scrape/import` (which still writes to Supabase Postgres and is currently dead code).
>
> **Decision needed:** either (a) make InsForge the single source of truth and delete the now-unused backend routes + Supabase models, or (b) route everything back through the backend and drop the direct InsForge calls from the frontend. Right now you have both, and they're not in sync.

## ✨ Features

- 🛍️ **E-commerce store** — browse products, view details, cart, checkout
- 📦 **Product import** — paste a product URL (Amazon/Flipkart/etc.); backend scrapes name, price, images, and category, then the result is saved straight to InsForge
- 🧍 **Virtual try-on** — upload 4 upper-body photos to generate a 3D avatar
- 🎮 **Interactive 3D viewer** — orbit-controlled model viewer built with React Three Fiber
- 🔐 **JWT authentication** — secure register/login with token-based sessions
- 🐳 **Dockerized** — one command spins up the entire stack

## 🚀 Quick Start

### Docker (recommended)

```bash
docker-compose up --build
```

### Local development

**Backend**
```bash
cd virtual-tryon-store/backend
npm install
npm run dev
```

**AI Service**
```bash
cd virtual-tryon-store/ai-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend**
```bash
cd virtual-tryon-store/frontend
npm install
npm run dev
```

## 📡 API Endpoints

### Backend (`:5001`)

| Method | Route | Description | Called by frontend? |
|---|---|---|---|
| `POST` | `/api/scrape/scrape` | Scrape a product URL for name/price/images | ✅ Yes |
| `POST` | `/api/tryon/generate-avatar` | Generate 3D avatar 🔒 | ✅ Yes |
| `POST` | `/api/tryon/fit-garment` | Fit garment to avatar 🔒 | ✅ Yes |
| `POST` | `/api/auth/register` | Register new user | ❌ No — frontend uses InsForge auth directly |
| `POST` | `/api/auth/login` | Login | ❌ No — frontend uses InsForge auth directly |
| `GET` | `/api/products` | List products | ❌ No — frontend queries InsForge directly |
| `GET` | `/api/products/:id` | Get product | ❌ No |
| `POST` | `/api/products` | Create product 🔒 | ❌ No |
| `POST` | `/api/orders` | Create order 🔒 | ❌ No — frontend writes to InsForge directly |
| `GET` | `/api/orders/me` | Get user orders 🔒 | ❌ No |
| `POST` | `/api/scrape/import` | Save a scraped product to Supabase | ❌ No — frontend saves the scraped product to InsForge instead |

🔒 = requires JWT auth. The "❌ No" routes are dead code as of the current frontend — safe to remove once you commit to InsForge, or wire the frontend back to them if you go the other way.

### AI Service (`:8000`)

| Method | Route | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/generate-avatar` | Generate avatar from 4 photos |
| `POST` | `/fit-garment` | Combine avatar with garment |

## ⚙️ Environment Variables

**Backend**
```
DATABASE_URL=                    # Postgres connection string (Supabase)
NEXT_PUBLIC_SUPABASE_URL=        # Supabase project URL
SUPABASE_ANON_KEY=               # Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY=       # Supabase service role key (server-side only)
AI_SERVICE_URL=                  # AI service URL
JWT_SECRET=                      # JWT signing secret
PORT=                            # Defaults to 5001
```

**AI Service**
```
STORAGE_DIR=         # Local storage directory
AWS_BUCKET=          # S3 bucket name (optional)
AWS_REGION=          # AWS region (optional)
```

**Frontend**
```
NEXT_PUBLIC_API_URL=               # Backend URL — used only for /api/scrape and /api/tryon
NEXT_PUBLIC_INSFORGE_URL=          # InsForge project URL — actively used (auth, products, orders)
NEXT_PUBLIC_INSFORGE_ANON_KEY=     # InsForge anon key — actively used
```

> `utils/supabase/*` (client.ts, server.ts, middleware.ts) and the `@supabase/supabase-js` / `@supabase/ssr` packages are still in the frontend but nothing in `src/` imports them anymore — leftover from before the InsForge move. Safe to delete once you're sure InsForge is the final choice.

> ⚠️ `.env.local` is currently committed in `virtual-tryon-store/frontend/`. Untrack it (`git rm --cached virtual-tryon-store/frontend/.env.local`), add it to `.gitignore`, and rotate the InsForge keys since they've been exposed in a public repo.

## ☁️ Deployment

**Frontend on Vercel:** since this is a monorepo, Vercel's **Root Directory** setting must point to the folder, not a file:
```
virtual-tryon-store/frontend
```
Framework Preset should auto-detect as **Next.js** once that's set correctly. If it still shows "Other," the Root Directory value is wrong — retype it and re-save. Remember to also add the frontend env vars above under the project's Environment Variables before redeploying.

**Backend / AI service:** deploy separately (Railway, Render, Fly.io, or a VPS) since they're long-running Express/FastAPI servers, not serverless functions. Point `NEXT_PUBLIC_API_URL` at wherever the backend ends up.

## 📝 Notes

- The AI service falls back to a generic avatar when SMPL-X weights aren't available
- Avatar generation takes roughly 1–2 minutes
- A GPU is recommended for the AI service in production

## 🗺️ Roadmap

- [ ] Multi-view SMPL-X body fitting for higher-fidelity avatars
- [ ] Realistic 3D garment draping/simulation
- [ ] Production-ready GPU inference pipeline

---

<div align="center">
Built by <a href="https://github.com/JackByteBack">JackByteBack</a>
</div>
