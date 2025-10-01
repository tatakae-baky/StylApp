/**
 * Shipping charge calculation utility for Bangladesh delivery
 * 
 * Delivery Charges:
 * - Inside Dhaka: 80 Tk
 * - Outside Dhaka: 120 Tk
 */

export const calculateShippingCharge = (city) => {
  if (!city) return 120; // Default to outside Dhaka if no city provided
  
  const dhakaCity = "Dhaka";
  const normalizedCity = city.trim();
  
  return normalizedCity === dhakaCity ? 80 : 120;
};

export const getShippingInfo = (city) => {
  const charge = calculateShippingCharge(city);
  const isDhaka = city && city.trim() === "Dhaka";
  
  return {
    charge,
    isDhaka,
    location: isDhaka ? "Inside Dhaka" : "Outside Dhaka"
  };
};

// Shipping charge constants for consistency
export const SHIPPING_CHARGES = {
  DHAKA: 80,
  OUTSIDE_DHAKA: 120
};
