import numpy as np

try:
    import mediapipe as mp
    import cv2
    mp_pose = mp.solutions.pose
    MEDIAPIPE_AVAILABLE = True
except (ImportError, AttributeError):
    mp_pose = None
    MEDIAPIPE_AVAILABLE = False


def extract_landmarks(image_bytes: bytes) -> list:
    """Extract body pose landmarks from an image using MediaPipe."""
    if not MEDIAPIPE_AVAILABLE or mp_pose is None:
        return _generate_mock_landmarks()

    img = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode image")

    with mp_pose.Pose(static_image_mode=True, model_complexity=2) as pose:
        results = pose.process(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))

    if not results.pose_landmarks:
        raise ValueError("No person detected in image")

    return [(lm.x, lm.y, lm.z, lm.visibility) for lm in results.pose_landmarks.landmark]


def _generate_mock_landmarks() -> list:
    """Generate mock landmarks for demo when MediaPipe is not available."""
    np.random.seed(42)
    landmarks = []
    for i in range(33):
        x = 0.5 + np.random.normal(0, 0.05)
        y = 0.3 + (i / 33) * 0.6 + np.random.normal(0, 0.02)
        z = np.random.normal(0, 0.05)
        visibility = 0.9 + np.random.normal(0, 0.05)
        landmarks.append((float(x), float(y), float(z), float(max(0, min(1, visibility)))))
    return landmarks
