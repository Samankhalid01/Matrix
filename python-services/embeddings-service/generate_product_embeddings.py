"""
Backfill / one-shot script to generate embeddings for all products and store them in Supabase.
Usage:
  pip install supabase sentence-transformers python-dotenv
  set SUPABASE_URL=...  # or use a .env file
  set SUPABASE_SERVICE_KEY=...  # Service Role Key required for writes
  python generate_product_embeddings.py

This script fetches products using the 'id' field and updates embeddings.
"""
import os
from supabase import create_client
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
import time

# Load .env if present
load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://qdwsqbzlhyxhebdlqath.supabase.co')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

if not SUPABASE_SERVICE_KEY:
    raise SystemExit("SUPABASE_SERVICE_KEY environment variable must be set")

print('✅ Connecting to Supabase...')
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print('🔄 Loading SentenceTransformer model (all-MiniLM-L6-v2)...')
model = SentenceTransformer('all-MiniLM-L6-v2')
print('✅ Model loaded!')

# Fetch products - using id, product_name, description, catergory (note: typo in DB), tags
print('📊 Fetching products from database...')
resp = supabase.table('Product').select('id, product_name, description, catergory, tags').execute()
rows = resp.data or []
print(f'✅ Found {len(rows)} products')

if len(rows) == 0:
    print('⚠️ No products found in database')
    exit(0)

success_count = 0
error_count = 0

for idx, p in enumerate(rows, start=1):
    try:
        product_id = p.get('id')
        
        # Build text from all fields (same as your partner's code but with tags)
        text = f"{p.get('product_name') or ''}. {p.get('description') or ''}. Category: {p.get('catergory') or ''}. Tags: {p.get('tags') or ''}"
        
        # Generate embedding
        embedding = model.encode(text).tolist()

        # Update product with embedding
        upd = supabase.table('Product').update({'embedding': embedding}).eq('id', product_id).execute()
        
        success_count += 1
        
        if idx % 10 == 0 or idx == len(rows):
            print(f'📈 Processed {idx}/{len(rows)} (id={product_id}) - Success: {success_count}, Errors: {error_count}')
        
        # Small delay to avoid rate limits
        time.sleep(0.05)
        
    except Exception as e:
        error_count += 1
        print(f"❌ Error processing product at index {idx}: {e}")

print(f'\n✅ Completed! Processed {len(rows)} products')
print(f'   ✅ Success: {success_count}')
print(f'   ❌ Errors: {error_count}')
