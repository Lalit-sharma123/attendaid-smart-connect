import base64
import cv2
import numpy as np
from functools import lru_cache
from insightface.app import FaceAnalysis


@lru_cache(maxsize=1)
def get_face_app():
    """
    SCRFD + ArcFace through InsightFace.

    buffalo_s = faster, good for CPU/local dev.
    buffalo_l = better accuracy, heavier.
    """
    app = FaceAnalysis(
        name="buffalo_s",
        providers=["CPUExecutionProvider"],
    )
    app.prepare(
        ctx_id=-1,
        det_size=(320, 320),
    )
    return app


def decode_base64_image(image_base64: str):
    """
    Accepts raw base64 or data URL:
    data:image/jpeg;base64,...
    """
    if "," in image_base64:
        image_base64 = image_base64.split(",", 1)[1]

    image_bytes = base64.b64decode(image_base64)
    np_arr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if img is None:
        raise ValueError("Invalid image")

    return img


def normalize_embedding(embedding):
    emb = np.asarray(embedding, dtype=np.float32)
    norm = np.linalg.norm(emb)
    if norm == 0:
        return emb
    return emb / norm


def cosine_similarity(a, b):
    a = normalize_embedding(a)
    b = normalize_embedding(b)
    return float(np.dot(a, b))


def analyze_face_image(image_base64: str):
    app = get_face_app()
    img = decode_base64_image(image_base64)

    faces = app.get(img)

    if not faces:
        return {
            "face_detected": False,
            "message": "No face detected",
            "faces": [],
        }

    # Pick largest face for attendance/enrollment
    faces = sorted(
        faces,
        key=lambda f: (f.bbox[2] - f.bbox[0]) * (f.bbox[3] - f.bbox[1]),
        reverse=True,
    )

    face = faces[0]
    embedding = normalize_embedding(face.embedding).tolist()

    return {
        "face_detected": True,
        "bbox": [float(x) for x in face.bbox],
        "landmarks": face.kps.tolist() if getattr(face, "kps", None) is not None else None,
        "det_score": float(face.det_score),
        "embedding": embedding,
        "embedding_dim": len(embedding),
        "model_name": "SCRFD + ArcFace",
        "model_version": "insightface-buffalo_s",
    }
