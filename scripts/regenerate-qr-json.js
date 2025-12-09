// Regenerate QR codes with JSON format (product_id, product_name, price)
import { createClient } from '@supabase/supabase-js';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = 'https://qdwsqbzlhyxhebdlqath.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkd3NxYnpsaHl4aGViZGxxYXRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDQwMDMxNSwiZXhwIjoyMDc1OTc2MzE1fQ.gJwFLaQuM4XNYcrBIIPDITKy3rkEDcidgpj6a-Xd8xc';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function regenerateQRCodes() {
  console.log('🔄 Regenerating QR Codes with JSON Format\n');
  console.log('='.repeat(70));

  try {
    // Create QR codes directory
    const qrDir = path.join(__dirname, '..', 'public', 'qr-codes');
    if (!fs.existsSync(qrDir)) {
      fs.mkdirSync(qrDir, { recursive: true });
    }

    // Delete all existing QR codes
    const files = fs.readdirSync(qrDir);
    files.forEach(file => {
      fs.unlinkSync(path.join(qrDir, file));
    });
    console.log('🗑️  Deleted old QR codes\n');

    // Get all products
    const { data: products, error } = await supabase
      .from('Product')
      .select('id, product_name, price')
      .order('id', { ascending: true });

    if (error) {
      console.error('❌ Error fetching products:', error);
      return;
    }

    console.log(`📦 Found ${products.length} products\n`);
    console.log('🎨 Generating QR codes with JSON format:\n');

    let successCount = 0;

    for (const product of products) {
      try {
        // JSON FORMAT with 3 attributes
        const qrData = JSON.stringify({
          product_id: product.id,
          product_name: product.product_name,
          price: product.price
        });

        console.log(`   Creating: ${product.product_name} (ID: ${product.id})`);
        console.log(`   Data: ${qrData}`);

        // Generate QR code
        const qrCodeImage = await QRCode.toDataURL(qrData, {
          errorCorrectionLevel: 'H',
          type: 'image/png',
          width: 400,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

        // Save to file
        const fileName = `product-${product.id}.png`;
        const filePath = path.join(qrDir, fileName);
        
        const base64Data = qrCodeImage.replace(/^data:image\/png;base64,/, '');
        fs.writeFileSync(filePath, base64Data, 'base64');

        successCount++;

      } catch (error) {
        console.error(`   ❌ Failed for ${product.product_name}:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ QR Code Generation Complete!');
    console.log(`📊 Success: ${successCount} / ${products.length}`);
    console.log('='.repeat(70));
    console.log('\n📁 QR codes saved to: public/qr-codes/');
    console.log('\n🔍 Sample QR code content:');
    console.log('   {');
    console.log('     "product_id": 35,');
    console.log('     "product_name": "Milkpak Cream",');
    console.log('     "price": 180');
    console.log('   }');
    console.log('\n💡 QR codes now contain JSON with 3 attributes!');
    console.log('   Test at: http://localhost:3001/test-qr-display');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

regenerateQRCodes();
