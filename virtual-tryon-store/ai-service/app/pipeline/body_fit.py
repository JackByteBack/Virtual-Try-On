import os
import trimesh

GENERIC_AVATAR = os.path.join(os.path.dirname(__file__), "../../models/generic_avatar.glb")


def fit_smplx_body(landmarks: dict):
    """
    MVP fallback:
    use a generic avatar and scale horizontally from front-view shoulder ratio.
    """
    if not os.path.exists(GENERIC_AVATAR):
        raise FileNotFoundError("Missing ai-service/models/generic_avatar.glb")

    mesh = trimesh.load(GENERIC_AVATAR, force="scene")
    front = landmarks["front"]
    shoulder_width = abs(front[11][0] - front[12][0])
    torso_height = abs(front[11][1] - front[23][1])
    if torso_height > 0:
        ratio = shoulder_width / torso_height
        mesh.apply_scale([ratio / 0.65, 1.0, 1.0])
    return mesh
