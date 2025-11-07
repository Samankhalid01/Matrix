# API Routes Structure for New Modules

## 📋 Overview
This document outlines all API routes needed for Promotions, Analytics, and Notifications modules.

---

## 🎁 Module 5: Promotions & Discounts

### **1. Customer Segmentation**
```
GET /api/analytics/customer-segments
```
**Description:** Segments customers based on purchase history
**Query Parameters:**
- `period` (optional): 'monthly', 'quarterly', 'yearly' (default: 'monthly')

**Response:**
```json
{
  "success": true,
  "segments": {
    "high_spenders": [
      {
        "customer_id": "uuid",
        "name": "Alice Johnson",
        "tier": "PLATINUM",
        "monthly_avg": 1250.50,
        "total_transactions": 45
      }
    ],
    "medium_spenders": [...],
    "low_spenders": [...]
  },
  "summary": {
    "high_spenders_count": 5,
    "medium_spenders_count": 15,
    "low_spenders_count": 30
  }
}
```

---

### **2. Calculate Discount**
```
POST /api/promotions/calculate-discount
```
**Description:** Calculate discount based on customer tier and promo codes
**Body:**
```json
{
  "customerId": "uuid",
  "cartTotal": 150.00,
  "promoCode": "WELCOME10" // optional
}
```

**Response:**
```json
{
  "success": true,
  "discount": {
    "tier_discount": {
      "tier": "GOLD",
      "percentage": 15,
      "amount": 22.50
    },
    "promo_discount": {
      "code": "WELCOME10",
      "percentage": 10,
      "amount": 15.00
    },
    "total_discount": 37.50,
    "original_total": 150.00,
    "final_amount": 112.50
  }
}
```

---

### **3. Get All Promotions**
```
GET /api/promotions
```
**Query Parameters:**
- `isActive` (optional): true/false
- `tier` (optional): 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM'

**Response:**
```json
{
  "success": true,
  "promotions": [
    {
      "id": "uuid",
      "code": "WELCOME10",
      "name": "Welcome Discount",
      "description": "10% off your first purchase",
      "discount_type": "percentage",
      "discount_value": 10,
      "target_tier": null,
      "min_purchase_amount": 20,
      "is_active": true,
      "usage_count": 45,
      "usage_limit": 100
    }
  ]
}
```

---

### **4. Create Promotion**
```
POST /api/promotions
```
**Body:**
```json
{
  "code": "SUMMER20",
  "name": "Summer Sale",
  "description": "20% off all items",
  "discount_type": "percentage",
  "discount_value": 20,
  "target_tier": null,
  "min_purchase_amount": 50,
  "start_date": "2025-06-01",
  "end_date": "2025-08-31",
  "is_active": true,
  "usage_limit": 500
}
```

---

### **5. Generate Promotion Ad Image**
```
POST /api/promotions/generate-ad
```
**Description:** Generate AI promotional ad image
**Body:**
```json
{
  "promotionId": "uuid",
  "template": "default" // or "minimal", "bold", etc.
}
```

**Response:**
```json
{
  "success": true,
  "image_url": "https://cloudinary.com/...",
  "promotion": {
    "name": "Summer Sale",
    "discount": "20% OFF"
  }
}
```

---

## 📊 Module 7: Analytics & Demand Forecasting

### **6. Get Performance Report**
```
GET /api/reports/performance
```
**Query Parameters:**
- `startDate`: '2025-01-01'
- `endDate`: '2025-11-06'
- `reportType`: 'daily', 'weekly', 'monthly', 'custom'

**Response:**
```json
{
  "success": true,
  "report": {
    "period": {
      "start_date": "2025-01-01",
      "end_date": "2025-11-06"
    },
    "summary": {
      "total_revenue": 45890.50,
      "total_transactions": 325,
      "avg_transaction_value": 141.20,
      "unique_customers": 85
    },
    "top_products": [
      {
        "product_id": "uuid",
        "product_name": "Milk 1L",
        "category": "Dairy",
        "units_sold": 450,
        "revenue": 1795.50
      }
    ],
    "underperforming_products": [
      {
        "product_id": "uuid",
        "product_name": "Chips (200g)",
        "units_sold": 5,
        "revenue": 17.50
      }
    ],
    "revenue_by_category": {
      "Dairy": 12500.00,
      "Snacks": 5600.00,
      "Beverages": 8900.00
    }
  }
}
```

