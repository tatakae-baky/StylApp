import React, { useState, useContext, useEffect } from 'react';
import { Button, Chip, CircularProgress, Card, CardContent, Grid, Typography, Box } from "@mui/material";
import { MyContext } from '../../App';
import { fetchDataFromApi } from '../../utils/api';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { AiOutlineEdit } from "react-icons/ai";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

const ViewBrand = () => {
    const [brand, setBrand] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const context = useContext(MyContext);
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        if (id) {
            getBrandById();
        }
    }, [id]);

    const getBrandById = () => {
        setLoading(true);
        fetchDataFromApi(`/api/brand/${id}`).then((res) => {
            if (res?.error === false) {
                setBrand(res.brand);
            } else {
                context.alertBox("error", "Brand not found");
                navigate('/brands');
            }
            setLoading(false);
        }).catch((error) => {
            context.alertBox("error", "Failed to fetch brand details");
            navigate('/brands');
            setLoading(false);
        });
    };

    if (loading) {
        return (
            <div className="right-content w-full flex justify-center items-center h-64">
                <CircularProgress />
                <span className="ml-3">Loading brand details...</span>
            </div>
        );
    }

    if (!brand) {
        return (
            <div className="right-content w-full">
                <div className="card shadow-md border-0 w-full bg-white p-4 text-center">
                    <h3 className="font-bold text-xl mb-4">Brand Not Found</h3>
                    <Button variant="outlined" onClick={() => navigate('/brands')}>
                        Back to Brands
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="right-content w-full">
            <div className="card shadow-md border-0 w-full bg-white p-4">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-2xl">Brand Details</h3>
                    <div className="flex gap-2">
                        <Link to={`/brands/edit/${brand._id}`}>
                            <Button variant="contained" color="primary">
                                <AiOutlineEdit className="mr-2" />
                                Edit Brand
                            </Button>
                        </Link>
                        <Button 
                            variant="outlined" 
                            onClick={() => navigate('/brands')}
                        >
                            Back to Brands
                        </Button>
                    </div>
                </div>

                <Grid container spacing={4}>
                    {/* Brand Logo */}
                    <Grid item xs={12} md={4}>
                        <Card elevation={2}>
                            <CardContent className="text-center">
                                <Typography variant="h6" className="mb-3 font-semibold">
                                    Brand Logo
                                </Typography>
                                <div className="flex justify-center">
                                    <div className="w-32 h-32 border rounded-lg overflow-hidden bg-gray-50">
                                        <LazyLoadImage
                                            alt={brand.name}
                                            effect="blur"
                                            className="w-full h-full object-contain"
                                            src={brand.logo || '/placeholder-brand.png'}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Brand Information */}
                    <Grid item xs={12} md={8}>
                        <Card elevation={2}>
                            <CardContent>
                                <Typography variant="h6" className="mb-4 font-semibold">
                                    Basic Information
                                </Typography>
                                
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Typography variant="subtitle2" className="text-gray-600 mb-1">
                                                Brand Name
                                            </Typography>
                                            <Typography variant="body1" className="font-medium">
                                                {brand.name}
                                            </Typography>
                                        </div>
                                        
                                        <div>
                                            <Typography variant="subtitle2" className="text-gray-600 mb-1">
                                                Slug
                                            </Typography>
                                            <Typography variant="body2" className="font-mono bg-gray-100 px-2 py-1 rounded">
                                                {brand.slug}
                                            </Typography>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Typography variant="subtitle2" className="text-gray-600 mb-1">
                                                Status
                                            </Typography>
                                            <Chip 
                                                label={brand.isActive ? 'Active' : 'Inactive'}
                                                color={brand.isActive ? 'success' : 'default'}
                                                size="small"
                                            />
                                        </div>
                                        
                                        <div>
                                            <Typography variant="subtitle2" className="text-gray-600 mb-1">
                                                Featured
                                            </Typography>
                                            <Chip 
                                                label={brand.isFeatured ? 'Yes' : 'No'}
                                                color={brand.isFeatured ? 'primary' : 'default'}
                                                size="small"
                                            />
                                        </div>
                                    </div>

                                    {brand.description && (
                                        <div>
                                            <Typography variant="subtitle2" className="text-gray-600 mb-1">
                                                Description
                                            </Typography>
                                            <Typography variant="body2" className="text-gray-800">
                                                {brand.description}
                                            </Typography>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Additional Details */}
                    <Grid item xs={12}>
                        <Card elevation={2}>
                            <CardContent>
                                <Typography variant="h6" className="mb-4 font-semibold">
                                    Additional Details
                                </Typography>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {brand.website && (
                                        <div>
                                            <Typography variant="subtitle2" className="text-gray-600 mb-1">
                                                Website
                                            </Typography>
                                            <a 
                                                href={brand.website} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline text-sm"
                                            >
                                                {brand.website}
                                            </a>
                                        </div>
                                    )}
                                    
                                    {brand.email && (
                                        <div>
                                            <Typography variant="subtitle2" className="text-gray-600 mb-1">
                                                Email
                                            </Typography>
                                            <a 
                                                href={`mailto:${brand.email}`}
                                                className="text-blue-600 hover:underline text-sm"
                                            >
                                                {brand.email}
                                            </a>
                                        </div>
                                    )}
                                    
                                    {brand.establishedYear && (
                                        <div>
                                            <Typography variant="subtitle2" className="text-gray-600 mb-1">
                                                Established Year
                                            </Typography>
                                            <Typography variant="body2">
                                                {brand.establishedYear}
                                            </Typography>
                                        </div>
                                    )}
                                    
                                    {brand.countryOfOrigin && (
                                        <div>
                                            <Typography variant="subtitle2" className="text-gray-600 mb-1">
                                                Country of Origin
                                            </Typography>
                                            <Typography variant="body2">
                                                {brand.countryOfOrigin}
                                            </Typography>
                                        </div>
                                    )}
                                    
                                    <div>
                                        <Typography variant="subtitle2" className="text-gray-600 mb-1">
                                            Total Products
                                        </Typography>
                                        <Chip 
                                            label={brand.totalProducts || 0}
                                            color="primary"
                                            variant="outlined"
                                            size="small"
                                        />
                                    </div>
                                </div>

                                {(brand.metaTitle || brand.metaDescription) && (
                                    <div className="mt-6 pt-4 border-t">
                                        <Typography variant="h6" className="mb-3 font-semibold">
                                            SEO Information
                                        </Typography>
                                        
                                        <div className="space-y-3">
                                            {brand.metaTitle && (
                                                <div>
                                                    <Typography variant="subtitle2" className="text-gray-600 mb-1">
                                                        Meta Title
                                                    </Typography>
                                                    <Typography variant="body2" className="bg-gray-50 p-2 rounded">
                                                        {brand.metaTitle}
                                                    </Typography>
                                                </div>
                                            )}
                                            
                                            {brand.metaDescription && (
                                                <div>
                                                    <Typography variant="subtitle2" className="text-gray-600 mb-1">
                                                        Meta Description
                                                    </Typography>
                                                    <Typography variant="body2" className="bg-gray-50 p-2 rounded">
                                                        {brand.metaDescription}
                                                    </Typography>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-6 pt-4 border-t">
                                    <Typography variant="h6" className="mb-3 font-semibold">
                                        System Information
                                    </Typography>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                        <div>
                                            <Typography variant="subtitle2" className="text-gray-600 mb-1">
                                                Sort Order
                                            </Typography>
                                            <Typography variant="body2">
                                                {brand.sortOrder || 0}
                                            </Typography>
                                        </div>
                                        
                                        <div>
                                            <Typography variant="subtitle2" className="text-gray-600 mb-1">
                                                Created At
                                            </Typography>
                                            <Typography variant="body2">
                                                {new Date(brand.dateCreated).toLocaleDateString()}
                                            </Typography>
                                        </div>
                                        
                                        <div>
                                            <Typography variant="subtitle2" className="text-gray-600 mb-1">
                                                Brand ID
                                            </Typography>
                                            <Typography variant="body2" className="font-mono text-xs">
                                                {brand._id}
                                            </Typography>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </div>
        </div>
    );
};

export default ViewBrand;
