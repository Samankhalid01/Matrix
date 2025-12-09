import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Helper function to convert data to CSV
function convertToCSV(data, headers) {
  if (!data || data.length === 0) return '';
  
  const csvHeaders = headers.join(',');
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Escape commas and quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? '';
    }).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
}

// Generate PDF content as HTML that can be printed/saved as PDF
function generatePDFHTML(reportType, data, dateRange) {
  const styles = `
    <style>
      body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
      .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #6366f1; padding-bottom: 20px; }
      .header h1 { color: #6366f1; margin: 0; }
      .header p { color: #666; margin: 5px 0; }
      .summary { background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
      .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; }
      .summary-item { text-align: center; }
      .summary-item .value { font-size: 24px; font-weight: bold; color: #6366f1; }
      .summary-item .label { font-size: 12px; color: #666; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th { background: #6366f1; color: white; padding: 12px; text-align: left; }
      td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
      tr:nth-child(even) { background: #f8fafc; }
      .section-title { font-size: 18px; font-weight: bold; color: #333; margin: 30px 0 15px; border-left: 4px solid #6366f1; padding-left: 10px; }
      .trend-up { color: #22c55e; }
      .trend-down { color: #ef4444; }
      .trend-stable { color: #eab308; }
      .confidence { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
      .confidence-high { background: #dcfce7; color: #166534; }
      .confidence-medium { background: #fef9c3; color: #854d0e; }
      .confidence-low { background: #fee2e2; color: #991b1b; }
      .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
    </style>
  `;

  let content = '';
  
  if (reportType === 'forecast') {
    const forecasts = data.forecasts || [];
    const summary = data.summary || {};
    
    content = `
      <div class="header">
        <h1>📊 Demand Forecast Report</h1>
        <p>ML-Powered Predictions | Generated: ${new Date().toLocaleDateString()}</p>
        <p>Forecast Period: Next 3 Months</p>
      </div>
      
      <div class="summary">
        <div class="summary-grid">
          <div class="summary-item">
            <div class="value">${summary.totalProducts || forecasts.length / 3}</div>
            <div class="label">Products Analyzed</div>
          </div>
          <div class="summary-item">
            <div class="value">${(summary.totalPredictedDemand || 0).toLocaleString()}</div>
            <div class="label">Total Predicted Demand</div>
          </div>
          <div class="summary-item">
            <div class="value">${summary.forecastPeriod || '3 months'}</div>
            <div class="label">Forecast Period</div>
          </div>
        </div>
      </div>
      
      <div class="section-title">Detailed Forecasts by Product</div>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Month</th>
            <th>Predicted Demand</th>
            <th>Confidence</th>
            <th>Trend</th>
          </tr>
        </thead>
        <tbody>
          ${forecasts.slice(0, 50).map(f => `
            <tr>
              <td>${f.Product?.product_name || 'Unknown'}</td>
              <td>${f.Product?.category || 'N/A'}</td>
              <td>${f.month || f.forecast_date}</td>
              <td><strong>${f.predicted_demand}</strong> units</td>
              <td>
                <span class="confidence ${f.confidence_level >= 0.8 ? 'confidence-high' : f.confidence_level >= 0.7 ? 'confidence-medium' : 'confidence-low'}">
                  ${(f.confidence_level * 100).toFixed(0)}%
                </span>
              </td>
              <td class="${f.trend_direction === 'increasing' ? 'trend-up' : f.trend_direction === 'decreasing' ? 'trend-down' : 'trend-stable'}">
                ${f.trend_direction === 'increasing' ? '↑ Growing' : f.trend_direction === 'decreasing' ? '↓ Declining' : '→ Stable'}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } else if (reportType === 'performance') {
    const topSelling = data.topSelling || [];
    const underperforming = data.underperforming || [];
    const summary = data.summary || {};
    
    content = `
      <div class="header">
        <h1>📈 Store Performance Report</h1>
        <p>Period: ${dateRange.startDate} to ${dateRange.endDate}</p>
        <p>Generated: ${new Date().toLocaleDateString()}</p>
      </div>
      
      <div class="summary">
        <div class="summary-grid">
          <div class="summary-item">
            <div class="value">$${(summary.totalRevenue || 0).toLocaleString()}</div>
            <div class="label">Total Revenue</div>
          </div>
          <div class="summary-item">
            <div class="value">${(summary.totalUnitsSold || 0).toLocaleString()}</div>
            <div class="label">Units Sold</div>
          </div>
          <div class="summary-item">
            <div class="value">${summary.totalProducts || 0}</div>
            <div class="label">Products</div>
          </div>
          <div class="summary-item">
            <div class="value">${summary.lowStockCount || 0}</div>
            <div class="label">Low Stock Items</div>
          </div>
        </div>
      </div>
      
      <div class="section-title">🏆 Top Selling Products</div>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Product</th>
            <th>Category</th>
            <th>Units Sold</th>
            <th>Revenue</th>
            <th>Stock</th>
          </tr>
        </thead>
        <tbody>
          ${topSelling.map((p, i) => `
            <tr>
              <td>#${i + 1}</td>
              <td>${p.name}</td>
              <td>${p.category}</td>
              <td>${p.totalSold}</td>
              <td class="trend-up">$${p.totalRevenue?.toFixed(2) || '0.00'}</td>
              <td>${p.currentStock}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="section-title">⚠️ Underperforming Products</div>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Units Sold</th>
            <th>Revenue</th>
            <th>Stock</th>
          </tr>
        </thead>
        <tbody>
          ${underperforming.map(p => `
            <tr>
              <td>${p.name}</td>
              <td>${p.category}</td>
              <td>${p.totalSold}</td>
              <td class="trend-down">$${p.totalRevenue?.toFixed(2) || '0.00'}</td>
              <td>${p.currentStock}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } else if (reportType === 'sales') {
    const transactions = data.transactions || [];
    const totalAmount = transactions.reduce((sum, t) => sum + (t.total_amount || 0), 0);
    
    content = `
      <div class="header">
        <h1>💰 Sales Report</h1>
        <p>Period: ${dateRange.startDate} to ${dateRange.endDate}</p>
        <p>Generated: ${new Date().toLocaleDateString()}</p>
      </div>
      
      <div class="summary">
        <div class="summary-grid">
          <div class="summary-item">
            <div class="value">${transactions.length}</div>
            <div class="label">Total Transactions</div>
          </div>
          <div class="summary-item">
            <div class="value">$${totalAmount.toLocaleString()}</div>
            <div class="label">Total Sales</div>
          </div>
          <div class="summary-item">
            <div class="value">$${transactions.length > 0 ? (totalAmount / transactions.length).toFixed(2) : '0.00'}</div>
            <div class="label">Avg. Transaction</div>
          </div>
        </div>
      </div>
      
      <div class="section-title">Transaction History</div>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Customer</th>
            <th>Amount</th>
            <th>Payment Method</th>
          </tr>
        </thead>
        <tbody>
          ${transactions.slice(0, 100).map(t => `
            <tr>
              <td>${new Date(t.transaction_date || t.created_at).toLocaleDateString()}</td>
              <td>${t.Customer?.name || t.customer_name || 'Guest'}</td>
              <td>$${(t.total_amount || 0).toFixed(2)}</td>
              <td>${t.payment_method || 'N/A'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report - MATRIX</title>
      ${styles}
    </head>
    <body>
      ${content}
      <div class="footer">
        <p>MATRIX Retail Management System | © ${new Date().getFullYear()}</p>
        <p>This report was automatically generated. For questions, contact admin.</p>
      </div>
    </body>
    </html>
  `;
}

// GET method - for direct browser access
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'performance';
    const format = searchParams.get('format') || 'json';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const category = searchParams.get('category');

    // Use the same logic as POST
    return await generateReport({ reportType, format, startDate, endDate, category });
  } catch (error) {
    console.error('Export report GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    return await generateReport(body);
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Shared function for both GET and POST
async function generateReport(params) {
  try {
    const { 
      reportType = 'performance',
      format = 'json',
      startDate,
      endDate,
      category
    } = params;

    let reportData = {};
    let filename = '';
    let csvData = '';
    const dateRange = { startDate: startDate || '2025-01-01', endDate: endDate || new Date().toISOString().split('T')[0] };

    // Generate report based on type
    if (reportType === 'performance') {
      // Fetch performance data directly from database
      const { data: products } = await supabase
        .from('Product')
        .select('id, product_name, category, price, quantity');

      const { data: transactionItems } = await supabase
        .from('TransactionItem')
        .select('product_name, quantity, total_price, created_at')
        .gte('created_at', dateRange.startDate)
        .lte('created_at', dateRange.endDate);

      // Aggregate sales by product
      const salesByProduct = {};
      (transactionItems || []).forEach(item => {
        const name = item.product_name;
        if (!salesByProduct[name]) {
          salesByProduct[name] = { totalSold: 0, totalRevenue: 0 };
        }
        salesByProduct[name].totalSold += item.quantity || 1;
        salesByProduct[name].totalRevenue += item.total_price || 0;
      });

      // Build product list with sales
      const productList = (products || []).map(p => ({
        id: p.id,
        name: p.product_name,
        category: p.category,
        totalSold: salesByProduct[p.product_name]?.totalSold || 0,
        totalRevenue: salesByProduct[p.product_name]?.totalRevenue || 0,
        currentStock: p.quantity || 0,
        stockStatus: p.quantity < 10 ? 'low' : 'ok'
      }));

      const sorted = [...productList].sort((a, b) => b.totalSold - a.totalSold);
      
      reportData = {
        topSelling: sorted.slice(0, 10),
        underperforming: sorted.filter(p => p.totalSold < 5).slice(0, 10),
        summary: {
          totalRevenue: productList.reduce((sum, p) => sum + p.totalRevenue, 0),
          totalUnitsSold: productList.reduce((sum, p) => sum + p.totalSold, 0),
          totalProducts: productList.length,
          lowStockCount: productList.filter(p => p.stockStatus === 'low').length
        }
      };
      
      filename = `performance-report-${Date.now()}`;

      if (format === 'csv') {
        const headers = ['name', 'category', 'totalSold', 'totalRevenue', 'currentStock', 'stockStatus'];
        csvData = convertToCSV(reportData.topSelling, headers);
      }

    } else if (reportType === 'forecast') {
      // Call our ML forecast endpoint
      const forecastResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/analytics/demand-forecast?generate_all=true`);
      reportData = await forecastResponse.json();
      
      filename = `demand-forecast-${Date.now()}`;

      if (format === 'csv') {
        const formattedData = (reportData.forecasts || []).map(f => ({
          product: f.Product?.product_name || 'Unknown',
          category: f.Product?.category || 'N/A',
          month: f.month || f.forecast_date,
          predictedDemand: f.predicted_demand,
          confidence: (f.confidence_level * 100).toFixed(0) + '%',
          trend: f.trend_direction || 'stable'
        }));
        const headers = ['product', 'category', 'month', 'predictedDemand', 'confidence', 'trend'];
        csvData = convertToCSV(formattedData, headers);
      }

    } else if (reportType === 'sales') {
      // Fetch sales data
      const { data: transactions } = await supabase
        .from('Transaction')
        .select('transaction_id, transaction_date, created_at, total_amount, payment_method, customer_id')
        .gte('created_at', dateRange.startDate)
        .lte('created_at', dateRange.endDate)
        .order('created_at', { ascending: false });

      // Get customer names
      const customerIds = [...new Set((transactions || []).map(t => t.customer_id).filter(Boolean))];
      const { data: customers } = await supabase
        .from('Customer')
        .select('customer_id, name, email')
        .in('customer_id', customerIds);

      const customerMap = {};
      (customers || []).forEach(c => { customerMap[c.customer_id] = c; });

      reportData = { 
        transactions: (transactions || []).map(t => ({
          ...t,
          Customer: customerMap[t.customer_id] || null
        }))
      };
      filename = `sales-report-${Date.now()}`;

      if (format === 'csv') {
        const formattedData = (reportData.transactions || []).map(t => ({
          date: t.transaction_date || t.created_at,
          customer: t.Customer?.name || 'Guest',
          amount: t.total_amount,
          paymentMethod: t.payment_method || 'N/A'
        }));
        const headers = ['date', 'customer', 'amount', 'paymentMethod'];
        csvData = convertToCSV(formattedData, headers);
      }
    }

    // Return appropriate format
    if (format === 'pdf') {
      const htmlContent = generatePDFHTML(reportType, reportData, dateRange);
      return new NextResponse(htmlContent, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="${filename}.html"`
        }
      });
    } else if (format === 'csv') {
      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}.csv"`
        }
      });
    } else {
      // JSON format
      return new NextResponse(JSON.stringify(reportData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}.json"`
        }
      });
    }

  } catch (error) {
    console.error('Generate report error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
