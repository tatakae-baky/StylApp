import React, { useState, useContext, useEffect } from 'react';
import { Button, Chip, CircularProgress, Card, CardContent, Grid, Typography, Box } from "@mui/material";
import { MyContext } from '../../App';
import { fetchDataFromApi } from '../../utils/api';
import { useNavigate, Link } from 'react-router-dom';
import { AiOutlineEdit } from "react-icons/ai";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

const BrandInfo = () => {
    const [brand, setBrand] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const context = useContext(MyContext);
    const navigate = useNavigate();

    useEffect(() => {
        // Wait for userData to be loaded before proceeding
        if (!context?.userData) {
            return; // Don't do anything if user data is not loaded yet
        }

        // Only allow brand owners to access this page
        if (context.userData.role !== 'BRAND_OWNER') {
            console.log('🚫 Non-brand-owner trying to access brand info page - redirecting to dashboard');
            context.alertBox("error", "Access denied. This page is only for brand owners.");
            navigate('/dashboard', { replace: true });
            return;
        }

        const brandId = context.userData.brandId;
        if (brandId) {
            getBrandById(brandId);
        } else {
            context.alertBox("error", "Brand ID not found");
            navigate('/dashboard');
        }
    }, [context?.userData, navigate]);

    const getBrandById = (brandId) => {
        setLoading(true);
        fetchDataFromApi(`/api/brand/${brandId}`).then((res) => {
            if (res?.error === false) {
                setBrand(res.brand);
                // Update brand logo in context for header/sidebar
                if (res.brand?.logo && context?.setBrandLogo) {
                    context.setBrandLogo(res.brand.logo);
                    context.setBrandLogoLoading && context.setBrandLogoLoading(false);
                    context.setUserDataLoaded && context.setUserDataLoaded(true);
                }
            } else {
                context.alertBox("error", "Brand not found");
                navigate('/dashboard');
            }
            setLoading(false);
        }).catch((error) => {
            context.alertBox("error", "Failed to fetch brand details");
            navigate('/dashboard');
            setLoading(false);
        });
    };

    if (loading || !context?.userData) {
        return (
            <div className="bg-white border border-gray-200">
                <div className="p-6">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <CircularProgress />
                            <p className="mt-3 text-[14px] text-gray-600">
                                {!context?.userData ? 'Loading user data...' : 'Loading your brand details...'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!brand) {
        return (
            <div className="bg-white border border-gray-200">
                <div className="p-6">
                    <div className="text-center py-12">
                        <div className="text-[48px] mb-4">🏢</div>
                        <h3 className="text-[20px] font-[600] text-gray-900 mb-2">Brand Not Found</h3>
                        <p className="text-[14px] text-gray-600">Unable to load your brand information.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200">
            {/* Header Section */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h2 className="text-[20px] font-[600] text-gray-900 mb-2">Your Brand Information</h2>
                        <p className="text-[14px] text-gray-600">
                            View and manage your brand details, settings, and information
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to={`/brands/edit/${brand._id}`}>
                            <Button 
                                variant="contained" 
                                color="primary"
                                className="!text-[12px] !py-2 !px-4"
                            >
                                <AiOutlineEdit className="mr-1" />
                                Edit Brand Info
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-6">
                {/* Brand Logo Section */}
                <div className="mb-8">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                            <div className="flex-shrink-0">
                                <h3 className="text-[16px] font-[600] text-gray-900 mb-3">Brand Logo</h3>
                                <div className="w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                                    <LazyLoadImage
                                        alt={brand.name}
                                        effect="blur"
                                        className="w-full h-full object-contain p-2"
                                        src={brand.logo || '/placeholder-brand.png'}
                                    />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-[16px] font-[600] text-gray-900 mb-3">Brand Overview</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                                        <div className="text-[12px] text-gray-500 mb-1">Status</div>
                                        <Chip 
                                            label={brand.isActive ? 'Active' : 'Inactive'}
                                            color={brand.isActive ? 'success' : 'default'}
                                            size="small"
                                            className="!text-[11px]"
                                        />
                                    </div>
                                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                                        <div className="text-[12px] text-gray-500 mb-1">Featured</div>
                                        <Chip 
                                            label={brand.isFeatured ? 'Yes' : 'No'}
                                            color={brand.isFeatured ? 'primary' : 'default'}
                                            size="small"
                                            className="!text-[11px]"
                                        />
                                    </div>
                                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                                        <div className="text-[12px] text-gray-500 mb-1">Total Products</div>
                                        <div className="text-[18px] font-[700] text-[#FF2E4D]">
                                            {brand.totalProducts || 0}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Basic Information Section */}
                <div className="mb-8">
                    <h3 className="text-[18px] font-[600] text-gray-900 mb-4">Basic Information</h3>
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[13px] font-[600] text-gray-700 mb-2">Brand Name</label>
                                    <div className="text-[15px] font-[600] text-gray-900 bg-gray-50 p-3 rounded-lg border">
                                        {brand.name}
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-[13px] font-[600] text-gray-700 mb-2">Email</label>
                                    {brand.email ? (
                                        <a 
                                            href={`mailto:${brand.email}`}
                                            className="text-[15px] text-blue-600 hover:underline bg-gray-50 p-3 rounded-lg border block"
                                        >
                                            {brand.email}
                                        </a>
                                    ) : (
                                        <div className="text-[15px] text-gray-400 bg-gray-50 p-3 rounded-lg border">
                                            Not provided
                                        </div>
                                    )}
                                </div>
                                
                                <div>
                                    <label className="block text-[13px] font-[600] text-gray-700 mb-2">Website</label>
                                    {brand.website ? (
                                        <a 
                                            href={brand.website} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-[15px] text-blue-600 hover:underline bg-gray-50 p-3 rounded-lg border block"
                                        >
                                            {brand.website}
                                        </a>
                                    ) : (
                                        <div className="text-[15px] text-gray-400 bg-gray-50 p-3 rounded-lg border">
                                            Not provided
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[13px] font-[600] text-gray-700 mb-2">Established Year</label>
                                    <div className="text-[15px] text-gray-900 bg-gray-50 p-3 rounded-lg border">
                                        {brand.establishedYear || 'Not provided'}
                                    </div>
                                </div>
                                
                                {brand.description && (
                                    <div>
                                        <label className="block text-[13px] font-[600] text-gray-700 mb-2">Description</label>
                                        <div className="text-[14px] text-gray-800 bg-gray-50 p-3 rounded-lg border leading-relaxed">
                                            {brand.description}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* SEO Information Section */}
                {(brand.metaTitle || brand.metaDescription) && (
                    <div className="mb-8">
                        <h3 className="text-[18px] font-[600] text-gray-900 mb-4">SEO Information</h3>
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <div className="space-y-4">
                                {brand.metaTitle && (
                                    <div>
                                        <label className="block text-[13px] font-[600] text-gray-700 mb-2">Meta Title</label>
                                        <div className="text-[14px] text-gray-800 bg-gray-50 p-3 rounded-lg border">
                                            {brand.metaTitle}
                                        </div>
                                    </div>
                                )}
                                
                                {brand.metaDescription && (
                                    <div>
                                        <label className="block text-[13px] font-[600] text-gray-700 mb-2">Meta Description</label>
                                        <div className="text-[14px] text-gray-800 bg-gray-50 p-3 rounded-lg border leading-relaxed">
                                            {brand.metaDescription}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrandInfo;
