import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDataFromApi } from '../../utils/api';
import { debounce, apiCache, observePerformance } from './utils';
import BrandList from './BrandList';
import FeaturedBrands from './FeaturedBrands';
import ProductPreview from './ProductPreview';
import './BrandMegaMenu.css';

const BrandMegaMenu = () => {
  const navigate = useNavigate();
  
  // State management for megamenu data
  const [brands, setBrands] = useState([]);
  const [featuredBrands, setFeaturedBrands] = useState([]);
  const [brandsByLetter, setBrandsByLetter] = useState([]);
  const [productsByBrand, setProductsByBrand] = useState({});
  const [hoveredBrand, setHoveredBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Initialize data on component mount
  useEffect(() => {
    initializeMegaMenuData();
  }, []);

  // Cleanup function to prevent memory leaks
  useEffect(() => {
    return () => {
      // Clear cache on unmount if needed
      if (window.location.pathname !== '/') {
        apiCache.clear();
      }
    };
  }, []);

  const initializeMegaMenuData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cachedBrands = apiCache.get('all-brands');
      const cachedFeatured = apiCache.get('featured-brands');

      if (cachedBrands && cachedFeatured) {
        setBrands(cachedBrands);
        setFeaturedBrands(cachedFeatured);
        const grouped = groupBrandsByLetter(cachedBrands);
        setBrandsByLetter(grouped);
        setLoading(false);
        return;
      }

      // Performance mark start
      performance.mark('brand-megamenu-fetch-start');

      // Fetch all brands and featured brands in parallel
      const [allBrandsRes, featuredBrandsRes] = await Promise.all([
        fetchDataFromApi('/api/brand/get?isActive=true'),
        fetchDataFromApi('/api/brand/get?isActive=true&isFeatured=true')
      ]);

      // Performance mark end
      performance.mark('brand-megamenu-fetch-end');
      performance.measure('brand-megamenu-fetch', 'brand-megamenu-fetch-start', 'brand-megamenu-fetch-end');

      if (allBrandsRes?.error === false && allBrandsRes?.brands) {
        setBrands(allBrandsRes.brands);
        apiCache.set('all-brands', allBrandsRes.brands);
        
        // Group brands by letter for alphabetical organization
        const grouped = groupBrandsByLetter(allBrandsRes.brands);
        setBrandsByLetter(grouped);
      }

      if (featuredBrandsRes?.error === false && featuredBrandsRes?.brands) {
        setFeaturedBrands(featuredBrandsRes.brands);
        apiCache.set('featured-brands', featuredBrandsRes.brands);
      }

    } catch (err) {
      console.error('Error fetching megamenu data:', err);
      setError('Failed to load brand data');
    } finally {
      setLoading(false);
    }
  };

  // Group brands alphabetically
  const groupBrandsByLetter = (brandsArray) => {
    const grouped = brandsArray.reduce((acc, brand) => {
      const firstLetter = brand.name.charAt(0).toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(brand);
      return acc;
    }, {});

    // Convert to array and sort
    return Object.keys(grouped)
      .sort()
      .map(letter => ({
        letter,
        brands: grouped[letter].sort((a, b) => a.name.localeCompare(b.name))
      }));
  };

  // Handle brand hover for product preview with optimized debouncing
  const debouncedBrandHover = useCallback(
    debounce(async (brand) => {
      if (!brand) {
        setHoveredBrand(null);
        return;
      }

      setHoveredBrand(brand);
      
      // Check cache first
      const cacheKey = `brand-products-${brand._id}`;
      const cachedProducts = apiCache.get(cacheKey);
      
      if (cachedProducts) {
        setProductsByBrand(prev => ({
          ...prev,
          [brand._id]: cachedProducts
        }));
        return;
      }
      
      // Fetch products for this brand if not already cached
      if (!productsByBrand[brand._id]) {
        try {
          performance.mark(`brand-products-fetch-start-${brand._id}`);
          
          const productsRes = await fetchDataFromApi(
            `/api/brand/${brand._id}/products?page=1&perPage=3`
          );
          
          performance.mark(`brand-products-fetch-end-${brand._id}`);
          performance.measure(
            `brand-products-fetch-${brand._id}`, 
            `brand-products-fetch-start-${brand._id}`, 
            `brand-products-fetch-end-${brand._id}`
          );
          
          if (productsRes?.error === false && productsRes?.products) {
            const products = productsRes.products;
            apiCache.set(cacheKey, products);
            setProductsByBrand(prev => ({
              ...prev,
              [brand._id]: products
            }));
          }
        } catch (err) {
          console.error('Error fetching brand products:', err);
        }
      }
    }, 250), 
    [productsByBrand]
  );

  const handleBrandHover = (brand) => {
    debouncedBrandHover(brand);
  };

  // Handle brand click navigation
  const handleBrandClick = (brand) => {
    navigate(`/brand/${brand.slug}`);
  };

  // Reset to default state with optimized debouncing
  const debouncedMouseLeave = useCallback(
    debounce(() => {
      setHoveredBrand(null);
    }, 150),
    []
  );

  const handleMouseLeave = () => {
    debouncedMouseLeave();
  };



  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsMenuOpen(true)}
      onMouseLeave={() => setIsMenuOpen(false)}
    >
      {/* Dropdown trigger button */}
      <button 
        type="button"
        className="flex items-center w-full text-[#242424] font-medium hover:text-[#FF2E4D] focus:outline-none focus:text-[#FF2E4D] transition-colors duration-200 text-[14px] py-3 px-0"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-haspopup="menu"
        aria-expanded={isMenuOpen}
        aria-label="Brand Menu"
      >
        Brands
      </button>

      {/* Dropdown menu content */}
      <div 
        className={`absolute top-[103%] left-0 min-w-[1100px] bg-white shadow-2xl py-4 px-4 border-b border-e border-gray-200 z-50 transition-all duration-200 ease-in-out ${
          isMenuOpen 
            ? 'opacity-100 visible transform translate-y-0' 
            : 'opacity-0 invisible transform -translate-y-2'
        }`}
        role="menu"
        aria-orientation="vertical"
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex flex-col sm:flex-row min-h-[400px]">
          
          {/* Left Panel - Brand Navigation */}
          <div className="hidden sm:block border-e border-gray-200 pr-4">
            {loading && brandsByLetter.length === 0 ? (
              <div className="brand-list-loading">
                {/* Featured Brands Header Skeleton */}
                <div className="mb-4">
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
                {/* Brand List Skeleton */}
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                      <div className="space-y-1 ml-2">
                        <div className="h-3 bg-gray-100 rounded w-5/6"></div>
                        <div className="h-3 bg-gray-100 rounded w-4/6"></div>
                        <div className="h-3 bg-gray-100 rounded w-3/6"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <BrandList 
                brandsByLetter={brandsByLetter}
                hoveredBrand={hoveredBrand}
                onBrandHover={handleBrandHover}
                onBrandClick={handleBrandClick}
              />
            )}
          </div>

          {/* Right Panel - Dynamic Content */}
          <div className="sm:ms-4 flex-1 min-h-[350px]">
            {error ? (
              <div className="brand-megamenu-error flex items-center justify-center h-full">
                <div className="text-center py-12">
                  <div className="text-red-400 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-red-600 mb-1">Unable to Load Brands</h3>
                  <p className="text-sm text-gray-500 mb-4">{error}</p>
                  <button 
                    className="px-4 h-[36px] bg-black text-white !rounded-none font-medium text-[14px] hover:bg-gray-800 transition-all"
                    onClick={() => {
                      setError(null);
                      initializeMegaMenuData();
                    }}
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : hoveredBrand ? (
              <ProductPreview 
                brand={hoveredBrand}
                products={productsByBrand[hoveredBrand._id] || []}
                loading={!productsByBrand[hoveredBrand._id]}
              />
            ) : (
              <FeaturedBrands 
                featuredBrands={featuredBrands}
                onBrandClick={handleBrandClick}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandMegaMenu;
