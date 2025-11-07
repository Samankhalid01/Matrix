# 📊 Demand Forecasting Implementation - Complete Guide

## Overview
This document explains how **FE-1: Forecast item demand using sales patterns and ML models** and **FE-2: Generate detailed forecast reports for future trends** are implemented in the MATRIX system.

---

## 🎯 Feature FE-1: Forecast Item Demand Using Sales Patterns and ML Models

### How It Works

#### 1. **Data Collection**
- System collects historical sales data from `Transaction` table
- Tracks product sales over the last 90 days minimum
- Records: quantity sold, date, product ID

#### 2. **ML Algorithm: Moving Average with Trend Analysis**
Located in: `scripts/generate-demand-forecast.js`

```javascript
// Step 1: Calculate moving average (last 6 months)
const avgDemand = historicalData.reduce((sum, val) => sum + val, 0) / historicalData.length;

// Step 2: Calculate trend using linear regression
const trend = calculateTrend(historicalData);

// Step 3: Generate 3-month forecast
const forecast = avgDemand + (trend * monthsAhead);

// Step 4: Apply confidence level based on data variance
const confidence = calculateConfidence(historicalData);
```

**Algorithm Details:**
- **Moving Average**: Smooths out short-term fluctuations
- **Trend Analysis**: Detects if demand is increasing or decreasing
- **Linear Regression**: Projects future demand based on historical slope
- **Confidence Level**: Higher for stable patterns, lower for volatile data

#### 3. **Where to See Sales Patterns in Frontend**

**Location**: `/admin/analytics-dashboard`

When you click the **"Forecast"** button for any product, you'll see:

##### A. **Sales Pattern Analysis Section** (Dark background)
- **Historical Data Points**: Number of days of sales data used
- **Avg Daily Demand**: Average units sold per day
- **Total Sold (90d)**: Total units sold in last 90 days
- **Forecast Method**: ML algorithm used (Moving Average with Trend)

##### B. **Historical Sales Pattern Chart** (Dark background with green bars)
Shows actual sales for each day over the last 90 days:
- **X-axis**: Dates (last 90 days)
- **Y-axis**: Units sold each day
- **Green bars**: Actual sales volume
- **Pattern**: You can visually see trends, spikes, and seasonal patterns

##### C. **3-Month Demand Forecast** (Blue cards)
Shows predicted demand for next 3 months:
- **Month 1**: December 2025
- **Month 2**: January 2026
- **Month 3**: February 2026
Each card shows:
- Predicted units to sell
- Confidence level (%)

##### D. **Future Trend Insights** (Purple section)
- **Demand Trend**: ↗️ Increasing or ↘️ Decreasing
- **Recommended Stock**: Suggested inventory level (+20% safety margin)

---

## 📈 Feature FE-2: Generate Detailed Forecast Reports for Future Trends

### Report Generation Features

#### 1. **Where to Export Reports**

**Location**: `/admin/analytics-dashboard`

In the **"All Products Performance"** table, you'll find **3 export buttons**:

```
📊 Export CSV | 📈 Export Excel | 📄 Export PDF
```

#### 2. **Report Formats Available**

##### **CSV Format**
- Plain text, comma-separated
- Easy to open in Excel, Google Sheets
- Contains: Product, Category, Price, Units Sold, Revenue, Stock
- **Use case**: Data analysis, importing to other systems

##### **Excel Format (.xlsx)**
- Professional spreadsheet format
- Formatted columns with proper widths
- Header row with report metadata
- **Use case**: Business presentations, financial analysis

##### **PDF Format**
- Professional document format
- Includes summary statistics:
  - Total Revenue
  - Total Units Sold
  - Total Products
- Formatted table with all product data
- **Use case**: Reports for management, printing, archiving

#### 3. **Report Contents**

Each report includes:

| Field | Description |
|-------|-------------|
| **Product** | Product name |
| **Category** | Product category |
| **Price** | Current selling price |
| **Units Sold** | Total units sold in selected period |
| **Revenue** | Total revenue generated |
| **Stock** | Current inventory level |

**Period Options:**
- Last 24 Hours (daily)
- Last 7 Days (weekly)
- This Month (monthly)
- This Year (yearly)

#### 4. **How Reports Show Future Trends**

Reports include:
1. **Historical Performance**: What sold in the past
2. **Current Stock Levels**: What's available now
3. **Forecast Data** (when clicking Forecast button):
   - 3-month demand prediction
   - Trend direction (increasing/decreasing)
   - Recommended stock levels

**Future Trend Calculation:**
```javascript
// Compare forecast vs historical average
if (predicted_demand > historical_average) {
  trend = "↗️ Increasing";
  recommendation = "Stock up - demand rising";
} else {
  trend = "↘️ Stable/Decreasing";
  recommendation = "Maintain current levels";
}
```

---

## 🔧 Technical Implementation

### Backend Components

#### 1. **Forecast Generation Script**
**File**: `scripts/generate-demand-forecast.js`
```bash
# Run to generate forecasts for all products
node scripts/generate-demand-forecast.js
```

#### 2. **API Endpoints**

##### `/api/analytics/demand-forecast`
- **GET**: Fetch forecasts
- **Parameters**: 
  - `product_id`: Get forecast for specific product
  - `month`: Filter by month (YYYY-MM)
- **Returns**: Forecast data with historical sales patterns

##### `/api/analytics/export`
- **GET**: Export performance reports
- **Parameters**:
  - `format`: csv | excel | pdf
  - `period`: daily | weekly | monthly | yearly
