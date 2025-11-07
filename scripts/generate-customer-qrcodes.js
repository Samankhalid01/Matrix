require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

console.log('\n🔲 Generating QR Codes for All Customers...\n');

async function generateCustomerQRCodes() {
  try {
    // Get all customers
    const { data: customers, error: customerError } = await supabase
      .from('Customer')
      .select('id, name, email, customer_tier');

    if (customerError) throw customerError;

    console.log(`👥 Found ${customers.length} customers\n`);

    // Create QR codes directory
    const qrDir = path.join(process.cwd(), 'public', 'qrcodes', 'customers');
    if (!fs.existsSync(qrDir)) {
      fs.mkdirSync(qrDir, { recursive: true });
    }

    const qrCodesData = [];

    // Generate QR code for each customer
    for (const customer of customers) {
      // QR code contains ONLY the email address
      const qrData = customer.email;

      // Generate QR code as data URL (base64)
      const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Also save as PNG file
      const filename = `${customer.email.replace(/[^a-z0-9]/gi, '_')}.png`;
      const filepath = path.join(qrDir, filename);
      
      await QRCode.toFile(filepath, qrData, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      qrCodesData.push({
        customerId: customer.id,
        name: customer.name,
        email: customer.email,
        tier: customer.customer_tier,
        qrCodePath: `/qrcodes/customers/${filename}`,
        qrCodeDataURL: qrCodeDataURL
      });

      console.log(`✅ ${customer.name} (${customer.tier})`);
      console.log(`   📧 Email: ${customer.email}`);
      console.log(`   🔲 QR Code: ${filename}`);
      console.log(`   📄 Data: ${qrData.substring(0, 50)}...`);
      console.log('');
    }

    // Save QR codes data as JSON
    const jsonPath = path.join(qrDir, 'customer-qrcodes.json');
    fs.writeFileSync(jsonPath, JSON.stringify(qrCodesData, null, 2));

    console.log('\n' + '═'.repeat(60));
    console.log('✅ QR CODE GENERATION COMPLETE!');
    console.log('═'.repeat(60));
    console.log(`\n📁 QR Codes saved to: ${qrDir}`);
    console.log(`📄 JSON data saved to: ${jsonPath}`);
    console.log(`\n🔲 Total QR codes generated: ${qrCodesData.length}`);
    
    console.log('\n📱 QR Code Format:');
    console.log('   Each QR code contains:');
    console.log('   • Email address ONLY (plain text)');
    console.log('   • Example: "customer@example.com"');
    
    console.log('\n🎯 Use Cases:');
    console.log('   • Customer check-in at store entrance');
    console.log('   • Loyalty program verification');
    console.log('   • Quick customer identification');
    console.log('   • Personalized discounts at checkout');
    console.log('   • Customer analytics tracking\n');

    // Display tier distribution
    const tierCounts = qrCodesData.reduce((acc, customer) => {
      acc[customer.tier] = (acc[customer.tier] || 0) + 1;
      return acc;
    }, {});

    console.log('📊 QR Codes by Tier:');
    Object.entries(tierCounts).forEach(([tier, count]) => {
      console.log(`   ${tier}: ${count} QR codes`);
    });
    console.log('');

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

generateCustomerQRCodes();
