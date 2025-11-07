import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// POST: Calculate discount for a customer's cart
export async function POST(request) {
  try {
    const body = await request.json();
    const { customerId, cartTotal, promoCode } = body;

    if (!customerId || !cartTotal) {
      return NextResponse.json(
        { success: false, error: 'Customer ID and cart total required' },
        { status: 400 }
      );
    }

    // Get customer info (tier)
    const { data: customer, error: customerError } = await supabase
      .from('Customer')
      .select('customer_tier')
      .eq('id', customerId)
      .single();

    if (customerError) throw customerError;

    const customerTier = customer?.customer_tier || 'BRONZE';

    // Get tier configuration discount
    const { data: tierConfig, error: tierError } = await supabase
      .from('TierConfig')
      .select('*')
      .eq('tier_name', customerTier)
      .single();

    if (tierError) throw tierError;

    let discounts = [];
    let totalDiscount = 0;

    // 1. Apply tier discount
    if (tierConfig) {
      const tierDiscount = (cartTotal * tierConfig.discount_percentage) / 100;
      discounts.push({
        type: 'tier',
        name: `${tierConfig.tier_name} Tier Discount`,
        percentage: tierConfig.discount_percentage,
        amount: tierDiscount
      });
      totalDiscount += tierDiscount;
    }

    // 2. Apply promo code discount (if provided)
    if (promoCode) {
      const { data: promotion, error: promoError } = await supabase
        .from('Promotion')
        .select('*')
        .eq('code', promoCode)
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString())
        .single();

      if (!promoError && promotion) {
        // Check if promo is valid for this tier
        if (!promotion.target_tier || promotion.target_tier === customerTier) {
          // Check minimum purchase amount
          if (!promotion.min_purchase_amount || cartTotal >= promotion.min_purchase_amount) {
            // Check usage limit
            if (!promotion.usage_limit || promotion.usage_count < promotion.usage_limit) {
              let promoDiscount = 0;
              
              if (promotion.discount_type === 'percentage') {
                promoDiscount = (cartTotal * promotion.discount_value) / 100;
              } else if (promotion.discount_type === 'fixed_amount') {
                promoDiscount = promotion.discount_value;
              }

              // Apply max discount cap if set
              if (promotion.max_discount_amount && promoDiscount > promotion.max_discount_amount) {
                promoDiscount = promotion.max_discount_amount;
              }

              discounts.push({
                type: 'promo',
                name: promotion.name,
                code: promotion.code,
                percentage: promotion.discount_type === 'percentage' ? promotion.discount_value : null,
                amount: promoDiscount,
                promotionId: promotion.id
              });
              totalDiscount += promoDiscount;
            } else {
              return NextResponse.json({
                success: false,
                error: 'Promo code usage limit reached'
              });
            }
          } else {
            return NextResponse.json({
              success: false,
              error: `Minimum purchase of $${promotion.min_purchase_amount} required`
            });
          }
        } else {
          return NextResponse.json({
            success: false,
            error: `This promo is only for ${promotion.target_tier} tier customers`
          });
        }
      } else {
        return NextResponse.json({
          success: false,
          error: 'Invalid or expired promo code'
        });
      }
    }

    // Calculate final amount
    const finalAmount = Math.max(0, cartTotal - totalDiscount);

    return NextResponse.json({
      success: true,
      calculation: {
        cartTotal,
        customerTier,
        discounts,
        totalDiscount: parseFloat(totalDiscount.toFixed(2)),
        finalAmount: parseFloat(finalAmount.toFixed(2)),
        savings: parseFloat(totalDiscount.toFixed(2))
      }
    });
  } catch (error) {
    console.error('Error calculating discount:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
