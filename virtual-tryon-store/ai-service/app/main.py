from fastapi import FastAPI, UploadFile, File, HTTPException
from app.pipeline.landmarks import extract_landmarks
from app.pipeline.body_fit import fit_smplx_body
from app.pipeline.texture import build_texture
from app.pipeline.garment_fit import drape_garment
from app.utils.storage import upload_glb

app = FastAPI(title="Virtual Try-On AI Service")


@app.get("/health")
async def health():
    return {"ok": True}


@app.post("/generate-avatar")
async def generate_avatar(
    front: UploadFile = File(...),
    back: UploadFile = File(...),
    left: UploadFile = File(...),
    right: UploadFile = File(...),
):
    images = {
        "front": await front.read(),
        "back": await back.read(),
        "left": await left.read(),
        "right": await right.read(),
    }
    try:
        landmarks = {k: extract_landmarks(v) for k, v in images.items()}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    body_mesh = fit_smplx_body(landmarks)
    textured_mesh = build_texture(body_mesh, images)
    url = upload_glb(textured_mesh, prefix="avatars")
    return {"avatarUrl": url}


@app.post("/fit-garment")
async def fit_garment(payload: dict):
    avatar_url = payload.get("avatarUrl")
    garment_url = payload.get("garmentUrl")
    if not avatar_url or not garment_url:
        raise HTTPException(status_code=400, detail="avatarUrl and garmentUrl are required")
    combined = drape_garment(avatar_url, garment_url)
    url = upload_glb(combined, prefix="results")
    return {"combinedModelUrl": url}
