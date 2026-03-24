from typing import List
import os

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

app = FastAPI(title="Medical Platform Embedding Service", version="2.0.0")
MODEL_NAME = os.getenv("EMBEDDING_MODEL", "BAAI/bge-m3")
model = SentenceTransformer(MODEL_NAME)


class EmbedRequest(BaseModel):
    texts: List[str]


class EmbedResponse(BaseModel):
    embeddings: List[List[float]]
    dimensions: int
    model: str


@app.get("/health")
def health():
    return {"status": "ok", "model": MODEL_NAME}


@app.post("/embed", response_model=EmbedResponse)
def embed(req: EmbedRequest):
    if not req.texts:
        raise HTTPException(status_code=400, detail="texts cannot be empty")
    vecs = model.encode(req.texts, normalize_embeddings=True).tolist()
    return EmbedResponse(
        embeddings=vecs,
        dimensions=len(vecs[0]) if vecs else 0,
        model=MODEL_NAME,
    )
