<div align="center">

# 🪞 Virtual-Try-On — KAMUI

**A 3D Virtual Try-On e-commerce platform.** Upload a few photos, generate a 3D avatar, and try on clothes virtually before you buy.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?logo=fastapi&logoColor=white)
![Three.js](https://img.shields.io/badge/React%20Three%20Fiber-3D-orange?logo=three.js)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

</div>

---

## 🧵 Overview

**Virtual-Try-On** (codename **KAMUI**) is a full-stack e-commerce platform with an AI-powered virtual fitting room. Users browse a product catalog, upload a handful of upper-body photos, and the AI service builds a 3D avatar that garments can be fit onto — so shoppers get a real sense of fit and look before checkout.

The project is split into three independently deployable services, orchestrated with Docker Compose.

## 🏗️ Architecture

| Service | Stack | Port |
|---|---|---|
| `frontend/` | Next.js 14, React Three Fiber, Tailwind CSS | `3000` |
| `backend/` | Node.js, Express, TypeScript, MongoDB | `5000` |
| `ai-service/` | Python, FastAPI, MediaPipe, trimesh | `8000` |
| `mongo` | MongoDB 7 | `27017` |

```
Virtual-Try-On/
└── virtual-tryon-store/
    ├── frontend/       # Next.js storefront + 3D viewer
    ├── backend/        # Express API, auth, products, orders
    ├── ai-service/     # Avatar generation + garment fitting
    └── docker-compose.yml
```

## ✨ Features

- 🛍️ **E-commerce store** — browse products, view details, cart, checkout
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

### Backend (`:5000`)

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login |
| `GET` | `/api/products` | List products |
| `GET` | `/api/products/:id` | Get product |
| `POST` | `/api/products` | Create product 🔒 |
| `POST` | `/api/orders` | Create order 🔒 |
| `GET` | `/api/orders/me` | Get user orders 🔒 |
| `POST` | `/api/tryon/generate-avatar` | Generate 3D avatar 🔒 |
| `POST` | `/api/tryon/fit-garment` | Fit garment to avatar 🔒 |

🔒 = requires JWT auth

### AI Service (`:8000`)

| Method | Route | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/generate-avatar` | Generate avatar from 4 photos |
| `POST` | `/fit-garment` | Combine avatar with garment |

## ⚙️ Environment Variables

**Backend**
```
MONGO_URI=          # MongoDB connection string
AI_SERVICE_URL=      # AI service URL
JWT_SECRET=          # JWT signing secret
```

**AI Service**
```
STORAGE_DIR=         # Local storage directory
AWS_BUCKET=          # S3 bucket name (optional)
AWS_REGION=          # AWS region (optional)
```

**Frontend**
```
NEXT_PUBLIC_API_URL=  # Backend API URL
```

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