import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Cache for stock alerts (30 seconds)
let cachedAlerts = null;
let alertsCacheTimestamp = 0;
const ALERTS_CACHE_DURATION = 30000; // 30 seconds

// Optimized: Batch check and create alerts
async function generateStockAlerts() {
  try {
    // Fetch products and existing alerts in parallel
    const [productsResult, existingAlertsResult] = await Promise.all([
      supabase
        .from('Product')
        .select('id, product_name, price, quantity, category, min_stock_threshold, image_url')
        .order('quantity', { ascending: true }),
      supabase
        .from('StockAlert')
        .select('product_id, alert_type, status')
        .eq('status', 'pending')
    ]);

    if (productsResult.error) {
      console.error('Error fetching products for alerts:', productsResult.error);
      return [];
    }

    // Create a map of existing alerts for O(1) lookup
    const existingAlertsMap = new Map();
    existingAlertsResult.data?.forEach(alert => {
      const key = `${alert.product_id}-${alert.alert_type}`;
      existingAlertsMap.set(key, true);
    });

    // Batch collect alerts to create
    const alertsToCreate = [];
    
    for (const product of productsResult.data || []) {
      const currentStock = product.quantity || 0;
      const threshold = product.min_stock_threshold || 10;

      // Check if product needs an alert
      if (currentStock === 0) {
        const key = `${product.id}-out_of_stock`;
        if (!existingAlertsMap.has(key)) {
          alertsToCreate.push({
            product_id: product.id,
            alert_type: 'out_of_stock',
            current_stock: 0,
            threshold_level: threshold,
            status: 'pending',
            created_at: new Date().toISOString()
          });
        }
      } else if (currentStock <= threshold) {
        const key = `${product.id}-low_stock`;
        if (!existingAlertsMap.has(key)) {
          alertsToCreate.push({
            product_id: product.id,
            alert_type: 'low_stock',
            current_stock: currentStock,
            threshold_level: threshold,
            status: 'pending',
            created_at: new Date().toISOString()
          });
        }
      }
    }

    // Batch insert all new alerts at once
    if (alertsToCreate.length > 0) {
      const { data: newAlerts, error: createError } = await supabase
        .from('StockAlert')
        .insert(alertsToCreate)
        .select();

      if (!createError) {
        return newAlerts || [];
      }
    }

    return [];
  } catch (error) {
    console.error('Error generating stock alerts:', error);
    return [];
  }
}

// GET: Fetch stock alerts with real product data (optimized with caching)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // pending, acknowledged, resolved
    const alertType = searchParams.get('alert_type'); // out_of_stock, low_stock
    const autoGenerate = searchParams.get('auto_generate') !== 'false'; // Default to true

    // Check cache first (aggressive caching for speed)
    const now = Date.now();
    if (cachedAlerts && (now - alertsCacheTimestamp) < ALERTS_CACHE_DURATION && !status && !alertType) {
      return NextResponse.json(cachedAlerts, {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        }
      });
    }

    // Skip auto-generation entirely when false (much faster)
    if (autoGenerate && (!cachedAlerts || (now - alertsCacheTimestamp) >= ALERTS_CACHE_DURATION)) {
      await generateStockAlerts();
    }

    // Fast query: Get alerts WITHOUT expensive Product join
    let query = supabase
      .from('StockAlert')
      .select('id, product_id, alert_type, current_stock, threshold_level, status, created_at')
      .order('created_at', { ascending: false })
      .limit(50); // Limit results for speed

    if (status) {
      query = query.eq('status', status);
    }
    if (alertType) {
      query = query.eq('alert_type', alertType);
    }

    const { data: stockAlerts, error: alertsError } = await query;

    // Fast path: If we have alerts and not generating, return immediately
    let alerts = stockAlerts || [];
    
    // Fast path: Return minimal data immediately (skip expensive fallback)
    if (!stockAlerts || stockAlerts.length === 0) {
      // Return empty result immediately instead of expensive product query
      const emptyResponse = {
        success: true,
        alerts: [],
        statusCounts: {
          pending: 0,
          acknowledged: 0,
          resolved: 0,
          total: 0,
          critical: 0,
          low_stock: 0
        },
        total: 0
      };
      
      cachedAlerts = emptyResponse;
      alertsCacheTimestamp = now;
      
      return NextResponse.json(emptyResponse, {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        }
      });
    } else {
      // Map alerts with minimal processing (skip Product enrichment for speed)
      alerts = stockAlerts.map(alert => ({
        id: alert.id,
        product_id: alert.product_id,
        alert_type: alert.alert_type,
        current_stock: alert.current_stock,
        threshold_level: alert.threshold_level,
        status: alert.status,
        created_at: alert.created_at
      }));
    }

    // Get counts by status
    const statusCounts = {
      pending: alerts.filter(a => a.status === 'pending').length,
      acknowledged: alerts.filter(a => a.status === 'acknowledged').length,
      resolved: alerts.filter(a => a.status === 'resolved').length,
      total: alerts.length,
      critical: alerts.filter(a => a.alert_type === 'out_of_stock').length,
      low_stock: alerts.filter(a => a.alert_type === 'low_stock').length
    };

    const responseData = {
      success: true,
      alerts,
      statusCounts,
      total: alerts.length
    };

    // Cache the response (only if no filters)
    if (!status && !alertType) {
      cachedAlerts = responseData;
      alertsCacheTimestamp = now;
    }

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      }
    });
  } catch (error) {
    console.error('Error fetching stock alerts:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT: Update stock alert status
export async function PUT(request) {
  try {
    const body = await request.json();
    const { alertId, status, acknowledgedBy } = body;

    if (!alertId || !status) {
      return NextResponse.json(
        { success: false, error: 'Alert ID and status required' },
        { status: 400 }
      );
    }

    const updateData = { status };

    if (status === 'acknowledged' || status === 'resolved') {
      // Only set acknowledged_by if a valid UUID is provided
      if (acknowledgedBy && acknowledgedBy.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        updateData.acknowledged_by = acknowledgedBy;
      }
      updateData.acknowledged_at = new Date().toISOString();
    }
    
    if (status === 'resolved') {
      updateData.resolved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('StockAlert')
      .update(updateData)
      .eq('id', alertId)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      alert: data,
      message: `Alert ${status} successfully`
    });
  } catch (error) {
    console.error('Error updating stock alert:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
