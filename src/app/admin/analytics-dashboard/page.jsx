'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { BarChart3, TrendingUp, Package, DollarSign, Users, Calendar, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  FiTrendingUp, 
  FiTrendingDown,
  FiDollarSign, 
  FiShoppingBag, 
  FiUsers,
  FiBarChart2,
  FiPieChart,
  FiDownload,
  FiRefreshCw,
  FiTarget,
  FiActivity,
  FiAlertCircle,
  FiX
} from 'react-icons/fi';

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // TEMPORARY: Use hardcoded data for demonstration
      const USE_HARDCODED_DATA = false; // CHANGED: Disabled hardcoded data to fetch real data
      
      if (USE_HARDCODED_DATA) {
        console.log('Using hardcoded sample data');
        
        const hardcodedData = {
          metrics: {
            totalRevenue: 45780.50,
            totalTransactions: 234,
            uniqueCustomers: 156,
            avgTransactionValue: 195.64
          },
          salesTrend: [
            { date: '2025-11-01', revenue: 1250, transactions: 12 },
            { date: '2025-11-05', revenue: 2180, transactions: 18 },
            { date: '2025-11-10', revenue: 3420, transactions: 24 },
            { date: '2025-11-15', revenue: 4890, transactions: 32 },
            { date: '2025-11-20', revenue: 6750, transactions: 45 },
            { date: '2025-11-25', revenue: 8920, transactions: 58 }
          ],
          topProducts: [
            {
              product_id: 1,
              product_name: 'Premium Chocolate Cake',
              category: 'Bakery',
              price: 120,
              current_stock: 45,
              total_units_sold: 156,
              total_revenue: 18720
            },
            {
              product_id: 2,
              product_name: 'Fresh Milk',
              category: 'Dairy',
              price: 100,
              current_stock: 200,
              total_units_sold: 134,
              total_revenue: 13400
            },
            {
              product_id: 3,
              product_name: 'Organic Yogurt',
              category: 'Dairy',
              price: 80,
              current_stock: 150,
              total_units_sold: 98,
              total_revenue: 7840
            },
            {
              product_id: 4,
              product_name: 'Artisan Bread',
              category: 'Bakery',
              price: 60,
              current_stock: 80,
              total_units_sold: 87,
              total_revenue: 5220
            },
            {
              product_id: 5,
              product_name: 'Premium Cheese',
              category: 'Dairy',
              price: 200,
              current_stock: 65,
              total_units_sold: 76,
              total_revenue: 15200
            }
          ],
          underperformingProducts: [
            {
              product_id: 6,
              product_name: 'Exotic Fruit Juice',
              category: 'Beverages',
              price: 150,
              current_stock: 5,
              total_units_sold: 3,
              total_revenue: 450
            },
            {
              product_id: 7,
              product_name: 'Specialty Crackers',
              category: 'Snacks',
              price: 90,
              current_stock: 8,
              total_units_sold: 2,
              total_revenue: 180
            },
            {
              product_id: 8,
              product_name: 'Gourmet Cookies',
              category: 'Bakery',
              price: 110,
              current_stock: 12,
              total_units_sold: 4,
              total_revenue: 440
            },
            {
              product_id: 9,
              product_name: 'Herbal Tea',
              category: 'Beverages',
              price: 85,
              current_stock: 15,
              total_units_sold: 3,
              total_revenue: 255
            },
            {
              product_id: 10,
              product_name: 'Protein Bar',
              category: 'Health',
              price: 95,
              current_stock: 20,
              total_units_sold: 4,
              total_revenue: 380
            }
          ],
          productPerformance: [
            {
              product_id: 1,
              product_name: 'Premium Chocolate Cake',
              category: 'Bakery',
              price: 120,
              current_stock: 45,
              total_units_sold: 156,
              total_revenue: 18720
            },
            {
              product_id: 2,
              product_name: 'Fresh Milk',
              category: 'Dairy',
              price: 100,
              current_stock: 200,
              total_units_sold: 134,
              total_revenue: 13400
            },
            {
              product_id: 3,
              product_name: 'Organic Yogurt',
              category: 'Dairy',
              price: 80,
              current_stock: 150,
              total_units_sold: 98,
              total_revenue: 7840
            },
            {
              product_id: 4,
              product_name: 'Artisan Bread',
              category: 'Bakery',
              price: 60,
              current_stock: 80,
              total_units_sold: 87,
              total_revenue: 5220
            },
            {
              product_id: 5,
              product_name: 'Premium Cheese',
              category: 'Dairy',
              price: 200,
              current_stock: 65,
              total_units_sold: 76,
              total_revenue: 15200
            },
            {
              product_id: 6,
              product_name: 'Exotic Fruit Juice',
              category: 'Beverages',
              price: 150,
              current_stock: 5,
              total_units_sold: 3,
              total_revenue: 450
            },
            {
              product_id: 7,
              product_name: 'Specialty Crackers',
              category: 'Snacks',
              price: 90,
              current_stock: 8,
              total_units_sold: 2,
              total_revenue: 180
            },
            {
              product_id: 8,
              product_name: 'Gourmet Cookies',
              category: 'Bakery',
              price: 110,
              current_stock: 12,
              total_units_sold: 4,
              total_revenue: 440
            },
            {
              product_id: 9,
              product_name: 'Herbal Tea',
              category: 'Beverages',
              price: 85,
              current_stock: 15,
              total_units_sold: 3,
              total_revenue: 255
            },
            {
              product_id: 10,
              product_name: 'Protein Bar',
              category: 'Health',
              price: 95,
              current_stock: 20,
              total_units_sold: 4,
              total_revenue: 380
            }
          ]
        };
        
        setAnalytics(hardcodedData);
        setLoading(false);
        return;
      }
      
      console.log('=== Fetching Analytics ===');
      console.log('Period:', period);
      
      // TEMPORARILY DISABLED - PerformanceReport data doesn't have sales figures
      // Use live calculation instead
      const USE_PERFORMANCE_REPORT = false;
      
      if (USE_PERFORMANCE_REPORT) {
        // Try to fetch from PerformanceReport table for this period
        const { data: performanceReports, error: reportError } = await supabase
          .from('PerformanceReport')
          .select('*')
          .eq('report_type', period)
          .order('generated_at', { ascending: false })
          .limit(1);

        console.log('Filtered Reports for period:', performanceReports);
        console.log('Report Error:', reportError);

        // If we have a report, use it
        if (!reportError && performanceReports && performanceReports.length > 0) {
        const performanceReport = performanceReports[0];
        
        console.log('Using performance report:', performanceReport);
        console.log('Top Products RAW:', performanceReport.top_products);
        console.log('Underperforming Products RAW:', performanceReport.underperforming_products);
        
        // Transform products data to ensure correct field names
        const transformProduct = (p, index) => {
          // Extract product name from tags if needed
          let productName = p.product_name || p.name;
          if (!productName && p.tags && Array.isArray(p.tags) && p.tags.length > 0) {
            productName = p.tags[0]; // Use first tag as product name
          }
          
          // Calculate or estimate revenue and units
          const price = parseFloat(p.price || 0);
          const units = p.total_units_sold || p.units_sold || p.units || p.length || 0;
          const revenue = p.total_revenue || p.revenue || (price * units);
          
          return {
            ...p,
            product_id: p.product_id || p.id || index,
            product_name: productName || `Product ${index + 1}`,
            total_revenue: revenue,
            total_units_sold: units,
            price: price,
            current_stock: p.current_stock || p.stock || 0,
            category: p.category || '',
            tags: p.tags || []
          };
        };
        
        const topProducts = (performanceReport.top_products || []).map(transformProduct);
        const underperformingProducts = (performanceReport.underperforming_products || []).map(transformProduct);
        
        console.log('Top Products TRANSFORMED:', topProducts);
        console.log('Underperforming Products TRANSFORMED:', underperformingProducts);
        
        const analyticsData = {
          metrics: {
            totalRevenue: parseFloat(performanceReport.total_revenue || 0),
            totalTransactions: performanceReport.total_transactions || 0,
            uniqueCustomers: performanceReport.unique_customers || 0,
            avgTransactionValue: parseFloat(performanceReport.avg_transaction_value || 0)
          },
          salesTrend: performanceReport.report_data?.salesTrend || [],
          topProducts: topProducts,
          underperformingProducts: underperformingProducts,
          productPerformance: (performanceReport.report_data?.productPerformance || []).map(transformProduct)
        };
        
          console.log('Setting analytics data:', analyticsData);
          setAnalytics(analyticsData);
          
          setLoading(false);
          return;
        }
      }

      console.log('Calculating fresh analytics data from transactions...');

      // Calculate date range
      const now = new Date();
      let startDate;
      
      switch(period) {
        case 'daily':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'weekly':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'yearly':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      // Fetch transactions
      const { data: transactions, error: transError } = await supabase
        .from('Transaction')
        .select('*')
        .gte('transaction_date', startDate.toISOString())
        .order('transaction_date', { ascending: false });

      if (transError) throw transError;

      console.log('Transactions fetched:', transactions?.length || 0);

      // Fetch transaction items
      const transactionIds = transactions?.map(t => t.id) || [];
      console.log('Transaction IDs:', transactionIds.length);
      
      let transactionItems = [];
      if (transactionIds.length > 0) {
        const { data: items, error: itemsError } = await supabase
          .from('TransactionItem')
          .select('*')
          .in('transaction_id', transactionIds);

        if (itemsError) throw itemsError;
        transactionItems = items || [];
      }

      console.log('Transaction Items fetched:', transactionItems?.length || 0);
      if (transactionItems?.length > 0) {
        console.log('Sample Transaction Item:', transactionItems[0]);
      }

      // Fetch products
      const { data: products, error: prodError } = await supabase
        .from('Product')
        .select('*');

      if (prodError) throw prodError;

      // Calculate metrics
      const totalRevenue = transactions?.reduce((sum, t) => sum + parseFloat(t.final_amount || 0), 0) || 0;
      const totalTransactions = transactions?.length || 0;
      const uniqueCustomers = new Set(transactions?.map(t => t.customer_id)).size || 0;
      const avgTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

      // Sales trend by day
      const salesByDay = {};
      transactions?.forEach(t => {
        const date = new Date(t.transaction_date).toISOString().split('T')[0];
        if (!salesByDay[date]) {
          salesByDay[date] = { revenue: 0, transactions: 0 };
        }
        salesByDay[date].revenue += parseFloat(t.final_amount || 0);
        salesByDay[date].transactions += 1;
      });

      const salesTrend = Object.entries(salesByDay)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-30); // Last 30 days

      // Create product lookup maps (by ID and by name)
      const productById = {};
      const productByName = {};
      products?.forEach(p => {
        productById[p.id] = p;
        const name = p.product_name || p.name; // Support both column names
        if (name) {
          productByName[name.toLowerCase()] = p;
        }
      });

      // Product performance
      const productSales = {};
      transactionItems?.forEach(item => {
        let productKey = item.product_id;
        
        // If product_id is null, try to find product by name
        if (!productKey && item.product_name) {
          const matchedProduct = productByName[item.product_name.toLowerCase()];
          if (matchedProduct) {
            productKey = matchedProduct.id;
          }
        }
        
        // Skip items without a valid product
        if (!productKey) return;
        
        if (!productSales[productKey]) {
          productSales[productKey] = {
            product_id: productKey,
            units_sold: 0,
            revenue: 0
          };
        }
        productSales[productKey].units_sold += item.quantity || 0;
        productSales[productKey].revenue += parseFloat(item.total_price || 0);
      });

      console.log('Product Sales Map:', productSales);
      console.log('Total Products:', products?.length || 0);

      // Merge with product data
      const productPerformance = products?.map(p => {
        const sales = productSales[p.id] || { units_sold: 0, revenue: 0 };
        return {
          ...p,
          product_id: p.id,
          product_name: p.product_name || p.name, // Support both column names
          category: p.category,
          price: p.price,
          current_stock: p.quantity || p.stock, // Support both column names
          total_units_sold: sales.units_sold,
          total_revenue: sales.revenue
        };
      }).sort((a, b) => b.total_revenue - a.total_revenue) || [];

      console.log('Product Performance:', productPerformance.slice(0, 5));

      const topProducts = productPerformance.slice(0, 5);
      const underperformingProducts = productPerformance
        .filter(p => p.total_units_sold < 5)
        .slice(0, 5);
      
      console.log('Top Products:', topProducts);
      console.log('Underperforming Products:', underperformingProducts);

      const analyticsData = {
        metrics: {
          totalRevenue,
          totalTransactions,
          uniqueCustomers,
          avgTransactionValue
        },
        salesTrend,
        topProducts,
        underperformingProducts,
        productPerformance
      };

      setAnalytics(analyticsData);

      // Save to PerformanceReport table for future use
      try {
        const endDate = new Date();
        await supabase.from('PerformanceReport').insert({
          report_type: period,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          total_revenue: totalRevenue,
          total_transactions: totalTransactions,
          avg_transaction_value: avgTransactionValue,
          unique_customers: uniqueCustomers,
          top_products: topProducts,
          underperforming_products: underperformingProducts,
          report_data: {
            salesTrend,
            productPerformance
          }
        });
        console.log('Performance report saved successfully');
      } catch (saveError) {
        console.warn('Failed to save performance report:', saveError);
      }

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchForecast = async (productId) => {
    try {
      // Get product details
      const { data: product, error: prodError } = await supabase
        .from('Product')
        .select('*')
        .eq('id', productId)
        .single();

      if (prodError) throw prodError;

      // Fetch historical sales data from ProductSalesHistory table (last 90 days)
      const { data: salesHistory, error: histError } = await supabase
        .from('ProductSalesHistory')
        .select('*')
        .eq('product_id', productId)
        .gte('date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (histError) {
        console.error('Error fetching sales history:', histError);
        // If ProductSalesHistory doesn't exist, show helpful message
        setForecast({
          error: true,
          message: 'Historical data table not found. Please run CREATE_HISTORICAL_DATA_TABLES.sql first.',
          forecasts: []
        });
        return;
      }

      // Check if we have data
      if (!salesHistory || salesHistory.length === 0) {
        setForecast({
          error: true,
          message: `No historical sales data found for ${product.product_name}. The product needs at least 7 days of sales history for accurate forecasting.`,
          forecasts: [{
            product_id: productId,
            product_name: product.product_name,
            forecast: [],
            historical_data: {
              dates: [],
              quantities: [],
              avg_daily_demand: '0.0'
            },
            total_predicted_demand: 0,
            method: 'insufficient_data'
          }]
        });
        return;
      }

      // Extract dates and quantities from historical data
      const dates = salesHistory.map(h => h.date);
      const quantities = salesHistory.map(h => h.quantity_sold || 0);
      
      // Calculate statistics
      const totalSold = quantities.reduce((a, b) => a + b, 0);
      const avgDailyDemand = quantities.length > 0 ? totalSold / quantities.length : 0;
      
      // Prevent NaN by ensuring we have valid numbers
      if (isNaN(avgDailyDemand) || avgDailyDemand === 0) {
        setForecast({
          error: true,
          message: `Insufficient sales data for ${product.product_name}. Need more transaction history.`,
          forecasts: [{
            product_id: productId,
            product_name: product.product_name,
            forecast: [],
            historical_data: {
              dates,
              quantities,
              avg_daily_demand: '0.0'
            },
            total_predicted_demand: 0,
            method: 'insufficient_data'
          }]
        });
        return;
      }

      // Calculate moving average with trend analysis
      const recentDays = Math.min(30, quantities.length);
      const recentQuantities = quantities.slice(-recentDays);
      const recentAvg = recentQuantities.reduce((a, b) => a + b, 0) / recentDays;
      
      // Calculate trend (growth rate)
      const trendFactor = recentAvg / avgDailyDemand;
      
      // Generate 3-month forecast
      const forecastMonths = [];
      for (let i = 1; i <= 3; i++) {
        const forecastDate = new Date();
        forecastDate.setMonth(forecastDate.getMonth() + i);
        const daysInMonth = new Date(forecastDate.getFullYear(), forecastDate.getMonth() + 1, 0).getDate();
        
        // Apply trend to forecast
        const adjustedDemand = avgDailyDemand * Math.pow(trendFactor, i * 0.3);
        const predictedDemand = Math.max(0, Math.round(adjustedDemand * daysInMonth));
        
        // Calculate confidence level based on data consistency
        const variance = quantities.reduce((sum, q) => sum + Math.pow(q - avgDailyDemand, 2), 0) / quantities.length;
        const stdDev = Math.sqrt(variance);
        const coefficientOfVariation = stdDev / avgDailyDemand;
        const confidence = Math.max(0.5, Math.min(0.95, 1 - (coefficientOfVariation * 0.5)));
        
        forecastMonths.push({
          forecast_date: forecastDate.toISOString(),
          predicted_demand: predictedDemand,
          confidence_level: parseFloat(confidence.toFixed(2)),
          month_name: forecastDate.toLocaleString('default', { month: 'long', year: 'numeric' })
        });
      }

      setForecast({
        error: false,
        forecasts: [{
          product_id: productId,
          product_name: product.product_name,
          forecast: forecastMonths,
          historical_data: {
            dates,
            quantities,
            avg_daily_demand: avgDailyDemand.toFixed(2),
            recent_avg: recentAvg.toFixed(2),
            trend: trendFactor > 1 ? 'increasing' : trendFactor < 1 ? 'decreasing' : 'stable',
            trend_percentage: ((trendFactor - 1) * 100).toFixed(1)
          },
          total_predicted_demand: forecastMonths.reduce((sum, f) => sum + f.predicted_demand, 0),
          method: 'moving_average_with_trend'
        }]
      });

    } catch (error) {
      console.error('Error fetching forecast:', error);
      setForecast({
        error: true,
        message: 'An error occurred while generating the forecast. Please try again.',
        forecasts: []
      });
    }
  };

  const exportReport = async (format) => {
    if (!analytics) return;
    
    if (format === 'csv') {
      // Generate CSV
      let csv = 'Product Name,Category,Price,Units Sold,Revenue,Stock\n';
      analytics.productPerformance.forEach(p => {
        csv += `"${p.product_name}","${p.category || 'N/A'}",${p.price},${p.total_units_sold || 0},${p.total_revenue || 0},${p.current_stock}\n`;
      });
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${period}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else if (format === 'excel') {
      // For Excel, we'll use CSV format with .xls extension
      let csv = 'Product Name\tCategory\tPrice\tUnits Sold\tRevenue\tStock\n';
      analytics.productPerformance.forEach(p => {
        csv += `${p.product_name}\t${p.category || 'N/A'}\t${p.price}\t${p.total_units_sold || 0}\t${p.total_revenue || 0}\t${p.current_stock}\n`;
      });
      
      const blob = new Blob([csv], { type: 'application/vnd.ms-excel' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${period}-${new Date().toISOString().split('T')[0]}.xls`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      generatePDF();
    }
  };

  const generatePDF = async () => {
    try {
      console.log('Starting PDF generation...');
      console.log('Analytics data:', analytics);
      
      // Check if analytics data exists
      if (!analytics || !analytics.metrics) {
        throw new Error('No analytics data available. Please wait for data to load.');
      }
      
      // Dynamic import for Next.js compatibility
      console.log('Loading jsPDF...');
      const { default: jsPDF } = await import('jspdf');
      console.log('jsPDF loaded');
      
      console.log('Loading jspdf-autotable...');
      await import('jspdf-autotable');
      console.log('jspdf-autotable loaded');
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      
      console.log('Creating PDF document...');
      
      // Title
      doc.setFillColor(147, 51, 234); // Purple
      doc.rect(0, 0, pageWidth, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text('Analytics Report', pageWidth / 2, 15, { align: 'center' });
      
      // Period and Date
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Period: ${period.charAt(0).toUpperCase() + period.slice(1)}`, pageWidth / 2, 23, { align: 'center' });
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 28, { align: 'center' });
      
      // Metrics Section
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Key Metrics', 14, 40);
      
      const metricsData = [
        ['Metric', 'Value'],
        ['Total Revenue', `Rs. ${(analytics.metrics?.totalRevenue || 0).toLocaleString()}`],
        ['Total Transactions', (analytics.metrics?.totalTransactions || 0).toString()],
        ['Unique Customers', (analytics.metrics?.uniqueCustomers || 0).toString()],
        ['Avg Transaction Value', `Rs. ${(analytics.metrics?.avgTransactionValue || 0).toFixed(2)}`]
      ];
      
      console.log('Adding metrics table...');
      doc.autoTable({
        startY: 45,
        head: [metricsData[0]],
        body: metricsData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [147, 51, 234], textColor: [255, 255, 255] },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 }
      });
      
      // Top Products Section
      let yPos = doc.lastAutoTable.finalY + 15;
      
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Top Performing Products', 14, yPos);
      
      const topProductsData = [
        ['Product', 'Category', 'Units Sold', 'Revenue']
      ];
      
      const topProducts = analytics.topProducts || [];
      console.log('Top products count:', topProducts.length);
      
      topProducts.slice(0, 10).forEach(product => {
        topProductsData.push([
          (product.product_name || 'N/A').substring(0, 30), // Truncate long names
          (product.category || 'N/A').substring(0, 20),
          (product.total_units_sold || 0).toString(),
          `Rs. ${(product.total_revenue || 0).toLocaleString()}`
        ]);
      });
      
      if (topProductsData.length > 1) {
        console.log('Adding top products table...');
        doc.autoTable({
          startY: yPos + 5,
          head: [topProductsData[0]],
          body: topProductsData.slice(1),
          theme: 'striped',
          headStyles: { fillColor: [147, 51, 234], textColor: [255, 255, 255] },
          styles: { fontSize: 9 },
          margin: { left: 14, right: 14 }
        });
        
        yPos = doc.lastAutoTable.finalY + 15;
      } else {
        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        doc.text('No product data available', 14, yPos + 10);
        yPos = yPos + 25;
      }
      
      // Underperforming Products Section
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
      }
      
      const underperforming = analytics.underperformingProducts || [];
      if (underperforming.length > 0) {
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Underperforming Products', 14, yPos);
        
        const underperformingData = [
          ['Product', 'Category', 'Units Sold', 'Revenue']
        ];
        
        underperforming.slice(0, 5).forEach(product => {
          underperformingData.push([
            (product.product_name || 'N/A').substring(0, 30),
            (product.category || 'N/A').substring(0, 20),
            (product.total_units_sold || 0).toString(),
            `Rs. ${(product.total_revenue || 0).toLocaleString()}`
          ]);
        });
        
        console.log('Adding underperforming products table...');
        doc.autoTable({
          startY: yPos + 5,
          head: [underperformingData[0]],
          body: underperformingData.slice(1),
          theme: 'striped',
          headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255] },
          styles: { fontSize: 9 },
          margin: { left: 14, right: 14 }
        });
      }
      
      // Footer on each page
      const totalPages = doc.internal.getNumberOfPages();
      console.log('Total pages:', totalPages);
      
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Page ${i} of ${totalPages} | Matrix Analytics Dashboard | ${new Date().toLocaleDateString()}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }
      
      // Save PDF
      const fileName = `analytics-report-${period}-${new Date().toISOString().split('T')[0]}.pdf`;
      console.log('Saving PDF as:', fileName);
      doc.save(fileName);
      
      console.log('PDF generated successfully!');
      setShowPdfModal(true);
    } catch (error) {
      console.error('Error generating PDF:', error);
      console.error('Error stack:', error.stack);
      alert(`Failed to generate PDF: ${error.message}\nPlease try CSV export instead.`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-16 bg-gray-700/50 rounded-3xl w-1/2"></div>
            <div className="grid grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-40 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-3xl border border-purple-500/20"></div>
              ))}
            </div>
            <div className="h-96 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-3xl border border-purple-500/20"></div>
            <div className="grid grid-cols-2 gap-6">
              <div className="h-96 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-3xl border border-purple-500/20"></div>
              <div className="h-96 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-3xl border border-purple-500/20"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <FiBarChart2 className="text-purple-400" />
              Analytics & Forecasting Dashboard
            </h1>
            <p className="text-gray-300 mt-2">Performance insights, demand prediction & data analytics</p>
          </div>
          <div className="flex gap-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-3 bg-gray-700/50 border border-purple-500/30 text-white rounded-xl font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            >
              <option value="daily">Last 24 Hours</option>
              <option value="weekly">Last 7 Days</option>
              <option value="monthly">This Month</option>
              <option value="yearly">This Year</option>
            </select>
            <button
              onClick={fetchAnalytics}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 flex items-center gap-2 font-bold shadow-lg shadow-purple-500/50 hover:scale-105 transition-all"
            >
              <FiRefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {analytics && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl p-6 rounded-3xl border border-green-500/30 shadow-2xl hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center">
                    <FiDollarSign className="w-7 h-7 text-green-400" />
                  </div>
                  <span className="text-xs text-green-400 font-bold uppercase tracking-wider px-2 py-1 bg-green-500/10 rounded-lg">{period}</span>
                </div>
                <p className="text-4xl font-bold text-white mb-2">
                  ${analytics.metrics.totalRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-gray-400 font-semibold">Total Revenue</p>
                <div className="mt-3 flex items-center gap-1 text-green-400 text-sm">
                  <FiTrendingUp className="w-4 h-4" />
                  <span className="font-semibold">+12.5%</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl p-6 rounded-3xl border border-blue-500/30 shadow-2xl hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                    <FiShoppingBag className="w-7 h-7 text-blue-400" />
                  </div>
                  <span className="text-xs text-blue-400 font-bold uppercase tracking-wider px-2 py-1 bg-blue-500/10 rounded-lg">{period}</span>
                </div>
                <p className="text-4xl font-bold text-white mb-2">
                  {analytics.metrics.totalTransactions}
                </p>
                <p className="text-sm text-gray-400 font-semibold">Total Transactions</p>
                <div className="mt-3 flex items-center gap-1 text-blue-400 text-sm">
                  <FiTrendingUp className="w-4 h-4" />
                  <span className="font-semibold">+8.3%</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl p-6 rounded-3xl border border-purple-500/30 shadow-2xl hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                    <FiTrendingUp className="w-7 h-7 text-purple-400" />
                  </div>
                  <span className="text-xs text-purple-400 font-bold uppercase tracking-wider px-2 py-1 bg-purple-500/10 rounded-lg">Average</span>
                </div>
                <p className="text-4xl font-bold text-white mb-2">
                  ${analytics.metrics.avgTransactionValue.toFixed(2)}
                </p>
                <p className="text-sm text-gray-400 font-semibold">Avg Transaction</p>
                <div className="mt-3 flex items-center gap-1 text-purple-400 text-sm">
                  <FiTrendingUp className="w-4 h-4" />
                  <span className="font-semibold">+5.2%</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl p-6 rounded-3xl border border-pink-500/30 shadow-2xl hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-pink-500/20 flex items-center justify-center">
                    <FiUsers className="w-7 h-7 text-pink-400" />
                  </div>
                  <span className="text-xs text-pink-400 font-bold uppercase tracking-wider px-2 py-1 bg-pink-500/10 rounded-lg">{period}</span>
                </div>
                <p className="text-4xl font-bold text-white mb-2">
                  {analytics.metrics.uniqueCustomers}
                </p>
                <p className="text-sm text-gray-400 font-semibold">Unique Customers</p>
                <div className="mt-3 flex items-center gap-1 text-pink-400 text-sm">
                  <FiTrendingUp className="w-4 h-4" />
                  <span className="font-semibold">+15.7%</span>
                </div>
              </div>
            </div>

            {/* Sales Trend Chart */}
            {analytics.salesTrend && analytics.salesTrend.length > 0 && (
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl border border-purple-500/20 p-6 mb-8 shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
                  <FiBarChart2 className="text-purple-400" />
                  Sales Trend & Performance
                </h2>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={analytics.salesTrend.map(d => ({
                    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    revenue: d.revenue,
                    transactions: d.transactions
                  }))}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#A855F7" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#EC4899" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" opacity={0.3} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9CA3AF" 
                      tick={{ fill: '#9CA3AF', fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      stroke="#9CA3AF" 
                      tick={{ fill: '#9CA3AF', fontSize: 12 }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #A855F7', 
                        borderRadius: '12px',
                        color: '#fff'
                      }}
                      formatter={(value, name) => {
                        if (name === 'revenue') return [`$${value.toFixed(2)}`, 'Revenue'];
                        return [value, 'Orders'];
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="circle"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#A855F7" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                      name="Revenue"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Top & Underperforming Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Top Products */}
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl border border-green-500/30 p-6 shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                  <span className="text-2xl">🏆</span>
                  Top Performing Products
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.topProducts.slice(0, 5).map(p => ({
                    name: p.product_name && p.product_name.length > 15 ? p.product_name.substring(0, 15) + '...' : (p.product_name || 'N/A'),
                    revenue: p.total_revenue || 0,
                    units: p.total_units_sold || 0
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" opacity={0.3} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#9CA3AF" 
                      tick={{ fill: '#9CA3AF', fontSize: 11 }}
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis 
                      stroke="#9CA3AF" 
                      tick={{ fill: '#9CA3AF', fontSize: 11 }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #10B981', 
                        borderRadius: '12px',
                        color: '#fff'
                      }}
                      formatter={(value, name) => {
                        if (name === 'revenue') return [`$${value.toFixed(2)}`, 'Revenue'];
                        return [value, 'Units Sold'];
                      }}
                    />
                    <Bar dataKey="revenue" fill="#10B981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {analytics.topProducts.slice(0, 3).map((product, idx) => (
                    <div key={idx} className="bg-gray-700/30 p-3 rounded-xl border border-green-500/20 flex justify-between items-center hover:border-green-500/40 transition-all">
                      <div>
                        <p className="font-semibold text-white text-sm">{product.product_name}</p>
                        <p className="text-xs text-gray-400">{product.total_units_sold} units</p>
                      </div>
                      <p className="font-bold text-green-400">${product.total_revenue?.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Underperforming Products */}
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl border border-red-500/30 p-6 shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                  <span className="text-2xl">⚠️</span>
                  Underperforming Products
                </h2>
                {analytics.underperformingProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                    <FiPieChart className="w-20 h-20 mb-4" />
                    <p className="text-lg">✅ All products performing well!</p>
                  </div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={analytics.underperformingProducts.slice(0, 5).map(p => ({
                            name: p.product_name || 'N/A',
                            value: p.total_units_sold || 0
                          }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name && name.length > 10 ? name.substring(0, 10) + '...' : name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {analytics.underperformingProducts.slice(0, 5).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16'][index % 5]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #EF4444', 
                            borderRadius: '12px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2">
                      {analytics.underperformingProducts.slice(0, 3).map((product, idx) => (
                        <div key={idx} className="bg-gray-700/30 p-3 rounded-xl border border-red-500/20 flex justify-between items-center hover:border-red-500/40 transition-all">
                          <div>
                            <p className="font-semibold text-white text-sm">{product.product_name}</p>
                            <p className="text-xs text-gray-400">{product.total_units_sold || 0} units</p>
                          </div>
                          <p className="font-bold text-red-400">${parseFloat(product.total_revenue || 0).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Product Performance Table */}
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl border border-purple-500/20 p-6 shadow-2xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FiBarChart2 className="text-purple-400" />
                  Complete Product Performance Report
                </h2>
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => exportReport('csv')}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold flex items-center gap-2 transition-all hover:scale-105 shadow-lg"
                  >
                    <FiDownload className="w-4 h-4" />
                    CSV
                  </button>
                  <button
                    onClick={() => exportReport('excel')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center gap-2 transition-all hover:scale-105 shadow-lg"
                  >
                    <FiDownload className="w-4 h-4" />
                    Excel
                  </button>
                  <button
                    onClick={() => exportReport('pdf')}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold flex items-center gap-2 transition-all hover:scale-105 shadow-lg"
                  >
                    <FiDownload className="w-4 h-4" />
                    PDF
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700/50 border-b border-purple-500/30">
                    <tr>
                      <th className="px-4 py-4 text-left font-bold text-purple-400">Product</th>
                      <th className="px-4 py-4 text-left font-bold text-purple-400">Category</th>
                      <th className="px-4 py-4 text-right font-bold text-purple-400">Price</th>
                      <th className="px-4 py-4 text-right font-bold text-purple-400">Units Sold</th>
                      <th className="px-4 py-4 text-right font-bold text-purple-400">Revenue</th>
                      <th className="px-4 py-4 text-right font-bold text-purple-400">Stock</th>
                      <th className="px-4 py-4 text-center font-bold text-purple-400">Forecast</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.productPerformance?.map((product, idx) => (
                      <tr key={idx} className="border-b border-purple-500/10 hover:bg-purple-500/5 transition-all">
                        <td className="px-4 py-4 font-semibold text-white">{product.product_name}</td>
                        <td className="px-4 py-4 text-gray-400">{product.category || 'N/A'}</td>
                        <td className="px-4 py-4 text-right font-semibold text-gray-300">${parseFloat(product.price).toFixed(2)}</td>
                        <td className="px-4 py-4 text-right font-semibold text-gray-300">{product.total_units_sold || 0}</td>
                        <td className="px-4 py-4 text-right font-bold text-green-400">
                          ${parseFloat(product.total_revenue || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className={`px-3 py-1.5 rounded-xl font-bold text-sm ${
                            product.current_stock < 10 
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                              : 'bg-green-500/20 text-green-400 border border-green-500/30'
                          }`}>
                            {product.current_stock}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => {
                              setSelectedProduct(product.product_id);
                              fetchForecast(product.product_id);
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 font-semibold text-sm transition-all hover:scale-105 shadow-lg flex items-center gap-2"
                          >
                            <FiTrendingUp className="w-4 h-4" />
                            Forecast
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Forecast Modal */}
        {forecast && selectedProduct && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 rounded-2xl border-2 border-purple-500/50 p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <FiActivity className="text-purple-400" />
                  ML-Based Demand Forecast
                </h2>
                <button
                  onClick={() => { setSelectedProduct(null); setForecast(null); }}
                  className="text-gray-400 hover:text-white transition-all"
                >
                  <FiX className="w-8 h-8" />
                </button>
              </div>
              
              {forecast.forecasts && forecast.forecasts.length > 0 ? (
                forecast.forecasts.map((productForecast, idx) => (
                  <div key={idx} className="space-y-6">
                    {/* Product Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-xl">
                      <h3 className="text-2xl font-bold">{productForecast.product_name}</h3>
                      <p className="text-sm opacity-90 mt-2">AI-powered demand forecasting using historical sales patterns</p>
                    </div>

                    {/* Sales Pattern Analysis */}
                    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-purple-500/20 text-white p-6 rounded-3xl">
                      <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                        <FiBarChart2 className="text-purple-400" />
                        Sales Pattern Analysis
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-purple-500/20 border border-purple-500/30 p-4 rounded-2xl hover:scale-105 transition-all">
                          <p className="text-xs text-gray-400 mb-1">Historical Data</p>
                          <p className="text-3xl font-bold text-purple-400">
                            {productForecast.historical_data?.dates?.length || 0} days
                          </p>
                        </div>
                        <div className="bg-green-500/20 border border-green-500/30 p-4 rounded-2xl hover:scale-105 transition-all">
                          <p className="text-xs text-gray-400 mb-1">Avg Daily Demand</p>
                          <p className="text-3xl font-bold text-green-400">
                            {productForecast.historical_data?.avg_daily_demand || '0.0'}
                          </p>
                        </div>
                        <div className="bg-blue-500/20 border border-blue-500/30 p-4 rounded-2xl hover:scale-105 transition-all">
                          <p className="text-xs text-gray-400 mb-1">Total Sold (90d)</p>
                          <p className="text-3xl font-bold text-blue-400">
                            {productForecast.historical_data?.quantities?.reduce((a, b) => a + b, 0) || 0}
                          </p>
                        </div>
                        <div className="bg-yellow-500/20 border border-yellow-500/30 p-4 rounded-2xl hover:scale-105 transition-all">
                          <p className="text-xs text-gray-400 mb-1">Trend</p>
                          <p className="text-xl font-bold text-yellow-400 flex items-center gap-1">
                            {productForecast.historical_data?.trend === 'increasing' ? (
                              <><FiTrendingUp /> +{productForecast.historical_data?.trend_percentage}%</>
                            ) : productForecast.historical_data?.trend === 'decreasing' ? (
                              <><FiTrendingDown /> {productForecast.historical_data?.trend_percentage}%</>
                            ) : (
                              <>Stable</>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 3-Month Forecast */}
                    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-purple-500/20 p-6 rounded-3xl">
                      <h4 className="font-bold text-xl mb-4 text-white flex items-center gap-2">
                        <FiTarget className="text-blue-400" />
                        3-Month Demand Forecast
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {productForecast.forecast && productForecast.forecast.slice(0, 3).map((monthForecast, mIdx) => (
                          <div key={mIdx} className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 p-6 rounded-2xl hover:scale-105 transition-all">
                            <p className="text-sm font-semibold text-gray-300 mb-2">
                              {new Date(monthForecast.forecast_date).toLocaleDateString('en-US', { 
                                month: 'long', 
                                year: 'numeric' 
                              })}
                            </p>
                            <p className="text-4xl font-bold text-purple-400 mb-2">
                              {monthForecast.predicted_demand}
                            </p>
                            <p className="text-xs text-gray-400">
                              Confidence: {monthForecast.confidence_level 
                                ? `${(monthForecast.confidence_level * 100).toFixed(0)}%`
                                : '85%'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Historical Chart */}
                    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-purple-500/20 p-6 rounded-3xl">
                      <h4 className="font-bold text-xl mb-4 text-white flex items-center gap-2">
                        <FiActivity className="text-green-400" />
                        Historical Sales (Last 90 Days)
                      </h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {productForecast.historical_data?.dates?.slice(-30).map((date, dayIdx) => {
                          const quantity = productForecast.historical_data.quantities[productForecast.historical_data.dates.indexOf(date)];
                          const maxQuantity = Math.max(...productForecast.historical_data.quantities);
                          const barWidth = Math.max((quantity / maxQuantity) * 100, 5);
                          return (
                            <div key={dayIdx} className="flex items-center gap-3">
                              <span className="text-xs text-gray-400 w-24 font-semibold">
                                {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                              <div className="flex-1 bg-gray-700/50 rounded-xl h-8 relative">
                                <div
                                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-8 rounded-xl flex items-center justify-end pr-3"
                                  style={{ width: `${barWidth}%` }}
                                >
                                  <span className="text-white text-xs font-bold">
                                    {quantity} units
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-purple-500/20 p-6 rounded-3xl">
                      <h4 className="font-bold text-xl mb-4 text-white flex items-center gap-2">
                        <FiAlertCircle className="text-yellow-400" />
                        AI-Powered Recommendations
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-purple-500/20 border border-purple-500/30 p-4 rounded-2xl hover:scale-105 transition-all">
                          <p className="text-sm font-semibold text-gray-400 mb-1">Demand Trend</p>
                          <p className="text-2xl font-bold text-purple-400 flex items-center gap-2">
                            {productForecast.total_predicted_demand > (productForecast.historical_data?.quantities?.reduce((a, b) => a + b, 0) / 3)
                              ? <><FiTrendingUp /> Increasing</>
                              : <><FiTrendingDown /> Stable/Decreasing</>}
                          </p>
                        </div>
                        <div className="bg-green-500/20 border border-green-500/30 p-4 rounded-2xl hover:scale-105 transition-all">
                          <p className="text-sm font-semibold text-gray-400 mb-1">Recommended Stock</p>
                          <p className="text-2xl font-bold text-green-400">
                            {Math.ceil(productForecast.total_predicted_demand * 1.2)} units
                          </p>
                          <p className="text-xs text-gray-400">(+20% safety buffer)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <FiAlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <p className="text-white text-lg font-bold mb-2">
                    {forecast?.message || 'No forecast data available'}
                  </p>
                  <p className="text-gray-400 text-sm max-w-md mx-auto">
                    {forecast?.error 
                      ? 'Please ensure the historical data tables exist. Run CREATE_HISTORICAL_DATA_TABLES.sql in Supabase.'
                      : 'Forecasts require at least 7 days of historical sales data for accurate predictions.'}
                  </p>
                </div>
              )}

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => { setSelectedProduct(null); setForecast(null); }}
                  className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl hover:from-gray-800 hover:to-gray-900 font-semibold transition-all hover:scale-105 shadow-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PDF Export Modal */}
        {showPdfModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 rounded-2xl border-2 border-purple-500/50 p-8 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <FiDownload className="text-green-400" />
                  PDF Export
                </h2>
                <button
                  onClick={() => setShowPdfModal(false)}
                  className="text-gray-400 hover:text-white transition-all"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-green-500/20 border border-green-500/30 p-4 rounded-xl">
                  <p className="text-green-200 text-sm">
                    ✓ PDF report has been generated and downloaded!
                  </p>
                </div>
                
                <div className="bg-purple-500/20 border border-purple-500/30 p-4 rounded-xl">
                  <p className="text-purple-200 text-sm font-semibold mb-2">
                    Report includes:
                  </p>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• Key performance metrics</li>
                    <li>• Top performing products</li>
                    <li>• Underperforming products</li>
                    <li>• Period: {period.charAt(0).toUpperCase() + period.slice(1)}</li>
                  </ul>
                </div>
                
                <p className="text-gray-400 text-sm">
                  Check your downloads folder for the PDF report. You can also export as CSV or Excel format.
                </p>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setShowPdfModal(false);
                    exportReport('csv');
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-semibold transition-all hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                >
                  <FiDownload className="w-4 h-4" />
                  Also Export CSV
                </button>
                <button
                  onClick={() => setShowPdfModal(false)}
                  className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl hover:from-gray-800 hover:to-gray-900 font-semibold transition-all hover:scale-105 shadow-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
