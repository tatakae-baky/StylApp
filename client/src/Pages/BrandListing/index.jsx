import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchDataFromApi } from '../../utils/api';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import "react-lazy-load-image-component/src/effects/blur.css";

/**
 * Enhanced Brand Listing Page Component
 * Features improved brand discovery with search, filtering, and better visual hierarchy
 * Maintains project design consistency while enhancing user engagement
 */
const BrandListing = () => {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [featuredBrands, setFeaturedBrands] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('name');

    useEffect(() => {
        fetchBrands();
    }, []);

    /**
     * Fetch brands data from API including featured and all brands
     * Handles API responses and error states
     */
    const fetchBrands = () => {
        Promise.all([
            fetchDataFromApi('/api/brand/get?isActive=true'),
            fetchDataFromApi('/api/brand/get?isActive=true&isFeatured=true')
        ]).then(([allBrands, featured]) => {
            if (allBrands?.error === false) setBrands(allBrands.brands);
            if (featured?.error === false) setFeaturedBrands(featured.brands);
            setLoading(false);
        }).catch(() => {
            setLoading(false);
        });
    };

    /**
     * Filter and sort brands based on search term, category, and sort preference
     * Returns processed brand list for display
     */
    const getFilteredAndSortedBrands = () => {
        let filtered = brands.filter(brand => {
            const matchesSearch = brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                (brand.description && brand.description.toLowerCase().includes(searchTerm.toLowerCase()));
            
            const matchesCategory = selectedCategory === 'all' || 
                                  (selectedCategory === 'featured' && brand.isFeatured) ||
                                  (selectedCategory === 'new' && brand.isNew) ||
                                  (selectedCategory === 'trending' && brand.isTrending);
            
            return matchesSearch && matchesCategory;
        });

        // Sort brands based on selected criteria
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'products':
                    return (b.totalProducts || 0) - (a.totalProducts || 0);
                case 'featured':
                    return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
                default:
                    return 0;
            }
        });

        return filtered;
    };

    /**
     * Get unique categories from brands for filtering
     */
    const getBrandCategories = () => {
        const categories = new Set();
        brands.forEach(brand => {
            if (brand.isFeatured) categories.add('featured');
            if (brand.isNew) categories.add('new');
            if (brand.isTrending) categories.add('trending');
        });
        return Array.from(categories);
    };

    const filteredBrands = getFilteredAndSortedBrands();
    const categories = getBrandCategories();

    if (loading) {
        return (
            <div className="bg-white py-3 lg:py-8">
                <div className="container">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF2E4D] mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading brands...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="py-8 lg:py-12">
                <div className="container">
                    <div className="text-center">
                        <h1 className="text-[24px] lg:text-[32px] font-bold text-gray-900 mb-2 uppercase">SHOP BY BRAND</h1>
                        <p className="text-[14px] text-gray-600 font-[400] uppercase tracking-wider max-w-2xl mx-auto">
                            DISCOVER YOUR FAVORITE BRANDS AND EXPLORE THEIR COMPLETE PRODUCT COLLECTIONS
                        </p>
                    </div>

                </div>
            </section>

            {/* Featured Brands Section */}
            {featuredBrands.length > 0 && (
                <section className="py-3 lg:py-2">
                    <div className="container">
                        <div className="mb-1">
                            <h2 className="text-[20px] lg:text-[24px] font-bold text-gray-900 uppercase">FEATURED BRANDS</h2>
                            <p className="text-[14px] text-gray-600 font-[400] uppercase tracking-wider mt-0.5">HANDPICKED BY STYL'</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
                            {featuredBrands.map((brand) => (
                                <Link
                                    key={brand._id}
                                    to={`/brand/${brand.slug}`}
                                    className="group block bg-white overflow-hidden border border-gray-300"
                                >
                                    <div className="aspect-square bg-white flex items-center justify-center p-4">
                                        {brand.logo ? (
                                            <LazyLoadImage
                                                src={brand.logo}
                                                alt={brand.name}
                                                className="w-full h-full object-contain"
                                                effect="blur"
                                            />
                                        ) : (
                                            <div className="text-3xl font-bold text-gray-400">
                                                {brand.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 text-center">
                                        <h3 className="font-semibold text-gray-900 group-hover:text-[#FF2E4D] group-hover:font-bold transition-colors text-sm">
                                            {brand.name}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {brand.totalProducts} products
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* All Brands Section */}
            <section className="py-3 lg:py-8">
                <div className="container">
                    <div className="mb-1">
                        <h2 className="text-[20px] lg:text-[24px] font-bold text-gray-900 uppercase">ALL BRANDS</h2>
                    </div>
                    {filteredBrands.length > 0 ? (
                        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
                            {filteredBrands.map((brand) => (
                                <Link
                                    key={brand._id}
                                    to={`/brand/${brand.slug}`}
                                    className="group block bg-white overflow-hidden border border-gray-300"
                                >
                                    <div className="aspect-square bg-gray-50 flex items-center justify-center p-4">
                                        {brand.logo ? (
                                            <LazyLoadImage
                                                src={brand.logo}
                                                alt={brand.name}
                                                className="w-full h-full object-contain"
                                                effect="blur"
                                            />
                                        ) : (
                                            <div className="text-3xl font-bold text-gray-400">
                                                {brand.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 text-center">
                                        <h3 className="font-semibold text-gray-900 group-hover:text-[#FF2E4D] group-hover:font-bold transition-colors text-sm">
                                            {brand.name}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {brand.totalProducts} products
                                        </p>
                                        {brand.description && (
                                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                                {brand.description}
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-6xl mb-4">🏪</div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No brands found</h3>
                            <p className="text-gray-500">Check back later for more brands.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="py-8 lg:py-12">
                <div className="container">
                    <div className="text-center">
                        <h3 className="text-[20px] lg:text-[24px] font-bold text-gray-900 mb-4 uppercase">CAN'T FIND YOUR BRAND?</h3>
                        <p className="text-[14px] text-gray-600 font-[400] uppercase tracking-wider mb-6">
                            LET US KNOW AND WE'LL ADD IT TO OUR COLLECTION
                        </p>
                        <Link to="/contact" className="text-[16px] font-medium uppercase bg-[#FF2E4D] text-white px-4 py-2">
                            Contact Us
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default BrandListing;
