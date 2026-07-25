# Virtual Try-On Store

A 3D Virtual Try-On e-commerce platform that lets users upload photos, generate a 3D avatar, and try on clothes virtually.

## Architecture

| Service | Stack | Port |
|---------|-------|------|
| `frontend/` | Next.js 14, React Three Fiber, Tailwind CSS | 3000 |
| `backend/` | Node.js, Express, TypeScript, MongoDB | 5000 |
| `ai-service/` | Python FastAPI, MediaPipe, trimesh | 8000 |
| `mongo` | MongoDB 7 | 27017 |

## Quick Start

### Docker (Recommended)

```bash
docker-compose up --build
```

### Local Development

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**AI Service:**
```bash
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Features

- **E-commerce Store**: Browse products, view details, add to cart, checkout
- **Virtual Try-On**: Upload 4 upper-body photos, generate 3D avatar, try on clothes
- **3D Viewer**: Interactive 3D model viewer with orbit controls
- **JWT Authentication**: Register/login with secure token-based auth

## API Endpoints

### Backend (port 5000)

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product
- `POST /api/products` - Create product (auth required)
- `POST /api/orders` - Create order (auth required)
- `GET /api/orders/me` - Get user orders (auth required)
- `POST /api/tryon/generate-avatar` - Generate 3D avatar (auth required)
- `POST /api/tryon/fit-garment` - Fit garment to avatar (auth required)

### AI Service (port 8000)

- `GET /health` - Health check
- `POST /generate-avatar` - Generate avatar from 4 photos
- `POST /fit-garment` - Combine avatar with garment

## Environment Variables

### Backend

- `MONGO_URI` - MongoDB connection string
- `AI_SERVICE_URL` - AI service URL
- `JWT_SECRET` - JWT signing secret

### AI Service

- `STORAGE_DIR` - Local storage directory
- `AWS_BUCKET` - S3 bucket name (optional)
- `AWS_REGION` - AWS region (optional)

### Frontend

- `NEXT_PUBLIC_API_URL` - Backend API URL

## Notes

- The AI service uses a generic avatar fallback when SMPL-X weights are not available
- Avatar generation takes ~1-2 minutes
- GPU recommended for production AI service
