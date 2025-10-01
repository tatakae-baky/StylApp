import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import "react-lazy-load-image-component/src/effects/blur.css";

const FeaturedBrands = ({ featuredBrands, onBrandClick }) => {
  const navigate = useNavigate();
  
  if (!featuredBrands || featuredBrands.length === 0) {
    return (
      <div className="featured-brands-empty">
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-1">No Featured Brands</h3>
          <p className="text-sm text-gray-500">Featured brands will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="featured-brands-container">
      {/* Section Header with View All button on right */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Featured Brands</h3>
          <p className="text-sm text-gray-600">Discover our handpicked selection of premium brands</p>
        </div>
        <button
          className="inline-flex items-center px-4 h-[36px] !bg-black !text-white !rounded-none !font-medium !text-[14px] hover:!bg-gray-800 hover:!text-white transition-all"
          onClick={() => navigate('/brands')}
        >
          View All Brands
        </button>
      </div>

      {/* Featured Brands Grid: 6 per row, total 18 */}
      <div className="featured-brands-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {featuredBrands.slice(0, 18).map((brand) => (
          <div
            key={brand._id}
            className="featured-brand-card cursor-pointer"
            onClick={() => onBrandClick(brand)}
            title={`View ${brand.name}`}
          >
            <div className="bg-white border border-gray-200 p-4 h-full">
              {/* Brand Logo Only */}
              <div className="w-full h-20 flex items-center justify-center">
                {brand.images?.[0] ? (
                  <LazyLoadImage
                    src={brand.images[0]}
                    alt={brand.name}
                    className="max-h-12 w-auto object-contain"
                    effect="blur"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                    <span className="text-gray-400 text-xs font-medium">
                      {brand.name?.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedBrands;
