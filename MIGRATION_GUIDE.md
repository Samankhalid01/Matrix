# MongoDB to Supabase Migration Guide

## ✅ Completed Steps:

### 1. Database Configuration
- ✅ Created `/src/lib/supabase.js` with Supabase client
- ✅ Updated `.env.local` with Supabase credentials
- ✅ Removed MongoDB connection strings

### 2. Removed Theft Detection System
- ✅ Deleted `/python-services/theft-detection/` directory
- ✅ Deleted `/src/app/theft-detection/` page
- ✅ Deleted `/src/app/api/theft-detection/` API routes
- ✅ Deleted `/src/app/admin/theft-detection/` admin page
- ✅ Removed theft detection models:
  - `SurveillanceIncident.js`
  - `SurveillanceNotification.js`
  - `SuspiciousActivity.js`
  - `SecurityCamera.js`
- ✅ Updated navigation menus (removed theft detection links)

### 3. Authentication Migration
- ✅ Updated `/src/app/api/auth/signup/route.js` to use Supabase
- ✅ Updated `/src/app/api/auth/login/route.js` to use Supabase
- ✅ Updated `/src/app/api/auth/update-role/route.js` to use Supabase

## 🔄 Next Steps to Complete Migration:

### Step 1: Set Up Supabase Database Schema
1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project: `qdwsqbzlhyxhebdlqath`
3. Click on "SQL Editor" in the left sidebar
4. Copy and paste the contents of `SUPABASE_SCHEMA.sql`
5. Click "Run" to create all tables

### Step 2: Update Additional Fields in Schema
Run this SQL to add store-related fields:

\`\`\`sql
-- Add store-related fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS store_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS store_address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
\`\`\`

### Step 3: Migrate Remaining API Routes
Update these files to use Supabase instead of MongoDB:

#### Product Routes:
- `/src/app/api/products/route.js`
- `/src/app/api/product/[id]/route.js`

#### Customer Routes:
- `/src/app/api/customers/route.js`

#### Analytics Routes:
- `/src/app/api/analytics/route.js`

#### Notification Routes:
- `/src/app/api/notifications/route.js`

#### QR Code Routes:
- `/src/app/api/qrcode/route.js`

### Step 4: Remove MongoDB Dependencies
After migrating all routes, remove MongoDB:

\`\`\`bash
npm uninstall mongoose mongodb
\`\`\`

Delete these files:
- `/src/lib/mongodb.js`
- All files in `/src/models/` (after migration)

### Step 5: Update next.config.js
Remove MongoDB_URI from the config file.

## 📊 Image Storage Options:

### Option 1: Cloudinary (RECOMMENDED for your case)
**Pros:**
- ✅ Already configured in your project
- ✅ Better for large images and transformations
- ✅ CDN delivery for faster loading
- ✅ Image optimization built-in
- ✅ Free tier: 25 GB storage, 25 GB bandwidth

**Use Cloudinary when:**
- Storing product images
- Storing advertisement images
- Need image transformations (resize, crop, etc.)

### Option 2: Supabase Storage
**Pros:**
- ✅ Integrated with your database
- ✅ Simple API
- ✅ Free tier: 1 GB storage

**Use Supabase Storage when:**
- Storing user profile pictures
- Storing small files/documents
- Need direct database integration

### Recommended Approach:
- **Product Images**: Use Cloudinary (already set up)
- **User Avatars**: Use Supabase Storage
- **Generated Ad Images**: Use Cloudinary

## 🔍 Product Embeddings Setup

### Option 1: Using Supabase (pgvector)
1. Enable pgvector extension in Supabase:
\`\`\`sql
CREATE EXTENSION IF NOT EXISTS vector;
\`\`\`

2. The \`products\` table already includes \`embedding VECTOR(768)\` column

3. Generate embeddings using OpenAI or other services:
\`\`\`javascript
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateEmbedding(text) {
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
  });
  return response.data[0].embedding;
}

// Store in Supabase
const embedding = await generateEmbedding(\`\${product.name} \${product.description}\`);
await supabase
  .from('products')
  .update({ embedding })
  .eq('id', productId);
\`\`\`

4. Search using similarity:
\`\`\`javascript
const { data } = await supabase.rpc('match_products', {
  query_embedding: searchEmbedding,
  match_threshold: 0.78,
  match_count: 10
});
\`\`\`

5. Create the search function:
\`\`\`sql
CREATE OR REPLACE FUNCTION match_products(
  query_embedding VECTOR(768),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  description TEXT,
  similarity FLOAT
)
LANGUAGE SQL STABLE
AS $$
  SELECT
    id,
    name,
    description,
    1 - (embedding <=> query_embedding) AS similarity
  FROM products
  WHERE 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$;
\`\`\`

### Option 2: Using Pinecone (External Vector DB)
- Pros: More advanced features, better performance
- Cons: Additional service to manage

## 🎯 Quick Reference: Supabase vs MongoDB

### MongoDB (Before):
\`\`\`javascript
await connectDB();
const user = await User.findOne({ email });
\`\`\`

### Supabase (After):
\`\`\`javascript
const { data: user } = await supabase
  .from('users')
  .select('*')
  .eq('email', email)
  .single();
\`\`\`

### Common Operations:

| Operation | MongoDB | Supabase |
|-----------|---------|----------|
| **Find One** | \`User.findOne({ email })\` | \`supabase.from('users').select('*').eq('email', email).single()\` |
| **Find Many** | \`User.find({ role: 'admin' })\` | \`supabase.from('users').select('*').eq('role', 'admin')\` |
| **Insert** | \`new User(data).save()\` | \`supabase.from('users').insert([data])\` |
| **Update** | \`User.findByIdAndUpdate(id, data)\` | \`supabase.from('users').update(data).eq('id', id)\` |
| **Delete** | \`User.findByIdAndDelete(id)\` | \`supabase.from('users').delete().eq('id', id)\` |

## 📝 Notes:
- MongoDB uses \`_id\`, Supabase uses \`id\` (UUID)
- MongoDB uses camelCase (\`firstName\`), Supabase uses snake_case (\`first_name\`)
- Always handle Supabase errors properly
- Use RLS (Row Level Security) policies for data security
