import os
import uuid
from pathlib import Path
from typing import Union

STORAGE_DIR = Path(os.getenv("STORAGE_DIR", "/tmp/tryon-storage"))
STORAGE_DIR.mkdir(parents=True, exist_ok=True)

AWS_BUCKET = os.getenv("AWS_BUCKET")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")

_use_s3 = bool(AWS_BUCKET and AWS_BUCKET != "your-bucket")


def upload_glb(mesh_data: Union[dict, bytes], prefix: str = "models") -> str:
    """Upload a .glb file to storage and return its URL."""
    if isinstance(mesh_data, dict):
        glb_bytes = _mesh_dict_to_glb(mesh_data)
    else:
        glb_bytes = mesh_data

    filename = f"{prefix}/{uuid.uuid4().hex}.glb"

    if _use_s3:
        return _upload_to_s3(glb_bytes, filename)
    else:
        return _upload_to_local(glb_bytes, filename)


def download_glb(url: str) -> bytes:
    """Download a .glb file from a URL or local path."""
    if url.startswith("http"):
        import urllib.request
        with urllib.request.urlopen(url) as response:
            return response.read()
    else:
        local_path = STORAGE_DIR / url.replace("http://localhost:8000/", "")
        if local_path.exists():
            return local_path.read_bytes()
        raise FileNotFoundError(f"File not found: {url}")


def _upload_to_s3(data: bytes, filename: str) -> str:
    """Upload to AWS S3."""
    import boto3
    s3 = boto3.client("s3", region_name=AWS_REGION)
    s3.put_object(Bucket=AWS_BUCKET, Key=filename, Body=data, ContentType="model/gltf-binary")
    return f"https://{AWS_BUCKET}.s3.{AWS_REGION}.amazonaws.com/{filename}"


def _upload_to_local(data: bytes, filename: str) -> str:
    """Upload to local filesystem storage."""
    filepath = STORAGE_DIR / filename
    filepath.parent.mkdir(parents=True, exist_ok=True)
    filepath.write_bytes(data)
    return f"http://localhost:8000/storage/{filename}"


def _mesh_dict_to_glb(mesh_data: dict) -> bytes:
    """Convert a mesh dictionary to .glb binary format."""
    from app.pipeline.body_fit import mesh_to_glb_bytes
    return mesh_to_glb_bytes(mesh_data)
