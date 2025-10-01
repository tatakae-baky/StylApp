import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchDataFromApi } from "../../utils/api";

/**
 * Hidden Gem Brands Section Component
 * Displays handpicked hidden gem brands in a grid layout with one large banner and four smaller cards
 * Fetches data from backend API and handles loading, error, and empty states
 */
const HiddenGemBrandsSection = () => {
  const [hiddenGemBrands, setHiddenGemBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHiddenGemBrands();
  }, []);

  /**
   * Fetch hidden gem brands from the API
   * Handles API response and sets appropriate state
   */
  const fetchHiddenGemBrands = async () => {
    try {
      setLoading(true);
      const response = await fetchDataFromApi("/api/hiddenGemBrands/active");
      
      if (response.success) {
        setHiddenGemBrands(response.data || []);
      } else {
        setError("Failed to fetch hidden gem brands");
      }
    } catch (error) {
      console.error("Error fetching hidden gem brands:", error);
      setError("Failed to load hidden gem brands");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="bg-white py-3 lg:py-8 pt-2 lg:pt-2">
        <div className="container">
          {/* Section Header */}
          <div className="mb-1">
            <h2 className="text-[20px] lg:text-[24px] font-bold text-gray-900 uppercase">HIDDEN GEM BRANDS</h2>
            <p className="text-[12px] lg:text-[14px] text-gray-600 font-[400] uppercase tracking-wider mt-0.5">HANDPICKED BY STYL'</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
            <div className="lg:col-span-6 bg-gray-200 animate-pulse"></div>
            <div className="lg:col-span-6">
              <div className="grid grid-cols-2 grid-rows-2 h-full gap-0">
                <div className="bg-gray-200 animate-pulse"></div>
                <div className="bg-gray-200 animate-pulse"></div>
                <div className="bg-gray-200 animate-pulse"></div>
                <div className="bg-gray-200 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-white py-3 lg:py-8">
        <div className="container">
          {/* Section Header */}
          <div className="mb-1">
            <h2 className="text-[20px] lg:text-[24px] font-bold text-gray-900 uppercase">HIDDEN GEM BRANDS</h2>
            <p className="text-[12px] lg:text-[14px] text-gray-600 font-[400] uppercase tracking-wider mt-0.5">HANDPICKED BY STYL'</p>
          </div>
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (hiddenGemBrands.length === 0) {
    return (
      <section className="bg-white py-3 lg:py-8">
        <div className="container">
          {/* Section Header */}
          <div className="mb-1">
            <h2 className="text-[20px] lg:text-[24px] font-bold text-gray-900 uppercase">HIDDEN GEM BRANDS</h2>
            <p className="text-[14px] text-gray-600 font-[400] uppercase tracking-wider mt-0.5">HANDPICKED BY STYL'</p>
          </div>
          <div className="text-center py-8">
            <p className="text-gray-500">No hidden gem brands available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  // Separate large and small position brands
  const largeBannerBrand = hiddenGemBrands.find(brand => brand.position === 'large');
  const smallCardBrands = hiddenGemBrands.filter(brand => brand.position === 'small').slice(0, 4);

  return (
    <section className="bg-white py-3 lg:py-8">
      <div className="container">
        {/* Section Header */}
        <div className="mb-1">
          <h2 className="text-[20px] lg:text-[24px] font-bold text-gray-900 uppercase">HIDDEN GEM BRANDS</h2>
          <p className="text-[12px] lg:text-[14px] text-gray-600 font-[400] uppercase tracking-wider mt-0.5">HANDPICKED BY STYL'</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
          {/* Left large banner */}
          <div className="lg:col-span-6">
            {largeBannerBrand ? (
              <Link
                to={`/products?brand=${largeBannerBrand.brandId?.slug || largeBannerBrand.brandId?.name?.toLowerCase().replace(/\s+/g, '-')}`}
                className="group block relative bg-gradient-to-r from-amber-900 to-amber-700 overflow-hidden h-full"
              >
                <img
                  src={largeBannerBrand.image}
                  alt={largeBannerBrand.brandName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300"></div>
                <div className="absolute inset-0 flex flex-col justify-center p-6 lg:p-8 text-white">
                  <div className="max-w-md absolute bottom-3 text-white">
                    <p className="text-base font-semibold">{largeBannerBrand.brandName}</p>
                    <p>Handpicked by Styl'</p>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="h-full bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500">No large banner brand configured</p>
              </div>
            )}
          </div>

          {/* Right grid of smaller banners */}
          <div className="lg:col-span-6">
            <div className="grid grid-cols-2 grid-rows-2 h-full gap-0">
              {Array.from({ length: 4 }).map((_, index) => {
                const brand = smallCardBrands[index];
                
                if (!brand) {
                  return (
                    <div key={index} className="h-full bg-gray-200 flex items-center justify-center">
                      <p className="text-gray-500">No brand</p>
                    </div>
                  );
                }

                return (
                  <Link
                    key={brand._id}
                    to={`/products?brand=${brand.brandId?.slug || brand.brandId?.name?.toLowerCase().replace(/\s+/g, '-')}`}
                    className="group block relative bg-amber-100 overflow-hidden h-full"
                  >
                    <img
                      src={brand.image}
                      alt={brand.brandName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300"></div>
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="font-semibold text-base mb-1">{brand.brandName}</h3>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HiddenGemBrandsSection;
