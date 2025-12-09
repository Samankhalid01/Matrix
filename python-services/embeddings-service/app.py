from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from typing import List, Optional
import uvicorn

app = FastAPI(title="MATRIX Embeddings Service")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load SentenceTransformer model (384-dim)
print("🔄 Loading SentenceTransformer model...")
print("⏳ First-time download may take a few minutes...")
try:
    model = SentenceTransformer('all-MiniLM-L6-v2')
    print("✅ Model loaded successfully!")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    print("⚠️  Make sure you have internet connection for first-time model download")
    raise

class EmbeddingRequest(BaseModel):
    text: str

class BatchEmbeddingRequest(BaseModel):
    texts: List[str]

class ProductEmbeddingRequest(BaseModel):
    product_name: str
    description: Optional[str] = ""
    category: Optional[str] = ""  # Note: DB has 'catergory' typo, but we accept 'category' in API
    tags: Optional[str] = ""

@app.get("/")
def root():
    return {
        "service": "MATRIX Embeddings Service",
        "status": "running",
        "model": "all-MiniLM-L6-v2",
        "dimensions": 384,
        "endpoints": ["/embed", "/embed/batch", "/embed/product"]
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "model_loaded": True}

@app.post("/embed")
def generate_embedding(request: EmbeddingRequest):
    """Generate embedding for a single text"""
    try:
        embedding = model.encode(request.text).tolist()
        return {
            "success": True,
            "embedding": embedding,
            "dimensions": len(embedding)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/embed/batch")
def generate_batch_embeddings(request: BatchEmbeddingRequest):
    """Generate embeddings for multiple texts"""
    try:
        embeddings = model.encode(request.texts).tolist()
        return {
            "success": True,
            "embeddings": embeddings,
            "count": len(embeddings),
            "dimensions": len(embeddings[0]) if embeddings else 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/embed/product")
def generate_product_embedding(request: ProductEmbeddingRequest):
    """Generate embedding specifically for product data"""
    try:
        # Combine product fields into a single text
        text_parts = [
            request.product_name,
            request.category,
            request.description,
            request.tags
        ]
        text = " ".join([part for part in text_parts if part]).strip()
        
        if not text:
            raise HTTPException(status_code=400, detail="No text provided")
        
        embedding = model.encode(text).tolist()
        
        return {
            "success": True,
            "embedding": embedding,
            "dimensions": len(embedding),
            "text_used": text
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print("🚀 Starting MATRIX Embeddings Service on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
