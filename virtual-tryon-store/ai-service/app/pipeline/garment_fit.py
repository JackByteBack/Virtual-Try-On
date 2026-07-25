import io
import requests
import trimesh


def _load_glb(url: str):
    response = requests.get(url, timeout=60)
    response.raise_for_status()
    return trimesh.load(io.BytesIO(response.content), file_type="glb", force="scene")


def drape_garment(avatar_url: str, garment_url: str):
    """
    MVP: combine pre-aligned avatar and garment scenes at origin.
    """
    avatar = _load_glb(avatar_url)
    garment = _load_glb(garment_url)
    scene = trimesh.Scene()
    for name, geom in avatar.geometry.items():
        scene.add_geometry(geom, node_name=f"body_{name}")
    for name, geom in garment.geometry.items():
        scene.add_geometry(geom, node_name=f"garment_{name}")
    return scene