- **Returns**: Downloadable file

##### `/api/analytics/performance`
- **GET**: Get product performance metrics
- **Parameters**: `period`
- **Returns**: Sales data, top products, underperforming products

### Database Schema

#### `DemandForecast` Table
```sql
CREATE TABLE DemandForecast (
  id UUID PRIMARY KEY,
  product_id BIGINT REFERENCES Product(id),
  forecast_date DATE,  -- Format: YYYY-MM-DD
  predicted_demand INTEGER,
  confidence_level DECIMAL,
  forecast_method VARCHAR,
  model_version VARCHAR,
  created_at TIMESTAMP
);
```

#### Sample Data
```sql
-- 3 forecasts per product
product_id | forecast_date | predicted_demand | method
-----------+---------------+------------------+------------------------
1          | 2025-12-01   | 1063             | moving_average_with_trend
1          | 2026-01-01   | 1063             | moving_average_with_trend
1          | 2026-02-01   | 1063             | moving_average_with_trend
```

---

## 📱 User Guide: How to Use Forecasting Features

### Step 1: View Sales Patterns
1. Go to `/admin/analytics-dashboard`
2. Scroll to **"All Products Performance"** table
3. Find any product
4. Click the **"Forecast"** button

### Step 2: Analyze Sales Patterns
In the popup modal, you'll see:
- **Historical Sales Chart** (dark background, green bars)
  - Shows daily sales for last 90 days
  - Helps identify trends, spikes, seasonality
- **Sales Pattern Analysis** (metrics at top)
  - Avg daily demand
  - Total sold
  - Data points used

### Step 3: View Demand Forecast
- **3-Month Forecast Cards** (blue cards)
  - See predicted demand for each of next 3 months
  - Confidence level for each prediction
- **Future Trend Insights** (purple section)
  - Whether demand is increasing or decreasing
  - Recommended stock level

### Step 4: Export Reports
1. In the products table header, click export button:
   - **📊 Export CSV** - for spreadsheet analysis
   - **📈 Export Excel** - for presentations
   - **📄 Export PDF** - for printing/sharing
2. File downloads automatically
3. Open in appropriate application

### Step 5: Use Insights for Planning
Based on forecast data:
- **Increasing demand** → Order more inventory
- **Decreasing demand** → Reduce orders, run promotions
- **Low stock + high forecast** → Urgent restock needed
- **High stock + low forecast** → Avoid overstocking

---

## 🎨 UI/UX Improvements Made

### Visibility Fixes
1. ✅ **Dropdown menu** - Changed to black text on white background
2. ✅ **Sales Trend chart** - Now dark background (gray-900) with white text
3. ✅ **Product table** - Dark header (gray-800), bold text, visible colors
4. ✅ **Forecast button** - Changed to prominent blue button (was underlined text)
5. ✅ **Export buttons** - Added 3 prominent export buttons with icons

### Forecast Modal Enhancements
1. **Dark Sections**: Sales pattern analysis uses dark background for better visibility
2. **Color-Coded Cards**: 
   - Blue: Forecast data
   - Purple: Trend insights
   - Dark: Historical patterns
3. **Visual Charts**: Bar charts show actual data patterns
4. **Clear Labels**: Every metric clearly labeled and explained

---

## 📊 Data Flow Diagram

```
┌─────────────────┐
│  Transaction    │
│  Table          │ → Historical Sales Data (90 days)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  ML Algorithm   │
│  (Moving Avg +  │ → Calculate Trend
│   Trend)        │ → Generate Forecast
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ DemandForecast  │
│ Table           │ → Store 3-month predictions
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Frontend Display               │
├─────────────────────────────────┤
│ • Historical Sales Chart        │
│ • 3-Month Forecast Cards        │
│ • Trend Analysis                │
│ • Recommended Stock             │
└─────────────────────────────────┘
```

---

## 🧪 Testing the Features

### Test Sales Pattern Visualization
1. Open `/admin/analytics-dashboard`
2. Find product: "Gourmet Cola" or "Lays"
3. Click **Forecast** button
4. Verify you see:
   - ✅ Dark background sections
   - ✅ Green historical sales bars
   - ✅ 3 blue forecast cards
   - ✅ Purple trend insights
   - ✅ All text is visible (white on dark, dark on light)

### Test Export Functionality
1. Stay on `/admin/analytics-dashboard`
2. Scroll to products table
3. Click **📊 Export CSV** - verify CSV downloads
4. Click **📈 Export Excel** - verify .xlsx downloads
5. Click **📄 Export PDF** - verify PDF downloads
6. Open each file - verify data is correct

### Test Different Products
Try clicking Forecast for different products to see varied patterns:
- Products with consistent sales → straight line pattern
- Products with growing sales → upward trend
- Products with sporadic sales → varied bar heights

---

## 🔮 Future Enhancements

Possible improvements:
1. **More ML Models**: ARIMA, Prophet, LSTM neural networks
2. **Seasonal Adjustments**: Handle holiday spikes, seasonal patterns
3. **External Factors**: Weather, events, promotions
4. **What-If Analysis**: Simulate different scenarios
5. **Automated Alerts**: Email when forecast predicts stockout
6. **Inventory Integration**: Auto-generate purchase orders

---

## 📞 Support

If you need help:
1. Check this documentation
2. Review code comments in `scripts/generate-demand-forecast.js`
3. Check API responses in browser console (F12)
4. Verify data exists in database:
   ```sql
   SELECT * FROM DemandForecast LIMIT 10;
   ```

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Status**: ✅ Fully Implemented
