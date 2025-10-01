import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { fetchDataFromApi } from '../../utils/api';
import ProductItem from '../../components/ProductItem';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import "react-lazy-load-image-component/src/effects/blur.css";
import { MyContext } from '../../App';

const BrandProducts = () => {
    // NOTE: Route in App.jsx is `/brand/:slug`, so we must read `slug` here
    // If we read a different key (e.g. brandSlug), it will be undefined
    const { slug } = useParams();
    const [brand, setBrand] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    
    const context = useContext(MyContext);

    useEffect(() => {
        if (slug) {
            fetchBrandAndProducts();
        } else {
        }
    }, [slug, currentPage]);

    const fetchBrandAndProducts = async () => {
        try {
            setLoading(true);
            
            // First get brand by slug
            const brandRes = await fetchDataFromApi(`/api/brand/slug/${slug}`);
            
            if (brandRes?.error === false) {
                setBrand(brandRes.brand);
                
                // Then get products for this brand
                const productsUrl = `/api/brand/${brandRes.brand._id}/products?page=${currentPage}&perPage=20`;
                
                const productsRes = await fetchDataFromApi(productsUrl);
                
                if (productsRes?.error === false) {
                    setProducts(productsRes.products);
                    setTotalPages(productsRes.totalPages);
                    setTotalProducts(productsRes.totalProducts);
                } else {
                }
            } else {
                // Brand not found
                setBrand(null);
            }
            
            setLoading(false);
        } catch (error) {
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                slug,
                currentPage
            });
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3">Loading...</span>
            </div>
        );
    }

    if (!brand) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Brand Not Found</h1>
                <p className="text-gray-600 mb-8">
                    The brand you're looking for doesn't exist or has been removed.
                </p>
                <button 
                    onClick={() => window.history.back()}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="brand-products py-8">
            <div className="container mx-auto px-2">
                {/* Brand Header */}
                <div className="brand-header bg-white border border-gray-300 p-8 mb-8">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 flex-shrink-0">
                            {brand.logo ? (
                                <LazyLoadImage
                                    src={brand.logo}
                                    alt={brand.name}
                                    className="w-full h-full object-contain rounded-lg border"
                                    effect="blur"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                                    <span className="text-3xl font-bold text-gray-400">
                                        {brand.name.charAt(0)}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold mb-2 text-gray-900">{brand.name}</h1>
                            {brand.description && (
                                <p className="text-gray-600 mb-3">{brand.description}</p>
                            )}
                            <div className="flex items-center gap-6 text-sm text-gray-500">
                                {brand.establishedYear && (
                                    <span>Est. {brand.establishedYear}</span>
                                )}
                                {brand.countryOfOrigin && (
                                    <span>{brand.countryOfOrigin}</span>
                                )}
                                <span className="font-semibold text-blue-600">
                                    {totalProducts} Products
                                </span>
                            </div>
                            {brand.website && (
                                <div className="mt-3">
                                    <a 
                                        href={brand.website} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                    >
                                        Visit Website →
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Breadcrumb */}
                <nav className="mb-6">
                    <ol className="flex items-center space-x-2 text-sm text-gray-500">
                        <li>
                            <a href="/" className="hover:text-gray-700">Home</a>
                        </li>
                        <li>/</li>
                        <li>
                            <a href="/brands" className="hover:text-gray-700">Brands</a>
                        </li>
                        <li>/</li>
                        <li className="text-gray-900 font-medium">{brand.name}</li>
                    </ol>
                </nav>

                {/* Products Section */}
                <div className="products-section">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Products from {brand.name}
                        </h2>
                        <span className="text-gray-500">
                            Showing {products.length} of {totalProducts} products
                        </span>
                    </div>
                    
                    {products.length > 0 ? (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-6 mb-8">
                                {products.map((product) => (
                                    <ProductItem key={product._id} item={product} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center space-x-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        Previous
                                    </button>
                                    
                                    {[...Array(totalPages)].map((_, index) => {
                                        const page = index + 1;
                                        if (
                                            page === 1 ||
                                            page === totalPages ||
                                            (page >= currentPage - 2 && page <= currentPage + 2)
                                        ) {
                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => handlePageChange(page)}
                                                    className={`px-4 py-2 text-sm border rounded-lg ${
                                                        currentPage === page
                                                            ? 'bg-blue-600 text-white border-blue-600'
                                                            : 'hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        } else if (
                                            page === currentPage - 3 ||
                                            page === currentPage + 3
                                        ) {
                                            return <span key={page} className="px-2">...</span>;
                                        }
                                        return null;
                                    })}
                                    
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-16">
                            <div className="text-gray-400 text-6xl mb-4">📦</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                No products found
                            </h3>
                            <p className="text-gray-600 mb-6">
                                This brand doesn't have any products available at the moment.
                            </p>
                            <a 
                                href="/brands"
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Browse Other Brands
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BrandProducts;
