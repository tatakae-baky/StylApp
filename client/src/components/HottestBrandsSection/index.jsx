import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchDataFromApi } from "../../utils/api";

const HottestBrandsSection = () => {
  const [hottestBrands, setHottestBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHottestBrands();
  }, []);

  const fetchHottestBrands = async () => {
    try {
      setLoading(true);
      const response = await fetchDataFromApi("/api/hottestBrandOffers/active");
      
      if (response.success) {
        setHottestBrands(response.data || []);
      } else {
        setError("Failed to fetch hottest brand offers");
      }
    } catch (error) {
      console.error("Error fetching hottest brand offers:", error);
      setError("Failed to load hottest brand offers");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="bg-white py-3 lg:py-8">
        <div className="container">
          <div className="mb-1">
            <h2 className="text-[20px] lg:text-[24px] font-bold text-gray-900 uppercase">HOTTEST BRANDS ON OFFER</h2>
            <p className="text-[12px] lg:text-[14px] text-gray-600 font-[400] uppercase tracking-wider mt-0.5">IN THE SPOTLIGHT</p>
          </div>
          <div className="text-center py-8">
            <p>Loading hottest brand offers...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-white py-3 lg:py-8">
        <div className="container">
          <div className="mb-1">
            <h2 className="text-[20px] lg:text-[24px] font-bold text-gray-900 uppercase">HOTTEST BRANDS ON OFFER</h2>
            <p className="text-[12px] lg:text-[14px] text-gray-600 font-[400] uppercase tracking-wider mt-0.5">IN THE SPOTLIGHT</p>
          </div>
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (hottestBrands.length === 0) {
    return (
      <section className="bg-white py-3 lg:py-8">
        <div className="container">
          <div className="mb-1">
            <h2 className="text-[20px] lg:text-[24px] font-bold text-gray-900 uppercase">HOTTEST BRANDS ON OFFER</h2>
            <p className="text-[12px] lg:text-[14px] text-gray-600 font-[400] uppercase tracking-wider mt-0.5">IN THE SPOTLIGHT</p>
          </div>
          <div className="text-center py-8">
            <p className="text-gray-500">No hottest brand offers available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-3 lg:py-8">
      <div className="container">
        <div className="mb-1">
          <h2 className="text-[20px] lg:text-[24px] font-bold text-gray-900 uppercase">HOTTEST BRANDS ON OFFER</h2>
          <p className="text-[12px] lg:text-[14px] text-gray-600 font-[400] uppercase tracking-wider mt-0.5">IN THE SPOTLIGHT</p>
        </div>

        {/* Mobile: Grid layout with 5 cards per row and horizontal scrolling */}
        <div className="md:hidden">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="grid grid-cols-5 gap-4 w-max min-w-full">
              {hottestBrands.map((brand, index) => (
                <Link 
                  key={brand._id} 
                  to={`/products?brand=${brand.brandId?.slug || brand.brandId?.name?.toLowerCase().replace(/\s+/g, '-')}`}
                  className="group block bg-white overflow-hidden w-36"
                >
                  {/* Image container - no overlay text */}
                  <div className="relative overflow-hidden mb-1 aspect-square">
                    <img
                      src={brand.image}
                      alt={`${brand.brandId?.name || 'Brand'} offer`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  
                  {/* Text content below image */}
                  <div className="px-1">
                    <h3 className="text-[16px] font-[600] text-black leading-tight">
                      {brand.discount}
                    </h3>
                    <p className="text-[12px] text-gray-600 font-[400] leading-tight mt-1">
                      {brand.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop: Grid layout */}
        <div className="hidden md:grid grid-cols-3 lg:grid-cols-5 gap-4">
          {hottestBrands.map((brand, index) => (
            <Link 
              key={brand._id} 
              to={`/products?brand=${brand.brandId?.slug || brand.brandId?.name?.toLowerCase().replace(/\s+/g, '-')}`}
              className="group block bg-white overflow-hidden"
            >
              {/* Image container - no overlay text */}
              <div className="relative overflow-hidden mb-1">
                <img
                  src={brand.image}
                  alt={`${brand.brandId?.name || 'Brand'} offer`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              
              {/* Text content below image */}
              <div className="px-1">
                <h3 className="text-[16px] lg:text-[18px] font-[600] text-black leading-tight">
                  {brand.discount}
                </h3>
                <p className="text-[14px] text-gray-600 font-[400] leading-tight mt-1">
                  {brand.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HottestBrandsSection;
