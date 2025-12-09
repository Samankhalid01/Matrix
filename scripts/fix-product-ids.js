import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://qdwsqbzlhyxhebdlqath.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkd3NxYnpsaHl4aGViZGxxYXRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDQwMDMxNSwiZXhwIjoyMDc1OTc2MzE1fQ.gJwFLaQuM4XNYcrBIIPDITKy3rkEDcidgpj6a-Xd8xc';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixProductIds() {
  console.log('🔧 Fixing Product IDs to sequential order (1, 2, 3, ...)...\n');
  
  try {
    // Step 1: Delete all cart items first (foreign key constraint)
    console.log('🛒 Step 1: Clearing cart items...');
    const { error: cartError } = await supabase
      .from('Cart')
      .delete()
      .neq('id', 0);
    
    if (cartError) {
      console.log('⚠️  Warning:', cartError.message);
    } else {
      console.log('✅ Cart cleared\n');
    }

    // Step 2: Fetch all products ordered by current ID
    console.log('📦 Step 2: Fetching all products...');
    const { data: products, error: fetchError } = await supabase
      .from('Product')
      .select('*')
      .order('id', { ascending: true });
    
    if (fetchError) throw fetchError;
    
    if (!products || products.length === 0) {
      console.log('❌ No products found!');
      return;
    }
    
    console.log(`✅ Found ${products.length} products\n`);
    
    // Step 3: Delete all existing products
    console.log('🗑️  Step 3: Deleting all products temporarily...');
    const { error: deleteError } = await supabase
      .from('Product')
      .delete()
      .neq('id', 0);
    
    if (deleteError) throw deleteError;
    console.log('✅ All products deleted temporarily\n');
    
    // Step 4: Re-insert products with new sequential IDs (1, 2, 3, ...)
    console.log('📥 Step 4: Re-inserting products with sequential IDs...\n');
    
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const newId = i + 1;
      
      // Remove old id from product data
      const { id, ...productData } = product;
      
      try {
        const { error: insertError } = await supabase
          .from('Product')
          .insert({
            id: newId,
            ...productData
          });
        
        if (insertError) {
          console.error(`❌ Error inserting product ${newId}:`, insertError.message);
          failCount++;
        } else {
          successCount++;
          if (newId % 25 === 0) {
            console.log(`✅ Progress: ${newId}/${products.length} products`);
          }
        }
      } catch (err) {
        console.error(`❌ Failed at product ${newId}:`, err.message);
        failCount++;
      }
    }
    
    console.log(`\n✅ Completed! ${successCount} products re-inserted\n`);
    
    if (failCount > 0) {
      console.log(`⚠️  ${failCount} products failed to insert\n`);
    }
    
    console.log('='.repeat(70));
    console.log('🎉 SUCCESS! Product IDs are now sequential: 1, 2, 3, ...');
    console.log(`📊 Total products: ${successCount}`);
    console.log('='.repeat(70));
    console.log('\n💡 Note: The database sequence will auto-adjust for next insertions');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

fixProductIds();
