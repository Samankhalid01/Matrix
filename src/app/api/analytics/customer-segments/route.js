import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// GET: Get customer segmentation analysis
export async function GET(request) {
  try {
    // Get all customers with their purchase summary
    const { data: customers, error } = await supabase
      .rpc('get_customer_segments');

    // If RPC doesn't exist, fall back to view query
    let segmentData;
    if (error) {
      const { data: viewData, error: viewError } = await supabase
        .from('customer_purchase_summary')
        .select('*');

      if (viewError) throw viewError;
      segmentData = viewData;
    } else {
      segmentData = customers;
    }

    // Segment customers by tier
    const tierSegments = {
      BRONZE: { customers: [], count: 0, totalSpending: 0, avgSpending: 0 },
      SILVER: { customers: [], count: 0, totalSpending: 0, avgSpending: 0 },
      GOLD: { customers: [], count: 0, totalSpending: 0, avgSpending: 0 },
      PLATINUM: { customers: [], count: 0, totalSpending: 0, avgSpending: 0 }
    };

    // Segment by spending behavior
    const spendingSegments = {
      high: { threshold: 1000, customers: [], count: 0, totalSpending: 0 },
      medium: { threshold: 500, customers: [], count: 0, totalSpending: 0 },
      low: { threshold: 0, customers: [], count: 0, totalSpending: 0 }
    };

    // Segment by activity
    const activitySegments = {
      active: { customers: [], count: 0, description: 'Purchased in last 30 days' },
      inactive: { customers: [], count: 0, description: 'No purchase in 30+ days' },
      dormant: { customers: [], count: 0, description: 'No purchase in 90+ days' }
    };

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    segmentData?.forEach(customer => {
      const tier = customer.customer_tier || 'BRONZE';
      const spending = parseFloat(customer.lifetime_spending) || 0;
      const lastPurchase = customer.last_purchase_date ? new Date(customer.last_purchase_date) : null;

      // Tier segmentation
      if (tierSegments[tier]) {
        tierSegments[tier].customers.push(customer);
        tierSegments[tier].count++;
        tierSegments[tier].totalSpending += spending;
      }

      // Spending segmentation
      if (spending >= 1000) {
        spendingSegments.high.customers.push(customer);
        spendingSegments.high.count++;
        spendingSegments.high.totalSpending += spending;
      } else if (spending >= 500) {
        spendingSegments.medium.customers.push(customer);
        spendingSegments.medium.count++;
        spendingSegments.medium.totalSpending += spending;
      } else {
        spendingSegments.low.customers.push(customer);
        spendingSegments.low.count++;
        spendingSegments.low.totalSpending += spending;
      }

      // Activity segmentation
      if (lastPurchase) {
        if (lastPurchase >= thirtyDaysAgo) {
          activitySegments.active.customers.push(customer);
          activitySegments.active.count++;
        } else if (lastPurchase >= ninetyDaysAgo) {
          activitySegments.inactive.customers.push(customer);
          activitySegments.inactive.count++;
        } else {
          activitySegments.dormant.customers.push(customer);
          activitySegments.dormant.count++;
        }
      } else {
        activitySegments.dormant.customers.push(customer);
        activitySegments.dormant.count++;
      }
    });

    // Calculate averages
    Object.keys(tierSegments).forEach(tier => {
      if (tierSegments[tier].count > 0) {
        tierSegments[tier].avgSpending = tierSegments[tier].totalSpending / tierSegments[tier].count;
      }
    });

    return NextResponse.json({
      success: true,
      segments: {
        byTier: tierSegments,
        bySpending: spendingSegments,
        byActivity: activitySegments
      },
      totalCustomers: segmentData?.length || 0,
      summary: {
        highValueCustomers: spendingSegments.high.count,
        activeCustomers: activitySegments.active.count,
        riskCustomers: activitySegments.dormant.count
      }
    });
  } catch (error) {
    console.error('Error fetching customer segments:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
