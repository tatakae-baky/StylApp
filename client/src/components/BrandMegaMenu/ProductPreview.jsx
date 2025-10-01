import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import "react-lazy-load-image-component/src/effects/blur.css";
import ProductItem from "../ProductItem";

const ProductPreview = ({ brand, products, loading }) => {
  const navigate = useNavigate();
  const scale = 0.85;
  const scaledRefs = useRef({});

  useEffect(() => {
    const wrappers = Object.values(scaledRefs.current || {});
    const observers = [];

    wrappers.forEach((wrapper) => {
      if (!wrapper) return;
      const inner = wrapper.querySelector('.scaled-card-inner');
      if (!inner) return;

      const applyHeight = () => {
        const rawHeight = inner.offsetHeight || 0; // unscaled height
        wrapper.style.height = `${rawHeight * scale}px`;
      };

      applyHeight();
      const ro = new ResizeObserver(applyHeight);
      ro.observe(inner);
      observers.push(ro);
    });

    const handleResize = () => {
      wrappers.forEach((wrapper) => {
        const inner = wrapper?.querySelector('.scaled-card-inner');
        if (!inner) return;
        const rawHeight = inner.offsetHeight || 0;
        wrapper.style.height = `${rawHeight * scale}px`;
      });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      observers.forEach((o) => o.disconnect());
      window.removeEventListener('resize', handleResize);
    };
  }, [products]);
  
  if (loading) {
    return (
      <div className="product-preview-loading">
        <div className="mb-4">
          <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-32 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="product-preview-container">
        {/* Section Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {brand?.name} Products
              </h3>
              <p className="text-sm text-gray-600">
                Browse products from {brand?.name}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Brand Logo */}
              {brand?.images?.[0] && (
                <div className="flex-shrink-0">
                  <LazyLoadImage
                    src={brand.images[0]}
                    alt={brand.name}
                    className="w-12 h-12 object-contain rounded-lg"
                    effect="blur"
                    loading="lazy"
                  />
                </div>
              )}
              
              {/* View All Products Button */}
              <button
                className="inline-flex items-center px-4 h-[36px] !bg-black !text-white !rounded-none !font-medium !text-[14px] hover:!bg-red-800 hover:!text-white transition-all"
                onClick={() => navigate(`/brand/${brand?.slug}`)}
              >
                View All {brand?.name} Products
              </button>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-600 mb-1">No Products Available</h4>
          <p className="text-sm text-gray-500 mb-4">Products from this brand will appear here</p>
          <button 
            className="inline-flex items-center px-4 h-[36px] !bg-black !text-white !rounded-none !font-medium !text-[14px] hover:!bg-red-800 hover:!text-white transition-all"
            onClick={() => navigate(`/brand/${brand?.slug}`)}
          >
            Visit Brand Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-preview-container">
      {/* Section Header */}
      <div className="">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {brand?.name} Products
            </h3>
            <p className="text-sm text-gray-600">
              Showing {products.length} featured products
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Brand Logo */}
            {brand?.images?.[0] && (
              <div className="flex-shrink-0">
                <LazyLoadImage
                  src={brand.images[0]}
                  alt={brand.name}
                  className="w-12 h-12 object-contain rounded-lg"
                  effect="blur"
                  loading="lazy"
                />
              </div>
            )}
            
            {/* View All Products Button */}
            <button
              className="inline-flex items-center px-4 h-[36px] !bg-black !text-white !rounded-none !font-medium !text-[14px] hover:!bg-red-800 hover:!text-white transition-all"
              onClick={() => navigate(`/brand/${brand?.slug}`)}
            >
              View All {brand?.name} Products
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid - scaled visually, wrapper height matches scaled height */}
      <div className="products-grid grid grid-cols-3 gap-1">
        {products.slice(0, 3).map((product) => (
          <div
            key={product._id}
            className="scaled-card-wrapper overflow-hidden"
            ref={(el) => { if (el) scaledRefs.current[product._id] = el; }}
          >
            <div
              className="scaled-card-inner transform-gpu"
              style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
            >
              <ProductItem item={product} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductPreview;
