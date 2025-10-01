/**
 * Brand Delivery Helper - Calculate delivery charges per brand
 * Each brand charges separately for delivery (80 BDT for Dhaka, 120 BDT for outside Dhaka)
 */

import { calculateShippingCharge } from './shipping';
import { fetchDataFromApi } from './api';

/**
 * Groups cart items by brand and calculates delivery charges for each brand
 * @param {Array} cartItems - Array of cart items with brand information
 * @param {string} city - Delivery city for shipping calculation
 * @returns {Object} - Contains grouped items by brand and total delivery charges
 */
export const calculateBrandDeliveryCharges = async (cartItems, city) => {
  try {
    const brandGroups = {};
    const deliveryChargePerBrand = calculateShippingCharge(city);
    
    // Group items by brand
    for (const item of cartItems) {
      // For cart items, brand is typically stored as a string name
      // Use brandId if available, otherwise use brand string
      let brandId = item.brandId || item.brand || 'unknown';
      let brandName = item.brandName || item.brand || 'Unknown Brand';
      
      // If brand is an object, extract id and name
      if (typeof item.brand === 'object' && item.brand) {
        brandId = item.brand._id || item.brand.id || brandId;
        brandName = item.brand.name || brandName;
      }
      
      // Ensure brandId is a string for consistency
      brandId = String(brandId);
      
      if (!brandGroups[brandId]) {
        brandGroups[brandId] = {
          brandId,
          brandName,
          items: [],
          subtotal: 0,
          deliveryCharge: deliveryChargePerBrand,
          total: 0
        };
      }
      
      brandGroups[brandId].items.push(item);
      brandGroups[brandId].subtotal += item.price * item.quantity;
    }
    
    // Calculate totals for each brand
    Object.values(brandGroups).forEach(brand => {
      brand.total = brand.subtotal + brand.deliveryCharge;
    });
    
    const brandsArray = Object.values(brandGroups);
    const totalDeliveryCharges = brandsArray.length * deliveryChargePerBrand;
    const totalSubtotal = brandsArray.reduce((sum, brand) => sum + brand.subtotal, 0);
    const grandTotal = totalSubtotal + totalDeliveryCharges;
    
    return {
      brandGroups: brandsArray,
      totalDeliveryCharges,
      totalSubtotal,
      grandTotal,
      numberOfBrands: brandsArray.length,
      deliveryChargePerBrand
    };
  } catch (error) {
    console.error('Error calculating brand delivery charges:', error);
    return {
      brandGroups: [],
      totalDeliveryCharges: 0,
      totalSubtotal: 0,
      grandTotal: 0,
      numberOfBrands: 0,
      deliveryChargePerBrand: 0
    };
  }
};

/**
 * Get expected delivery date (3 days from current date)
 * @returns {string} - Formatted delivery date
 */
export const getExpectedDeliveryDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  return date.toLocaleDateString('en-BD', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Get delivery date range (current date to 3 days from now)
 * @returns {string} - Formatted delivery date range
 */
export const getDeliveryDateRange = () => {
  const today = new Date();
  const deliveryDate = new Date();
  deliveryDate.setDate(today.getDate() + 3);
  
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return `${formatDate(today)} - ${formatDate(deliveryDate)}`;
};

/**
 * Format delivery summary for display
 * @param {Object} deliveryData - Data from calculateBrandDeliveryCharges
 * @param {string} city - Delivery city
 * @returns {Object} - Formatted display data
 */
export const formatDeliveryDisplay = (deliveryData, city) => {
  const { numberOfBrands, deliveryChargePerBrand } = deliveryData;
  const isInsideDhaka = city && city.trim() === "Dhaka";
  const location = isInsideDhaka ? "Inside Dhaka" : "Outside Dhaka";
  
  return {
    numberOfBrands,
    deliveryChargePerBrand,
    location,
    deliveryDescription: numberOfBrands > 1 
      ? `${numberOfBrands} brands × Tk ${deliveryChargePerBrand} (${location})`
      : `1 brand × ৳${deliveryChargePerBrand} (${location})`,
    expectedDelivery: getExpectedDeliveryDate()
  };
};