---

### **7. Forecast Demand**
```
POST /api/analytics/forecast-demand
```
**Description:** Predict product demand for next N days
**Body:**
```json
{
  "productId": "uuid",
  "days": 30,
  "method": "moving_average" // or "arima", "prophet"
}
```

**Response:**
```json
{
  "success": true,
  "forecast": {
    "product_id": "uuid",
    "product_name": "Milk 1L",
    "current_stock": 45,
    "predictions": [
      {
        "date": "2025-11-07",
        "predicted_demand": 15,
        "confidence": 85.5
      },
      {
        "date": "2025-11-08",
        "predicted_demand": 18,
        "confidence": 84.2
      }
    ],
    "recommended_restock": 120,
    "restock_date": "2025-11-12"
  }
}
```

---

### **8. Get Forecast Report**
```
GET /api/reports/forecast
```
**Query Parameters:**
- `days`: 7, 14, 30 (default: 30)
- `category` (optional): Filter by product category

**Response:**
```json
{
  "success": true,
  "forecast_report": {
    "generated_at": "2025-11-06T10:00:00Z",
    "forecast_period": "30 days",
    "products": [
      {
        "product_name": "Milk 1L",
        "current_stock": 45,
        "predicted_demand_30d": 450,
        "stock_status": "sufficient",
        "recommended_action": "none"
      },
      {
        "product_name": "Orange Juice (1L)",
        "current_stock": 5,
        "predicted_demand_30d": 180,
        "stock_status": "critical",
        "recommended_action": "restock_urgent"
      }
    ]
  }
}
```

---

### **9. Custom Report Generation**
```
POST /api/reports/custom
```
**Body:**
```json
{
  "reportType": "sales_by_category",
  "filters": {
    "startDate": "2025-01-01",
    "endDate": "2025-11-06",
    "categories": ["Dairy", "Snacks"],
    "minRevenue": 1000,
    "tier": "GOLD"
  },
  "groupBy": "category",
  "sortBy": "revenue",
  "sortOrder": "desc"
}
```

---

### **10. Export Report**
```
GET /api/reports/export
```
**Query Parameters:**
- `reportId`: uuid (pre-generated report)
- `format`: 'pdf', 'csv', 'excel'

**Response:**
- File download or URL to download

---

## 🔔 Module 9: Notifications

### **11. Get Notifications**
```
GET /api/notifications
```
**Query Parameters:**
- `recipientType`: 'admin' or 'customer'
- `recipientId` (optional): uuid
- `isRead` (optional): true/false
- `notificationType` (optional): 'stock_alert', 'discount', 'order_update', 'security_alert'
- `priority` (optional): 'low', 'medium', 'high', 'critical'
- `limit`: 20 (default)

**Response:**
```json
{
  "success": true,
  "notifications": [
    {
      "id": "uuid",
      "notification_type": "stock_alert",
      "title": "Low Stock Alert: Milk 1L",
      "message": "Product 'Milk 1L' is running low (15 units remaining)",
      "priority": "medium",
      "is_read": false,
      "action_url": "/admin/products",
      "metadata": {
        "product_id": "uuid",
        "current_stock": 15,
        "threshold": 20
      },
      "created_at": "2025-11-06T09:30:00Z"
    }
  ],
  "unread_count": 8
}
```

---

### **12. Mark Notification as Read**
```
PUT /api/notifications/:id
```
**Body:**
```json
{
  "is_read": true
}
```

---

### **13. Create Notification**
```
POST /api/notifications
```
**Body:**
```json
{
  "recipient_type": "customer",
  "recipient_id": "uuid",
  "notification_type": "discount",
  "title": "Special Offer Just for You!",
  "message": "You have a new 15% discount available for Gold members",
  "priority": "medium",
  "action_url": "/promotions",
  "metadata": {
    "promotion_id": "uuid",
    "discount_percentage": 15
  }
}
```

