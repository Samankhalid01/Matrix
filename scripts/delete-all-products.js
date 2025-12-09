import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://qdwsqbzlhyxhebdlqath.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkd3NxYnpsaHl4aGViZGxxYXRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDQwMDMxNSwiZXhwIjoyMDc1OTc2MzE1fQ.gJwFLaQuM4XNYcrBIIPDITKy3rkEDcidgpj6a-Xd8xc';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deleteAllProducts() {
  console.log('🗑️  Starting to delete all products...\n');
  
  try {
    // First, delete all cart items to avoid foreign key constraint violations
    console.log('🛒 Step 1: Deleting all cart items...');
    const { error: cartDeleteError } = await supabase
      .from('Cart')
      .delete()
      .neq('id', 0); // This will delete all rows
    
    if (cartDeleteError) {
      console.log('⚠️  Warning: Error deleting cart items:', cartDeleteError.message);
    } else {
      console.log('✅ Cart items deleted successfully\n');
    }
    
    // Get all products to know how many we're deleting
    console.log('📦 Step 2: Fetching all products...');
    const { data: products, error: fetchError } = await supabase
      .from('Product')
      .select('id, product_name');
    
    if (fetchError) {
      throw fetchError;
    }
    
    if (!products || products.length === 0) {
      console.log('✅ No products found in database. Database is already clean!');
      return;
    }
    
    console.log(`📊 Found ${products.length} products to delete\n`);
    
    // Delete all products
    console.log('🗑️  Step 3: Deleting all products...');
    const { error: deleteError } = await supabase
      .from('Product')
      .delete()
      .neq('id', 0); // This will delete all rows (id is never 0)
    
    if (deleteError) {
      throw deleteError;
    }
    
    console.log('✅ Successfully deleted all products!\n');
    console.log('='.repeat(60));
    console.log(`🎯 Deleted: ${products.length} products`);
    console.log('='.repeat(60));
    console.log('\n✨ Database is clean and ready for new products with embeddings!');
    
  } catch (error) {
    console.error('❌ Error deleting products:', error.message);
    process.exit(1);
  }
}

// Run the script
deleteAllProducts().catch(console.error);
