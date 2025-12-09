import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://qdwsqbzlhyxhebdlqath.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkd3NxYnpsaHl4aGViZGxxYXRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDQwMDMxNSwiZXhwIjoyMDc1OTc2MzE1fQ.gJwFLaQuM4XNYcrBIIPDITKy3rkEDcidgpj6a-Xd8xc';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetProductIds() {
  console.log('🔄 Resetting Product IDs from 1 to 150...\n');
  
  try {
    // Step 1: Fetch all products ordered by current ID
    const { data: products, error: fetchError } = await supabase
      .from('Product')
      .select('*')
      .order('id', { ascending: true });
    
    if (fetchError) throw fetchError;
    
    if (!products || products.length === 0) {
      console.log('❌ No products found!');
      return;
    }
    
    console.log(`📦 Found ${products.length} products\n`);
    
    // Step 2: Delete all existing products
    console.log('🗑️  Deleting all products temporarily...');
    const { error: deleteError } = await supabase
      .from('Product')
      .delete()
      .neq('id', 0);
    
    if (deleteError) throw deleteError;
    console.log('✅ Products deleted\n');
    
    // Step 3: Re-insert products with new IDs (1-150)
    console.log('📥 Re-inserting products with new IDs (1-150)...\n');
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const newId = i + 1;
      
      // Remove old id and create new one
      const { id, ...productData } = product;
      
      const { error: insertError } = await supabase
        .from('Product')
        .insert({
          id: newId,
          ...productData
        });
      
      if (insertError) {
        console.error(`❌ Error inserting product ${newId}:`, insertError.message);
        throw insertError;
      }
      
      if ((newId) % 10 === 0) {
        console.log(`✅ Progress: ${newId}/${products.length} products re-inserted`);
      }
    }
    
    console.log('\n✅ All products re-inserted with new IDs!\n');
    
    // Step 4: Reset the sequence to start from 151
    console.log('🔧 Resetting auto-increment sequence...');
    const { error: seqError } = await supabase.rpc('reset_product_sequence', { next_val: 151 });
    
    if (seqError) {
      console.log('⚠️  Could not reset sequence automatically. Run this SQL manually:');
      console.log('   SELECT setval(pg_get_serial_sequence(\'"Product"\', \'id\'), 151, false);');
    } else {
      console.log('✅ Sequence reset to start from 151\n');
    }
    
    console.log('='.repeat(60));
    console.log('🎉 SUCCESS! Product IDs are now 1-150');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetProductIds();
