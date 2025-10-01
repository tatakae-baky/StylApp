import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TextField, Button, Switch, FormControlLabel, Grid,
    Card, CardContent, Typography, CircularProgress, Breadcrumbs
} from '@mui/material';
import { Link } from 'react-router-dom';
import { FaCloudUploadAlt } from 'react-icons/fa';
import { IoMdClose } from "react-icons/io";
import { MyContext } from '../../App';
import { postData, deleteImages } from '../../utils/api';
import UploadBox from '../../Components/UploadBox';

const AddBrand = () => {
    const [formFields, setFormFields] = useState({
        name: '',
        description: '',
        website: '',
        email: '',
        isActive: true,
        isFeatured: false,
        metaTitle: '',
        metaDescription: '',
        establishedYear: '',
        image: '' // Add image field to track uploaded image
    });
    const [isLoading, setIsLoading] = useState(false);
    const [previews, setPreviews] = useState([]);

    const context = useContext(MyContext);
    const navigate = useNavigate();

    // Protect against brand owners accessing add brand page
    useEffect(() => {
        if (context?.userData?.role === 'BRAND_OWNER') {
            console.log('🚫 Brand owner trying to access add brand page - redirecting to dashboard');
            context.alertBox("error", "Access denied. Brand owners cannot create new brands.");
            navigate('/dashboard', { replace: true });
        }
    }, [context?.userData?.role, navigate]);

    const onChangeInput = (e) => {
        setFormFields({
            ...formFields,
            [e.target.name]: e.target.value
        });
    };

    const handleSwitchChange = (e) => {
        setFormFields({
            ...formFields,
            [e.target.name]: e.target.checked
        });
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
            setFormFields(prev => ({ ...prev, image: imgArr[0] }));
        }, 10);
    };

    /**
     * Remove image - following the exact pattern from SubCategorySections
     */
    const removeImg = (image, index) => {
        var imageArr = [...previews];
        deleteImages(`/api/brand/deteleImage?img=${image}`).then((res) => {
            imageArr.splice(index, 1);
            setPreviews([]);
            setTimeout(() => {
                setPreviews(imageArr);
                setFormFields(prev => ({ ...prev, image: imageArr[0] || '' }));
            }, 100);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Validation
        if (!formFields.name.trim()) {
            context.alertBox("error", "Please enter brand name");
            setIsLoading(false);
            return;
        }

        // Check if image is uploaded
        if (previews.length === 0) {
            context.alertBox("error", "Please upload a brand logo");
            setIsLoading(false);
            return;
        }

        try {
            // Submit brand data - the backend will use images from the global imagesArr
            const response = await postData('/api/brand/create', formFields);
            
            if (response.success) {
                context.alertBox("success", "Brand created successfully");
                // Add a small delay before navigation to ensure user sees the success message
                setTimeout(() => {
                    navigate('/brands');
                }, 1000);
            } else {
                context.alertBox("error", response.message);
            }
        } catch (error) {
            context.alertBox("error", "Failed to create brand");
        } finally {
            setIsLoading(false);
        }
    };

    // Additional protection against brand owners accessing this page
    if (context?.userData?.role === 'BRAND_OWNER') {
        return (
            <div className="right-content w-full">
                <div className="card shadow-md border-0 w-full bg-white p-4 text-center">
                    <div className="text-red-500 text-6xl mb-4">🚫</div>
                    <h3 className="font-bold text-xl mb-4 text-red-600">Access Denied</h3>
                    <p className="text-gray-600 mb-4">
                        Brand owners are not allowed to create new brands. You can only manage your own brand.
                    </p>
                    <Button variant="contained" onClick={() => navigate('/dashboard')}>
                        Go to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="right-content w-full">
            <div className="card shadow-md border-0 w-full bg-white p-4">
                <Breadcrumbs aria-label="breadcrumb" className="mb-4">
                    <Link to="/" className="text-decoration-none">
                        Dashboard
                    </Link>
                    <Link to="/brands" className="text-decoration-none">
                        Brands
                    </Link>
                    <Typography color="text.primary">Add Brand</Typography>
                </Breadcrumbs>

                <Card>
                    <CardContent>
                        <Typography variant="h5" component="h2" gutterBottom>
                            Add New Brand
                        </Typography>

                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={3}>
                                {/* Basic Information */}
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Brand Name *"
                                        name="name"
                                        value={formFields.name}
                                        onChange={onChangeInput}
                                        required
                                        size="small"
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Website URL"
                                        name="website"
                                        value={formFields.website}
                                        onChange={onChangeInput}
                                        placeholder="https://example.com"
                                        size="small"
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Brand Email *"
                                        name="email"
                                        type="email"
                                        value={formFields.email}
                                        onChange={onChangeInput}
                                        required
                                        placeholder="orders@brand.com"
                                        size="small"
                                        helperText="Email for order notifications"
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={4}
                                        label="Description"
                                        name="description"
                                        value={formFields.description}
                                        onChange={onChangeInput}
                                        size="small"
                                    />
                                </Grid>

                                {/* Additional Information */}
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Established Year"
                                        name="establishedYear"
                                        type="number"
                                        value={formFields.establishedYear}
                                        onChange={onChangeInput}
                                        size="small"
                                    />
                                </Grid>

                                {/* SEO Fields */}
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Meta Title"
                                        name="metaTitle"
                                        value={formFields.metaTitle}
                                        onChange={onChangeInput}
                                        size="small"
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={2}
                                        label="Meta Description"
                                        name="metaDescription"
                                        value={formFields.metaDescription}
                                        onChange={onChangeInput}
                                        size="small"
                                    />
                                </Grid>

                                {/* Status Controls */}
                                <Grid item xs={12} md={6}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formFields.isActive}
                                                onChange={handleSwitchChange}
                                                name="isActive"
                                                color="primary"
                                            />
                                        }
                                        label="Active"
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formFields.isFeatured}
                                                onChange={handleSwitchChange}
                                                name="isFeatured"
                                                color="secondary"
                                            />
                                        }
                                        label="Featured"
                                    />
                                </Grid>

                                {/* Image Upload */}
                                <Grid item xs={12}>
                                    <Typography variant="h6" gutterBottom>
                                        Brand Logo *
                                    </Typography>
                                    
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
                                                    <img src={image} className='w-100 h-full object-cover' alt="Brand Logo" />
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
                                </Grid>

                                {/* Submit Button */}
                                <Grid item xs={12}>
                                    <div className="flex gap-3">
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            color="primary"
                                            size="large"
                                            disabled={isLoading}
                                            startIcon={isLoading ? <CircularProgress size={20} /> : <FaCloudUploadAlt />}
                                        >
                                            {isLoading ? 'Creating...' : 'Create Brand'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outlined"
                                            color="secondary"
                                            size="large"
                                            onClick={() => navigate('/brands')}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </Grid>
                            </Grid>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AddBrand;
