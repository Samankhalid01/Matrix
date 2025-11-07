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

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      reportType, // 'performance', 'forecast', 'sales'
      format, // 'csv', 'json'
      startDate,
      endDate,
      category
    } = body;

    let reportData = {};
    let filename = '';
    let csvData = '';

    // Generate report based on type
    if (reportType === 'performance') {
      // Fetch performance data
      const url = new URL(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/api/analytics/performance-report`);
      if (startDate) url.searchParams.set('startDate', startDate);
      if (endDate) url.searchParams.set('endDate', endDate);
      if (category) url.searchParams.set('category', category);

      const response = await fetch(url.toString());
      reportData = await response.json();
      
      filename = `performance-report-${Date.now()}`;

      if (format === 'csv') {
        const headers = ['name', 'category', 'totalSold', 'totalRevenue', 'currentStock', 'stockStatus'];
        csvData = convertToCSV(reportData.topSelling, headers);
      }

    } else if (reportType === 'forecast') {
      // Fetch forecast data
      const { data: forecasts } = await supabase
        .from('DemandForecast')
        .select(`
          *,
          Product:product_id (
            name,
            category
          )
        `)
        .order('forecast_month', { ascending: true });

      reportData = { forecasts };
      filename = `demand-forecast-${Date.now()}`;

      if (format === 'csv') {
        const formattedData = forecasts.map(f => ({
          product: f.Product?.name || 'Unknown',
          category: f.Product?.category || 'N/A',
          month: f.forecast_month,
          predictedDemand: f.predicted_demand,
          confidence: (f.confidence_score * 100).toFixed(0) + '%'
        }));
        const headers = ['product', 'category', 'month', 'predictedDemand', 'confidence'];
        csvData = convertToCSV(formattedData, headers);
      }

    } else if (reportType === 'sales') {
      // Fetch sales data
      const { data: transactions } = await supabase
        .from('Transaction')
        .select(`
          id,
          transaction_date,
          total_amount,
          payment_method,
          Customer(name, email)
        `)
        .gte('transaction_date', startDate || '2025-01-01')
        .lte('transaction_date', endDate || new Date().toISOString())
        .order('transaction_date', { ascending: false });

      reportData = { transactions };
      filename = `sales-report-${Date.now()}`;

      if (format === 'csv') {
        const formattedData = transactions.map(t => ({
          date: t.transaction_date,
          customer: t.Customer?.name || 'Guest',
          amount: t.total_amount,
          paymentMethod: t.payment_method
        }));
        const headers = ['date', 'customer', 'amount', 'paymentMethod'];
        csvData = convertToCSV(formattedData, headers);
      }
    }

    // Return appropriate format
    if (format === 'csv') {
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
    console.error('Export error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
