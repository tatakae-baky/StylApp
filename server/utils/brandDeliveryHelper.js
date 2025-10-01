/**
 * Server-side Brand Delivery Helper
 * Calculate delivery charges per brand for multi-brand orders
 */

import ProductModel from '../models/product.modal.js';

/**
 * Calculate shipping charge based on city
 * @param {string} city - Delivery city
 * @returns {number} - Shipping charge amount
 */
export const calculateShippingCharge = (city) => {
  if (!city) return 120; // Default to outside Dhaka
  return city.trim() === "Dhaka" ? 80 : 120;
};

/**
 * Group order products by brand and calculate delivery charges
 * @param {Array} products - Array of products in the order
 * @param {string} city - Delivery city
 * @returns {Object} - Brand groups and total delivery charges
 */
export const calculateBrandDeliveryCharges = async (products, city) => {
  try {
    const brandGroups = {};
    const deliveryChargePerBrand = calculateShippingCharge(city);
    
    // Group products by brand
    for (const product of products) {
      let brandId = 'unknown';
      let brandName = 'Unknown Brand';
      
      // Try to get brand information from the product
      try {
        const productDetails = await ProductModel.findById(product.productId).populate('brand');
        if (productDetails && productDetails.brand) {
          if (typeof productDetails.brand === 'object') {
            brandId = productDetails.brand._id.toString();
            brandName = productDetails.brand.name;
          } else {
            brandId = productDetails.brand.toString();
            brandName = product.brand || 'Unknown Brand';
          }
        } else {
          // Fallback to product.brand if available
          brandId = product.brandId || product.brand || 'unknown';
          brandName = product.brandName || product.brand || 'Unknown Brand';
        }
      } catch (error) {
        console.log('Error fetching product brand details:', error);
        brandId = product.brandId || product.brand || 'unknown';
        brandName = product.brandName || product.brand || 'Unknown Brand';
      }
      
      // Ensure brandId is a string
      brandId = String(brandId);
      
      if (!brandGroups[brandId]) {
        brandGroups[brandId] = {
          brandId,
          brandName,
          products: [],
          subtotal: 0,
          deliveryCharge: deliveryChargePerBrand,
          total: 0
        };
      }
      
      brandGroups[brandId].products.push(product);
      brandGroups[brandId].subtotal += product.subTotal || (product.price * product.quantity);
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
