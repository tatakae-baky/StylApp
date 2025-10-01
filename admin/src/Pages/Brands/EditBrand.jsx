import React, { useState, useContext, useEffect } from 'react';
import { Button, TextField, Switch, FormControlLabel, CircularProgress } from "@mui/material";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import { MyContext } from '../../App';
import { fetchDataFromApi, editData, deleteImages } from '../../utils/api';
import { useNavigate, useParams } from 'react-router-dom';
import UploadBox from '../../Components/UploadBox';

const EditBrand = () => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        website: '',
        email: '',
        establishedYear: '',
        metaTitle: '',
        metaDescription: '',
        isActive: true,
        isFeatured: false,
        image: '' // Add image field to track uploaded image
    });
    
    const [previews, setPreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingBrand, setLoadingBrand] = useState(true);
    
    const context = useContext(MyContext);
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        if (id) {
            getBrandById();
        }
    }, [id]);

    const getBrandById = () => {
        setLoadingBrand(true);
        fetchDataFromApi(`/api/brand/${id}`).then((res) => {
            if (res?.error === false) {
                const brand = res.brand;
                setFormData({
                    name: brand.name || '',
                    description: brand.description || '',
                    website: brand.website || '',
                    email: brand.email || '',
                    establishedYear: brand.establishedYear || '',
                    metaTitle: brand.metaTitle || '',
                    metaDescription: brand.metaDescription || '',
                    isActive: brand.isActive !== undefined ? brand.isActive : true,
                    isFeatured: brand.isFeatured !== undefined ? brand.isFeatured : false,
                    image: brand.logo || '' // Set existing image
                });
                
                // Set existing images
                if (brand.logo) {
                    setPreviews([brand.logo]);
                }
            } else {
                context.alertBox("error", "Brand not found");
                navigate('/brands');
            }
            setLoadingBrand(false);
        }).catch((error) => {
            context.alertBox("error", "Failed to fetch brand details");
            navigate('/brands');
            setLoadingBrand(false);
        });
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    /**
     * Handle image previews - following the exact pattern from SubCategorySections
     */
    const setPreviewsFun = (previewsArr) => {
        const imgArr = [...previews];
        for (let i = 0; i < previewsArr.length; i++) {
            imgArr.push(previewsArr[i]);
        }

        setPreviews([]);
        setTimeout(() => {
            setPreviews(imgArr);
            setFormData(prev => ({ ...prev, image: imgArr[0] }));
        }, 10);
    };

    /**
     * Remove image - following the exact pattern from SubCategorySections
     */
    const removeImg = (image, index, event) => {
        // Prevent form submission when clicking delete button
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        var imageArr = [...previews];
        deleteImages(`/api/brand/deteleImage?img=${image}`).then((res) => {
            if (res && (res.success === true || res.error === false)) {
                imageArr.splice(index, 1);
                setPreviews([]);
                setTimeout(() => {
                    setPreviews(imageArr);
                    setFormData(prev => ({ ...prev, image: imageArr[0] || '' }));
                }, 100);
                context.alertBox("success", "Image deleted successfully!");
            } else {
                context.alertBox("error", res?.message || "Failed to delete image");
            }
        }).catch((error) => {
            console.error("Error deleting image:", error);
            context.alertBox("error", "Failed to delete image. Please try again.");
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name.trim()) {
            context.alertBox("error", "Brand name is required");
            return;
        }

        setLoading(true);
        context.setProgress(30);

        try {
            // Submit brand data - backend will handle images from global imagesArr
            const response = await editData(`/api/brand/edit/${id}`, formData);
            
            console.log('Brand update response:', response);
            console.log('Response type:', typeof response);
            console.log('Response success:', response?.success);
            console.log('Response error:', response?.error);
            
            if (response && (response.success === true || response.error === false)) {
                context.alertBox("success", "Brand updated successfully!");
                
                // Update brand logo in context if user is brand owner and logo was updated
                if (context?.userData?.role === 'BRAND_OWNER' && response.brand?.logo && context?.setBrandLogo) {
                    context.setBrandLogo(response.brand.logo);
                    context.setBrandLogoLoading && context.setBrandLogoLoading(false);
                    context.setUserDataLoaded && context.setUserDataLoaded(true);
                }
                
                // Check user role and redirect appropriately
                const userRole = context?.userData?.role;
                console.log('User role for redirect:', userRole);
                
                setTimeout(() => {
                    if (userRole === 'BRAND_OWNER') {
                        // For brand owners, redirect to their brand info page
                        console.log('Redirecting brand owner to brand info page');
                        navigate('/brand-info', { replace: true });
                    } else {
                        // For admins, redirect to brands management
                        console.log('Redirecting admin to brands management');
                        navigate('/brands', { replace: true });
                    }
                }, 500);
            } else {
                console.log('Update condition not met, response:', response);
                context.alertBox("error", response?.message || "Failed to update brand");
            }
        } catch (error) {
            console.log('Error caught:', error);
            context.alertBox("error", "An error occurred while updating the brand");
            console.error(error);
        } finally {
            setLoading(false);
            context.setProgress(100);
        }
    };

    if (loadingBrand) {
        return (
            <div className="bg-white border border-gray-200 my-4">
                <div className="p-6">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <CircularProgress />
                            <p className="mt-3 text-[14px] text-gray-600">Loading brand details...</p>
                        </div>
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
                        <h2 className="text-[20px] font-[600] text-gray-900 mb-2">
                            {context?.userData?.role === 'BRAND_OWNER' ? 'Edit Your Brand' : 'Edit Brand'}
                        </h2>
                        <p className="text-[14px] text-gray-600">
                            Update your brand information and details
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {context?.userData?.role !== 'BRAND_OWNER' && (
                            <Button 
                                variant="outlined" 
                                onClick={() => navigate('/brands')}
                                className="!text-[12px] !py-2 !px-4"
                            >
                                Back to Brands
                            </Button>
                        )}
                        {context?.userData?.role === 'BRAND_OWNER' && (
                            <Button 
                                variant="outlined" 
                                onClick={() => navigate('/brand-info')}
                                className="!text-[12px] !py-2 !px-4"
                            >
                                Back to Brand Info
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information Section */}
                    <div>
                        <h3 className="text-[18px] font-[600] text-gray-900 mb-4">Basic Information</h3>
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[13px] font-[600] text-gray-700 mb-2">
                                            Brand Name <span className="text-red-500">*</span>
                                        </label>
                                        <TextField
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            fullWidth
                                            placeholder="Enter brand name"
                                            size="small"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '6px',
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#d1d5db'
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-[13px] font-[600] text-gray-700 mb-2">Website URL</label>
                                        <TextField
                                            name="website"
                                            value={formData.website}
                                            onChange={handleInputChange}
                                            fullWidth
                                            placeholder="https://example.com"
                                            size="small"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '6px',
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#d1d5db'
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-[13px] font-[600] text-gray-700 mb-2">
                                            Brand Email <span className="text-red-500">*</span>
                                        </label>
                                        <TextField
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            fullWidth
                                            placeholder="orders@brand.com"
                                            size="small"
                                            helperText="Email for order notifications"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '6px',
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#d1d5db'
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[13px] font-[600] text-gray-700 mb-2">Description</label>
                                        <TextField
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            multiline
                                            rows={6}
                                            fullWidth
                                            placeholder="Enter brand description"
                                            size="small"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '6px',
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#d1d5db'
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-[13px] font-[600] text-gray-700 mb-2">Established Year</label>
                                        <TextField
                                            name="establishedYear"
                                            value={formData.establishedYear}
                                            onChange={handleInputChange}
                                            fullWidth
                                            placeholder="e.g., 1995"
                                            size="small"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '6px',
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#d1d5db'
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SEO Information Section */}
                    <div>
                        <h3 className="text-[18px] font-[600] text-gray-900 mb-4">SEO Information</h3>
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[13px] font-[600] text-gray-700 mb-2">Meta Title</label>
                                    <TextField
                                        name="metaTitle"
                                        value={formData.metaTitle}
                                        onChange={handleInputChange}
                                        fullWidth
                                        placeholder="SEO meta title"
                                        size="small"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '6px',
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#d1d5db'
                                                }
                                            }
                                        }}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-[13px] font-[600] text-gray-700 mb-2">Meta Description</label>
                                    <TextField
                                        name="metaDescription"
                                        value={formData.metaDescription}
                                        onChange={handleInputChange}
                                        multiline
                                        rows={3}
                                        fullWidth
                                        placeholder="SEO meta description"
                                        size="small"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '6px',
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#d1d5db'
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Admin Settings Section */}
                    {context?.userData?.role !== 'BRAND_OWNER' && (
                        <div>
                            <h3 className="text-[18px] font-[600] text-gray-900 mb-4">Admin Settings</h3>
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <div className="flex gap-8">
                                    <div className="flex items-center gap-3">
                                        <Switch
                                            checked={formData.isActive}
                                            onChange={handleInputChange}
                                            name="isActive"
                                            color="primary"
                                        />
                                        <div>
                                            <label className="text-[14px] font-[600] text-gray-900">Active</label>
                                            <p className="text-[12px] text-gray-500">Brand is visible to customers</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        <Switch
                                            checked={formData.isFeatured}
                                            onChange={handleInputChange}
                                            name="isFeatured"
                                            color="secondary"
                                        />
                                        <div>
                                            <label className="text-[14px] font-[600] text-gray-900">Featured</label>
                                            <p className="text-[12px] text-gray-500">Show as featured brand</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Brand Logo Section */}
                    <div>
                        <h3 className="text-[18px] font-[600] text-gray-900 mb-4">Brand Logo</h3>
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <div className="mb-4">
                                <p className="text-[14px] text-gray-600">
                                    Upload your brand logo. Recommended size: 200x200px or larger. Supported formats: JPG, PNG, WebP.
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {previews?.length !== 0 && previews?.map((image, index) => (
                                    <div className="relative group" key={index}>
                                        <div className="absolute -top-2 -right-2 z-10">
                                            <button
                                                type="button"
                                                className="w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
                                                onClick={(e) => removeImg(image, index, e)}
                                                title="Remove image"
                                            >
                                                <IoMdClose className='text-white text-[14px]' />
                                            </button>
                                        </div>
                                        <div className='border-2 border-dashed border-gray-300 rounded-lg overflow-hidden h-32 w-full bg-gray-50 hover:bg-gray-100 transition-colors group-hover:border-gray-400'>
                                            <img 
                                                src={image} 
                                                className='w-full h-full object-cover' 
                                                alt="Brand Logo" 
                                            />
                                        </div>
                                    </div>
                                ))}

                                <UploadBox 
                                    multiple={false} 
                                    name="images" 
                                    url="/api/brand/uploadImages" 
                                    setPreviewsFun={setPreviewsFun} 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                        <Button 
                            type="submit" 
                            variant="contained" 
                            disabled={loading}
                            sx={{
                                backgroundColor: '#FF2E4D',
                                borderRadius: '6px',
                                textTransform: 'none',
                                fontWeight: 500,
                                padding: '10px 24px',
                                '&:hover': {
                                    backgroundColor: '#e63852'
                                },
                                '&:disabled': {
                                    backgroundColor: '#d1d5db'
                                }
                            }}
                        >
                            {loading ? (
                                <>
                                    <CircularProgress size={20} className="mr-2" color="inherit" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <IoMdAdd className="mr-2" />
                                    Update Brand
                                </>
                            )}
                        </Button>
                        
                        <Button 
                            type="button" 
                            variant="outlined" 
                            onClick={() => {
                                const userRole = context?.userData?.role;
                                if (userRole === 'BRAND_OWNER') {
                                    navigate('/brand-info');
                                } else {
                                    navigate('/brands');
                                }
                            }}
                            disabled={loading}
                            sx={{
                                borderRadius: '6px',
                                textTransform: 'none',
                                fontWeight: 500,
                                padding: '10px 24px',
                                borderColor: '#d1d5db',
                                color: '#6b7280',
                                '&:hover': {
                                    borderColor: '#9ca3af',
                                    backgroundColor: '#f9fafb'
                                }
                            }}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditBrand;
