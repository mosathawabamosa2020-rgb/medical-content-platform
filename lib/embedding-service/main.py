import os

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

app = FastAPI(title="Medical Platform Embedding Service", version="2.0.0")
MODEL_NAME = os.getenv("EMBEDDING_MODEL", "BAAI/bge-m3")
MODEL_LOAD_ERROR = None

try:
    model = SentenceTransformer(MODEL_NAME)
except Exception as exc:  # pragma: no cover - startup safeguard
    model = None
    MODEL_LOAD_ERROR = str(exc)


class EmbedRequest(BaseModel):
    texts: list[str]


class EmbedResponse(BaseModel):
    embeddings: list[list[float]]
    dimensions: int
    model: str


@app.get("/health")
def health():
    if model is None:
        return {"status": "error", "model": MODEL_NAME, "error": MODEL_LOAD_ERROR}
    return {"status": "ok", "model": MODEL_NAME}


@app.post("/embed", response_model=EmbedResponse)
def embed(req: EmbedRequest):
    if model is None:
        raise HTTPException(status_code=503, detail=f"embedding model failed to load: {MODEL_LOAD_ERROR}")
    if not req.texts:
        raise HTTPException(status_code=400, detail="texts cannot be empty")
    vecs = model.encode(req.texts, normalize_embeddings=True).tolist()
    return EmbedResponse(
        embeddings=vecs,
        dimensions=len(vecs[0]) if vecs else 0,
        model=MODEL_NAME,
    )
