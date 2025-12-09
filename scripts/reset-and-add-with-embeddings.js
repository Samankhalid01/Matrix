import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// Supabase configuration
const supabaseUrl = 'https://qdwsqbzlhyxhebdlqath.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkd3NxYnpsaHl4aGViZGxxYXRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDQwMDMxNSwiZXhwIjoyMDc1OTc2MzE1fQ.gJwFLaQuM4XNYcrBIIPDITKy3rkEDcidgpj6a-Xd8xc';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Embeddings service URL
const EMBEDDINGS_SERVICE_URL = 'http://localhost:8000';

// Check if embeddings service is running
async function checkEmbeddingsService() {
  console.log('🔍 Checking embeddings service...');
  try {
    const response = await fetch(`${EMBEDDINGS_SERVICE_URL}/health`, {
      timeout: 5000
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Embeddings service is ONLINE');
      console.log(`   Model: ${data.model || 'all-MiniLM-L6-v2'}`);
      console.log(`   Status: ${data.status}\n`);
      return true;
    }
    return false;
  } catch (error) {
    console.log('❌ Embeddings service is OFFLINE');
    console.log(`   Error: ${error.message}\n`);
    return false;
  }
}

// Main execution
async function main() {
  console.log('='.repeat(70));
  console.log('  🚀 COMPLETE WORKFLOW: Delete All → Add Products with Embeddings');
  console.log('='.repeat(70));
  console.log('\n');
  
  // Step 1: Check embeddings service
  console.log('📋 STEP 1: Checking Embeddings Service');
  console.log('-'.repeat(70));
  const serviceRunning = await checkEmbeddingsService();
  
  if (!serviceRunning) {
    console.log('⚠️  WARNING: Embeddings service is not running!\n');
    console.log('Please start the embeddings service first:');
    console.log('  cd python-services/embeddings-service');
    console.log('  python app.py\n');
    console.log('Then run this script again.\n');
    process.exit(1);
  }
  
  // Step 2: Delete all existing products
  console.log('📋 STEP 2: Deleting All Existing Products');
  console.log('-'.repeat(70));
  
  try {
    const { data: products, error: fetchError } = await supabase
      .from('Product')
      .select('id, product_name');
    
    if (fetchError) throw fetchError;
    
    if (products && products.length > 0) {
      console.log(`📊 Found ${products.length} products to delete\n`);
      
      const { error: deleteError } = await supabase
        .from('Product')
        .delete()
        .neq('id', 0);
      
      if (deleteError) throw deleteError;
      
      console.log(`✅ Successfully deleted ${products.length} products\n`);
    } else {
      console.log('✅ No existing products found\n');
    }
  } catch (error) {
    console.error('❌ Error deleting products:', error.message);
    process.exit(1);
  }
  
  // Step 3: Add new products with embeddings
  console.log('📋 STEP 3: Adding 150 Products WITH Embeddings');
  console.log('-'.repeat(70));
  console.log('⏳ This will take a few minutes...\n');
  
  // Import and run the bulk add function
  const { default: runBulkAdd } = await import('./bulk-add-with-embeddings.js');
  await runBulkAdd();
  
  console.log('\n' + '='.repeat(70));
  console.log('  ✨ WORKFLOW COMPLETED SUCCESSFULLY!');
  console.log('='.repeat(70));
  console.log('\n📝 Next Steps:');
  console.log('  1. Go to: http://localhost:3001/admin/products');
  console.log('  2. Edit product images');
  console.log('  3. Adjust prices and quantities as needed\n');
}

main().catch(console.error);
