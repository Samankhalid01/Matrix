import { createClient } from '@supabase/supabase-js';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const period = searchParams.get('period') || 'monthly';

    console.log('📊 Export API called - Format:', format, 'Period:', period);

    // Fetch analytics data
    const { data: products, error: productsError } = await supabase
      .from('Product')
      .select('*');

    if (productsError) {
      console.error('❌ Products fetch error:', productsError);
      throw productsError;
    }

    console.log('✅ Products fetched:', products?.length || 0);

    // Fetch transactions separately (no foreign key relationship)
    const { data: transactions, error: transactionsError } = await supabase
      .from('Transaction')
      .select('product_id, quantity, total_amount');

    if (transactionsError) {
      console.error('❌ Transactions fetch error:', transactionsError);
      throw transactionsError;
    }

    console.log('✅ Transactions fetched:', transactions?.length || 0);

    // Calculate product performance
    const productPerformance = products.map(product => {
      const productTransactions = (transactions || []).filter(t => t.product_id === product.product_id);
      const totalUnits = productTransactions.reduce((sum, t) => sum + (t.quantity || 0), 0);
      const totalRevenue = productTransactions.reduce((sum, t) => sum + (t.total_amount || 0), 0);

      return {
        product_name: product.product_name,
        category: product.category || 'N/A',
        price: product.price,
        total_units_sold: totalUnits,
        total_revenue: totalRevenue,
        current_stock: product.quantity || 0,
      };
    });

    // Sort by revenue descending
    productPerformance.sort((a, b) => b.total_revenue - a.total_revenue);

    console.log('✅ Data fetched:', productPerformance.length, 'products');

    // Generate report based on format
    if (format === 'csv') {
      return generateCSV(productPerformance, period);
    } else if (format === 'pdf') {
      return generatePDF(productPerformance, period);
    }

    return Response.json({ success: false, error: 'Invalid format. Use csv or pdf.' }, { status: 400 });
  } catch (error) {
    console.error('❌ Export error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

function generateCSV(data, period) {
  console.log('📊 Generating CSV with', data.length, 'products');
  const headers = ['Product', 'Category', 'Price', 'Units Sold', 'Revenue', 'Stock'];
  const rows = data.map(p => [
    p.product_name,
    p.category,
    `$${p.price.toFixed(2)}`,
    p.total_units_sold,
    `$${p.total_revenue.toFixed(2)}`,
    p.current_stock
  ]);

  const csv = [
    `Analytics Report - ${period.toUpperCase()}`,
    `Generated: ${new Date().toLocaleDateString()}`,
    '',
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  console.log('✅ CSV generated successfully');
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="analytics-${period}-${Date.now()}.csv"`
    }
  });
}

function generatePDF(data, period) {
  console.log('📄 Generating PDF with', data.length, 'products');
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.text(`Analytics Report - ${period.toUpperCase()}`, 14, 20);
  
  doc.setFontSize(11);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);

  // Summary statistics
  const totalRevenue = data.reduce((sum, p) => sum + p.total_revenue, 0);
  const totalUnits = data.reduce((sum, p) => sum + p.total_units_sold, 0);
  
  doc.setFontSize(12);
  doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`, 14, 38);
  doc.text(`Total Units Sold: ${totalUnits}`, 14, 45);
  doc.text(`Total Products: ${data.length}`, 14, 52);

  // Table
  doc.autoTable({
    startY: 60,
    head: [['Product', 'Category', 'Price', 'Units Sold', 'Revenue', 'Stock']],
    body: data.map(p => [
      p.product_name,
      p.category,
      `$${p.price.toFixed(2)}`,
      p.total_units_sold,
      `$${p.total_revenue.toFixed(2)}`,
      p.current_stock
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [31, 41, 55] }, // Gray-800
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 30 },
      2: { cellWidth: 20 },
      3: { cellWidth: 25 },
      4: { cellWidth: 30 },
      5: { cellWidth: 20 }
    }
  });

  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

  console.log('✅ PDF generated successfully');
  return new Response(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="analytics-${period}-${Date.now()}.pdf"`
    }
  });
}
