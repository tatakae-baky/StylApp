import React, { useContext, useEffect, useState } from 'react';
import { MenuItem, FormControl, Select, TextField, Button } from '@mui/material';
import { postData, uploadImages, fetchDataFromApi, deleteImages } from '../../utils/api';
import { MyContext } from '../../App';
import { useNavigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import { IoMdClose } from "react-icons/io";
import { FaCloudUploadAlt } from "react-icons/fa";
import UploadBox from '../../Components/UploadBox';

/**
 * Add Hottest Brand Offer Component
 * Form to create new hottest brand offers
 */
const AddHottestBrandOffer = () => {
    const [formData, setFormData] = useState({
        discount: '',
        description: '',
        brandId: '',
        isActive: true,
        sortOrder: 0
    });
    const [previews, setPreviews] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [brands, setBrands] = useState([]);
    const [isBrandsLoading, setIsBrandsLoading] = useState(true);

    const context = useContext(MyContext);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch brands for dropdown
        fetchBrands();
    }, []);

    /**
     * Fetch available brands
     */
    const fetchBrands = () => {
        setIsBrandsLoading(true);
        fetchDataFromApi("/api/hottestBrandOffers/brands").then((res) => {
            setBrands(res?.data || []);
            setIsBrandsLoading(false);
        }).catch((error) => {
            console.error('Error fetching brands:', error);
            setIsBrandsLoading(false);
            context.alertBox("error", "Failed to fetch brands");
        });
    };

    /**
     * Handle input change
     */
    const inputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    /**
     * Remove image
     */
    const removeImg = (image, index) => {
        var imageArr = [...previews];
        const deleteUrl = `/api/hottestBrandOffers/deleteImage?img=${image}`;
        
        deleteImages(deleteUrl).then((res) => {
            imageArr.splice(index, 1);
            setPreviews([]);
            setTimeout(() => {
                setPreviews(imageArr);
                setFormData(prev => ({ ...prev, image: imageArr[0] || '' }));
                context.alertBox("success", "Image removed successfully");
            }, 100);
        }).catch((error) => {
            console.error('Error removing image:', error);
            context.alertBox("error", "Failed to remove image");
        });
    };

    /**
     * Handle image previews
     */
    const setPreviewsFun = (previewsArr) => {
        setPreviews([]);
        setTimeout(() => {
            setPreviews(previewsArr);
            setFormData(prev => ({ ...prev, image: previewsArr[0] || '' }));
        }, 10);
    };

    /**
     * Handle form submission
     */
    const addOffer = (e) => {
        e.preventDefault();

        // Validation
        if (!formData.discount.trim()) {
            context.alertBox("error", "Please enter discount text");
            return;
        }
        if (!formData.description.trim()) {
            context.alertBox("error", "Please enter description");
            return;
        }
        if (!formData.brandId) {
            context.alertBox("error", "Please select a brand");
            return;
        }
        if (!formData.image) {
            context.alertBox("error", "Please upload an image");
            return;
        }

        setIsLoading(true);

        postData(`/api/hottestBrandOffers/add`, formData).then((res) => {
            setIsLoading(false);
            if (res.success) {
                context.alertBox("success", "Hottest brand offer added successfully");
                navigate('/hottestBrandOffers');
            } else {
                context.alertBox("error", res.message || "Failed to add hottest brand offer");
            }
        }).catch((error) => {
            setIsLoading(false);
            context.alertBox("error", "Failed to add hottest brand offer");
            console.error('Add offer error:', error);
        });
    };

    return (
        <div className="right-content w-100">
            <div className="card shadow border-0 w-100 flex-row p-4">
                <h5 className="mb-0">Add Hottest Brand Offer</h5>
            </div>

            <form className="form" onSubmit={addOffer}>
                <div className="row">
                    <div className="col-sm-9">
                        <div className="card p-4 mt-0">
                            <div className="row">
                                <div className="col">
                                    <div className="form-group">
                                        <h6>DISCOUNT TEXT</h6>
                                        <TextField
                                            name="discount"
                                            value={formData.discount}
                                            onChange={inputChange}
                                            placeholder="e.g., Up to 50% off"
                                            variant="outlined"
                                            className="w-100"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col">
                                    <div className="form-group">
                                        <h6>DESCRIPTION</h6>
                                        <TextField
                                            name="description"
                                            value={formData.description}
                                            onChange={inputChange}
                                            placeholder="e.g., Stylish & elegant dresses"
                                            variant="outlined"
                                            className="w-100"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col">
                                    <div className="form-group">
                                        <h6>BRAND</h6>
                                        <FormControl variant="outlined" className="w-100">
                                            <Select
                                                name="brandId"
                                                value={formData.brandId}
                                                onChange={inputChange}
                                                displayEmpty
                                                disabled={isBrandsLoading}
                                                required
                                            >
                                                <MenuItem value="">
                                                    <em>{isBrandsLoading ? 'Loading brands...' : 'Select Brand'}</em>
                                                </MenuItem>
                                                {brands.map((brand) => (
                                                    <MenuItem key={brand._id} value={brand._id}>
                                                        {brand.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <h6>SORT ORDER</h6>
                                        <TextField
                                            type="number"
                                            name="sortOrder"
                                            value={formData.sortOrder}
                                            onChange={inputChange}
                                            placeholder="0"
                                            variant="outlined"
                                            className="w-100"
                                        />
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <h6>STATUS</h6>
                                        <FormControl variant="outlined" className="w-100">
                                            <Select
                                                name="isActive"
                                                value={formData.isActive}
                                                onChange={inputChange}
                                            >
                                                <MenuItem value={true}>Active</MenuItem>
                                                <MenuItem value={false}>Inactive</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-sm-3">
                        <div className="card p-4 mt-0">
                            <div className="imagesUploadSec">
                                <h5 className="mb-4">Media And Published</h5>
                                
                                <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
                                    {previews?.length !== 0 && previews?.map((image, index) => (
                                        <div className="uploadBoxWrapper mr-3 relative" key={index}>
                                            <span 
                                                className='absolute w-[20px] h-[20px] rounded-full overflow-hidden bg-red-700 -top-[5px] -right-[5px] flex items-center justify-center z-50 cursor-pointer' 
                                                onClick={() => removeImg(image, index)}
                                            >
                                                <IoMdClose className='text-white text-[17px]' />
                                            </span>
                                            <div className='uploadBox p-0 rounded-md overflow-hidden border border-dashed border-[rgba(0,0,0,0.3)] h-[150px] w-[100%] bg-gray-100 cursor-pointer hover:bg-gray-200 flex items-center justify-center flex-col relative'>
                                                <img src={image} className='w-100 h-full object-cover' alt="Hottest Brand Offer" />
                                            </div>
                                        </div>
                                    ))}

                                    <UploadBox 
                                        multiple={false} 
                                        name="images" 
                                        url="/api/hottestBrandOffers/uploadImages" 
                                        setPreviewsFun={setPreviewsFun} 
                                    />
                                </div>
                                
                                {isUploading && (
                                    <div className="d-flex justify-content-center mt-3">
                                        <CircularProgress size={24} />
                                        <span className="ml-2">Uploading...</span>
                                    </div>
                                )}

                                <br/>
                                <Button 
                                    type="submit" 
                                    disabled={isLoading || isUploading}
                                    className="btn-blue w-100 mt-3"
                                >
                                    {isLoading ? (
                                        <>
                                            <CircularProgress size={20} className="mr-2" />
                                            Adding...
                                        </>
                                    ) : (
                                        'Add Hottest Brand Offer'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddHottestBrandOffer;