---

### **14. Get Stock Alerts**
```
GET /api/notifications/stock-alerts
```
**Query Parameters:**
- `status`: 'pending', 'acknowledged', 'resolved'
- `alertType`: 'out_of_stock', 'low_stock', 'restock_needed'

**Response:**
```json
{
  "success": true,
  "stock_alerts": [
    {
      "id": "uuid",
      "product_id": "uuid",
      "product_name": "Chips (200g)",
      "alert_type": "out_of_stock",
      "current_stock": 0,
      "threshold_stock": 25,
      "status": "pending",
      "created_at": "2025-11-06T08:00:00Z"
    }
  ]
}
```

---

### **15. Acknowledge Stock Alert**
```
PUT /api/notifications/stock-alerts/:id
```
**Body:**
```json
{
  "status": "acknowledged",
  "admin_id": "uuid"
}
```

---

### **16. Broadcast Notification**
```
POST /api/notifications/broadcast
```
**Description:** Send notification to all customers or specific tier
**Body:**
```json
{
  "target": {
    "type": "tier", // or "all"
    "tier": "GOLD" // optional if type is "tier"
  },
  "notification": {
    "notification_type": "promotion",
    "title": "Exclusive Gold Member Sale!",
    "message": "Get 20% off all items this weekend",
    "priority": "medium",
    "action_url": "/promotions/weekend-sale"
  }
}
```

---

## 🔄 Additional Utility APIs

### **17. Update Customer Tier (Manual)**
```
PUT /api/customers/:id/tier
```
**Body:**
```json
{
  "tier": "PLATINUM"
}
```

---

### **18. Get Tier Configuration**
```
GET /api/tier-config
```
**Response:**
```json
{
  "success": true,
  "tiers": [
    {
      "tier_name": "BRONZE",
      "min_monthly_spending": 0,
      "discount_percentage": 5,
      "benefits": "Basic tier: 5% discount on all purchases"
    }
  ]
}
```

---

### **19. Record Transaction**
```
POST /api/transactions
```
**Description:** Record new purchase (called after checkout)
**Body:**
```json
{
  "customer_id": "uuid",
  "items": [
    {
      "product_id": "uuid",
      "quantity": 2,
      "unit_price": 3.99
    }
  ],
  "payment_method": "card",
  "promo_code": "WELCOME10"
}
```

**Response:**
```json
{
  "success": true,
  "transaction": {
    "id": "uuid",
    "total_amount": 150.00,
    "discount_applied": 22.50,
    "final_amount": 127.50,
    "payment_status": "completed"
  },
  "customer": {
    "new_tier": "GOLD",
    "tier_upgraded": true
  }
}
```

---

### **20. Update Product Stock**
```
PUT /api/products/:id/stock
```
**Body:**
```json
{
  "current_stock": 50,
  "action": "set" // or "increment", "decrement"
}
```

**Note:** This will automatically trigger stock alert notifications if thresholds are crossed.

---

## 📝 Implementation Priority

### **Phase 1: Notifications (Days 1-3)**
- API 11, 12, 13 (Basic notifications)
- API 14, 15 (Stock alerts)
- API 16 (Broadcast)

### **Phase 2: Promotions (Days 4-7)**
- API 2, 3, 4 (Promotions CRUD)
- API 1 (Customer segmentation)
- API 5 (Ad generation)

### **Phase 3: Analytics (Days 8-14)**
- API 6, 8 (Performance reports)
- API 7 (Demand forecasting - simple method)
- API 9, 10 (Custom reports & export)

---

## 🚀 Quick Start Commands

After setting up database:

```bash
# Install dependencies (if needed)
npm install

# Run seeding script
node scripts/seed-database.js

# Start development server
npm run dev

# Test APIs with sample data
# All endpoints will return real data from database
```

All APIs will be dynamic - fetching from Supabase in real-time!
