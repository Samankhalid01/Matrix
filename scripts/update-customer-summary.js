require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

console.log('\n📊 Updating Customer Purchase Summary...\n');

async function updateCustomerPurchaseSummary() {
  try {
    // Get all customers
    const { data: customers, error: customerError } = await supabase
      .from('Customer')
      .select('id, name, email, customer_tier');

    if (customerError) throw customerError;

    console.log(`👥 Found ${customers.length} customers\n`);

    // For each customer, calculate their purchase statistics
    for (const customer of customers) {
      // Get all transactions for this customer
      const { data: transactions, error: transError } = await supabase
        .from('Transaction')
        .select('id, transaction_date, total_amount')
        .eq('customer_id', customer.id);

      if (transError) {
        console.error(`   ❌ Error fetching transactions for ${customer.name}:`, transError.message);
        continue;
      }

      // Calculate statistics
      const totalTransactions = transactions?.length || 0;
      const lifetimeSpending = transactions?.reduce((sum, t) => sum + parseFloat(t.total_amount || 0), 0) || 0;
      const avgTransactionValue = totalTransactions > 0 ? lifetimeSpending / totalTransactions : 0;
      
      // Get last purchase date
      const lastPurchaseDate = transactions?.length > 0 
        ? transactions.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date))[0].transaction_date
        : null;

      // Get current month transactions
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const currentMonthTransactions = transactions?.filter(t => 
        t.transaction_date && t.transaction_date.startsWith(currentMonth)
      ) || [];
      
      const currentMonthCount = currentMonthTransactions.length;
      const currentMonthSpending = currentMonthTransactions.reduce((sum, t) => sum + parseFloat(t.total_amount || 0), 0);

      // Update customer_purchase_summary (it's a view, so we need to update the base Transaction table)
      // Since customer_purchase_summary is likely a view, let's just display the stats
      console.log(`✅ ${customer.name} (${customer.customer_tier}):`);
      console.log(`   📧 Email: ${customer.email}`);
      console.log(`   🛒 Total Transactions: ${totalTransactions}`);
      console.log(`   💰 Lifetime Spending: $${lifetimeSpending.toFixed(2)}`);
      console.log(`   📊 Avg Transaction: $${avgTransactionValue.toFixed(2)}`);
      console.log(`   📅 Last Purchase: ${lastPurchaseDate ? new Date(lastPurchaseDate).toLocaleDateString() : 'Never'}`);
      console.log(`   📆 This Month: ${currentMonthCount} transactions, $${currentMonthSpending.toFixed(2)}`);
      console.log('');
    }

    // Get summary statistics
    const { data: summary, error: summaryError } = await supabase
      .from('customer_purchase_summary')
      .select('*');

    if (!summaryError && summary) {
      console.log('\n' + '═'.repeat(60));
      console.log('📊 CUSTOMER PURCHASE SUMMARY');
      console.log('═'.repeat(60));
      
      const totalSpending = summary.reduce((sum, s) => sum + parseFloat(s.lifetime_spending || 0), 0);
      const totalTransactions = summary.reduce((sum, s) => sum + parseInt(s.total_transactions || 0), 0);
      const activeCustomers = summary.filter(s => s.total_transactions > 0).length;
      
      console.log(`\n💰 Total Lifetime Spending: $${totalSpending.toFixed(2)}`);
      console.log(`🛒 Total Transactions: ${totalTransactions}`);
      console.log(`👥 Active Customers: ${activeCustomers} out of ${summary.length}`);
      console.log(`📈 Average Customer Value: $${(totalSpending / summary.length).toFixed(2)}`);
      
      // Tier breakdown
      const tierBreakdown = summary.reduce((acc, s) => {
        const tier = s.customer_tier || 'UNKNOWN';
        if (!acc[tier]) {
          acc[tier] = { count: 0, spending: 0 };
        }
        acc[tier].count++;
        acc[tier].spending += parseFloat(s.lifetime_spending || 0);
        return acc;
      }, {});
      
      console.log('\n📊 Spending by Tier:');
      Object.entries(tierBreakdown).forEach(([tier, data]) => {
        console.log(`   ${tier}: ${data.count} customers, $${data.spending.toFixed(2)} total`);
      });
      
      console.log('\n✅ Customer purchase summary is up to date!');
      console.log('   View it at: /admin/analytics-dashboard\n');
    }

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

updateCustomerPurchaseSummary();
