/**
 * Currency utility functions for Bangladesh market
 * Converts all currency displays from INR to BDT
 */

/**
 * Format amount in Bangladeshi Taka using locale formatting
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'Tk 0';
  
  try {
    return amount?.toLocaleString('en-BD', { 
      style: 'currency', 
      currency: 'BDT',
      currencyDisplay: 'symbol'
    });
  } catch (error) {
    // Fallback if locale formatting fails
    return `Tk ${amount?.toLocaleString('en-BD')}`;
  }
};

/**
 * Format amount with manual Tk symbol (for better control)
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string with Tk symbol
 */
export const formatCurrencyBD = (amount) => {
  if (!amount && amount !== 0) return 'Tk 0';
  
  return `Tk ${amount?.toLocaleString('en-BD')}`;
};

/**
 * Format amount for display in components (most commonly used)
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export const displayPrice = (amount) => {
  return formatCurrencyBD(amount);
};

/**
 * Parse currency string back to number (for calculations)
 * @param {string} currencyString - Currency string like "Tk 1,500"
 * @returns {number} Numeric value
 */
export const parseCurrency = (currencyString) => {
  if (!currencyString) return 0;
  
  // Remove Tk symbol and commas, then parse
  const cleanString = currencyString.replace(/[Tk,\s]/g, '');
  return parseFloat(cleanString) || 0;
};

/**
 * Convert INR to BDT (if needed for migration)
 * Current approximate rate: 1 INR = 1.05 BDT
 * @param {number} inrAmount - Amount in INR
 * @returns {number} Amount in BDT
 */
export const convertINRtoBDT = (inrAmount) => {
  const exchangeRate = 1.05; // Update this rate as needed
  return Math.round(inrAmount * exchangeRate);
};

// Export all functions as default object as well
export default {
  formatCurrency,
  formatCurrencyBD,
  displayPrice,
  parseCurrency,
  convertINRtoBDT
};
