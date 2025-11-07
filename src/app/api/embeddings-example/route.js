import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { OpenAI } from 'openai';

// Initialize OpenAI (add OPENAI_API_KEY to your .env.local)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate embedding from text
 */
async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text.substring(0, 8000), // Limit to 8000 characters
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * POST - Generate and store embeddings for a product
 */
export async function POST(request) {
  try {
    const { productId, text } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Get product if text not provided
    let embeddingText = text;
    if (!embeddingText) {
      const { data: product, error } = await supabase
        .from('products')
        .select('name, description, category')
        .eq('id', productId)
        .single();

      if (error || !product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }

      // Combine product fields for embedding
      embeddingText = `${product.name} ${product.description || ''} ${product.category || ''}`.trim();
    }

    // Generate embedding
    const embedding = await generateEmbedding(embeddingText);

    // Store embedding in database
    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update({ embedding })
      .eq('id', productId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating product:', updateError);
      return NextResponse.json(
        { error: 'Failed to store embedding' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Embedding generated and stored successfully',
      productId: updatedProduct.id,
      embeddingDimensions: embedding.length
    });

  } catch (error) {
    console.error('POST embedding error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

/**
 * GET - Search products by semantic similarity
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const limit = parseInt(searchParams.get('limit') || '10');
    const threshold = parseFloat(searchParams.get('threshold') || '0.78');

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Generate embedding for search query
    const queryEmbedding = await generateEmbedding(query);

    // Search using Supabase RPC function
    const { data: products, error } = await supabase.rpc('match_products', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit
    });

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json(
        { error: 'Failed to search products' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      query,
      results: products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        similarity: p.similarity,
        relevanceScore: (p.similarity * 100).toFixed(2) + '%'
      })),
      count: products.length
    });

  } catch (error) {
    console.error('GET search error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT - Batch generate embeddings for all products
 */
export async function PUT(request) {
  try {
    // Get all products without embeddings
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, description, category')
      .is('embedding', null);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    if (!products || products.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All products already have embeddings',
        processed: 0
      });
    }

    // Process embeddings in batches to avoid rate limits
    const batchSize = 5;
    let processed = 0;
    const errors = [];

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (product) => {
          try {
            const text = `${product.name} ${product.description || ''} ${product.category || ''}`.trim();
            const embedding = await generateEmbedding(text);

            await supabase
              .from('products')
              .update({ embedding })
              .eq('id', product.id);

            processed++;
          } catch (error) {
            console.error(`Error processing product ${product.id}:`, error);
            errors.push({ productId: product.id, error: error.message });
          }
        })
      );

      // Add delay between batches to respect rate limits
      if (i + batchSize < products.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Batch embedding generation completed',
      processed,
      total: products.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('PUT batch embedding error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}
