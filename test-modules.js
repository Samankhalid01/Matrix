// Test script to verify all 3 modules are working
// Run: node test-modules.js

const BASE_URL = 'http://localhost:3000';

async function testAPI(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await res.json();
    return { success: res.ok, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🧪 Testing MATRIX Modules...\n');

  // Test 1: Notifications API
  console.log('📦 Test 1: Notifications API');
  const notifTest = await testAPI('/api/notifications?recipient_type=admin');
  if (notifTest.success) {
    console.log('✅ Notifications API working');
    console.log(`   - Found ${notifTest.data.notifications?.length || 0} notifications`);
    console.log(`   - Unread: ${notifTest.data.unreadCount || 0}\n`);
  } else {
    console.log('❌ Notifications API failed:', notifTest.error, '\n');
  }

  // Test 2: Stock Alerts API
  console.log('📦 Test 2: Stock Alerts API');
  const alertTest = await testAPI('/api/notifications/stock-alerts?status=pending');
  if (alertTest.success) {
    console.log('✅ Stock Alerts API working');
    console.log(`   - Found ${alertTest.data.alerts?.length || 0} pending alerts\n`);
  } else {
    console.log('❌ Stock Alerts API failed:', alertTest.error, '\n');
  }

  // Test 3: Promotions API
  console.log('📦 Test 3: Promotions API');
  const promoTest = await testAPI('/api/promotions');
  if (promoTest.success) {
    console.log('✅ Promotions API working');
    console.log(`   - Found ${promoTest.data.promotions?.length || 0} promotions`);
    console.log(`   - Active: ${promoTest.data.activeCount || 0}\n`);
  } else {
    console.log('❌ Promotions API failed:', promoTest.error, '\n');
  }

  // Test 4: Customer Segments API
  console.log('📦 Test 4: Customer Segments API');
  const segmentTest = await testAPI('/api/analytics/customer-segments');
  if (segmentTest.success) {
    console.log('✅ Customer Segments API working');
    console.log(`   - Total customers: ${segmentTest.data.totalCustomers || 0}`);
    if (segmentTest.data.segments?.byTier) {
      const tiers = segmentTest.data.segments.byTier;
      console.log(`   - BRONZE: ${tiers.BRONZE?.count || 0}`);
      console.log(`   - SILVER: ${tiers.SILVER?.count || 0}`);
      console.log(`   - GOLD: ${tiers.GOLD?.count || 0}`);
      console.log(`   - PLATINUM: ${tiers.PLATINUM?.count || 0}\n`);
    }
  } else {
    console.log('❌ Customer Segments API failed:', segmentTest.error, '\n');
  }

  // Test 5: Analytics Performance API
  console.log('📦 Test 5: Analytics Performance API');
  const analyticsTest = await testAPI('/api/analytics/performance?period=monthly');
  if (analyticsTest.success) {
    console.log('✅ Analytics Performance API working');
    if (analyticsTest.data.metrics) {
      console.log(`   - Total Revenue: $${analyticsTest.data.metrics.totalRevenue || 0}`);
      console.log(`   - Transactions: ${analyticsTest.data.metrics.totalTransactions || 0}`);
      console.log(`   - Avg Transaction: $${analyticsTest.data.metrics.avgTransactionValue || 0}`);
      console.log(`   - Unique Customers: ${analyticsTest.data.metrics.uniqueCustomers || 0}\n`);
    }
  } else {
    console.log('❌ Analytics Performance API failed:', analyticsTest.error, '\n');
  }

  // Test 6: Forecast API
  console.log('📦 Test 6: Demand Forecast API');
  const forecastTest = await testAPI('/api/analytics/forecast?days=7');
  if (forecastTest.success) {
    console.log('✅ Demand Forecast API working');
    console.log(`   - Forecasts generated: ${forecastTest.data.forecasts?.length || 0}`);
    if (forecastTest.data.forecasts?.[0]) {
      const forecast = forecastTest.data.forecasts[0];
      console.log(`   - Product: ${forecast.product_name}`);
      console.log(`   - 7-Day Predicted Demand: ${forecast.total_predicted_demand} units\n`);
    }
  } else {
    console.log('❌ Demand Forecast API failed:', forecastTest.error, '\n');
  }

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Test Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const allTests = [notifTest, alertTest, promoTest, segmentTest, analyticsTest, forecastTest];
  const passedTests = allTests.filter(t => t.success).length;
  const totalTests = allTests.length;
  
  console.log(`\n✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}\n`);

  if (passedTests === totalTests) {
    console.log('🎉 All modules are working perfectly!\n');
    console.log('Next Steps:');
    console.log('1. Visit: http://localhost:3000/admin/notifications-center');
    console.log('2. Visit: http://localhost:3000/admin/promotions');
    console.log('3. Visit: http://localhost:3000/admin/analytics-dashboard\n');
  } else {
    console.log('⚠️  Some tests failed. Check:');
    console.log('1. Is your Next.js server running? (npm run dev)');
    console.log('2. Did you run DATABASE_SCHEMA_COMPLETE.sql in Supabase?');
    console.log('3. Did you run: node scripts/seed-database.js');
    console.log('4. Check .env.local for correct Supabase credentials\n');
  }
}

// Run tests
console.log('Make sure your Next.js server is running on http://localhost:3000\n');
runTests().catch(console.error);
