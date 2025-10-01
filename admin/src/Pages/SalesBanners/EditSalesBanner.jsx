import React, { useState, useContext, useEffect } from 'react';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { MyContext } from '../../App';
import UploadBox from '../../Components/UploadBox';
import { useNavigate, useParams } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import { FaCloudUploadAlt } from "react-icons/fa";
import { Button } from '@mui/material';
import { IoMdClose } from "react-icons/io";
import { deleteImages, editData, fetchDataFromApi } from '../../utils/api';

/**
 * Edit Sales Banner Component
 * Form for editing existing "Sales You Can't Miss" carousel banners
 */
export const EditSalesBanner = () => {
    const { id } = useParams();
    const [formFields, setFormFields] = useState({
        title: '',
        image: '',
        catId: '',
        subCatId: '',
        thirdsubCatId: '',
        isActive: true,
        sortOrder: 0
    });

    const [productCat, setProductCat] = useState('');
    const [productSubCat, setProductSubCat] = useState('');
    const [productThirdLevelCat, setProductThirdLevelCat] = useState('');
    const [previews, setPreviews] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const history = useNavigate();
    const context = useContext(MyContext);

    /**
     * Fetch banner data on component mount
     */
    useEffect(() => {
        if (id) {
            fetchBannerData();
        }
    }, [id]);

    /**
     * Fetch existing banner data
     */
    const fetchBannerData = async () => {
        try {
            setIsDataLoading(true);
            const res = await fetchDataFromApi(`/api/salesBanners/${id}`);
            if (res?.data) {
                const banner = res.data;
                setFormFields({
                    title: banner.title || '',
                    image: banner.image || '',
                    catId: banner.catId || '',
                    subCatId: banner.subCatId || '',
                    thirdsubCatId: banner.thirdsubCatId || '',
                    isActive: banner.isActive ?? true,
                    sortOrder: banner.sortOrder || 0
                });

                setProductCat(banner.catId || '');
                setProductSubCat(banner.subCatId || '');
                setProductThirdLevelCat(banner.thirdsubCatId || '');
                
                if (banner.image) {
                    setPreviews([banner.image]);
                }
            }
            setIsDataLoading(false);
        } catch (error) {
            console.error('Error fetching banner data:', error);
            context.alertBox("error", "Failed to load banner data");
            setIsDataLoading(false);
        }
    };

    /**
     * Handle input field changes
     */
    const onChangeInput = (e) => {
        const { name, value } = e.target;
        setFormFields(prev => ({
            ...prev,
            [name]: value
        }));
    };

    /**
     * Handle category selection
     */
    const handleChangeProductCat = (event) => {
        setProductCat(event.target.value);
        setFormFields(prev => ({ ...prev, catId: event.target.value }));
    };

    const handleChangeProductSubCat = (event) => {
        setProductSubCat(event.target.value);
        setFormFields(prev => ({ ...prev, subCatId: event.target.value }));
    };

    const handleChangeProductThirdLevelCat = (event) => {
        setProductThirdLevelCat(event.target.value);
        setFormFields(prev => ({ ...prev, thirdsubCatId: event.target.value }));
    };

    /**
     * Handle image previews
     */
    const setPreviewsFun = (previewsArr) => {
        setPreviews([]);
        setTimeout(() => {
            setPreviews(previewsArr);
            setFormFields(prev => ({ ...prev, image: previewsArr[0] }));
        }, 10);
    };

    /**
     * Remove image
     */
    const removeImg = (image, index) => {
        deleteImages(`/api/category/deteleImage?img=${image}`).then((res) => {
            setPreviews([]);
            setFormFields(prev => ({ ...prev, image: '' }));
        });
    };

    /**
     * Handle form submission
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Validation
        if (!formFields.title.trim()) {
            context.alertBox("error", "Please enter a banner title");
            setIsLoading(false);
            return false;
        }

        if (!formFields.image) {
            context.alertBox("error", "Please upload a banner image");
            setIsLoading(false);
            return false;
        }

        editData(`/api/salesBanners/${id}`, formFields).then((res) => {
            setTimeout(() => {
                setIsLoading(false);
                context.alertBox("success", "Sales banner updated successfully");
                history("/sales-banners/list");
            }, 2500);
        }).catch((error) => {
            setIsLoading(false);
            context.alertBox("error", "Failed to update sales banner");
        });
    };

    if (isDataLoading) {
        return (
            <section className='p-5 bg-gray-50'>
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3">Loading banner data...</span>
                </div>
            </section>
        );
    }

    return (
        <section className='p-5 bg-gray-50'>
            <h2 className="text-xl font-semibold mb-4">Edit Sales Banner</h2>
            <p className="text-gray-600 mb-6">Edit banner for the "Sales You Can't Miss" carousel section</p>
            
            <form className='form py-1 p-1 md:p-8 md:py-1 bg-white rounded-lg shadow' onSubmit={handleSubmit}>
                <div className='scroll max-h-[72vh] overflow-y-scroll pr-4 pt-4'>
                    
                    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mb-3 gap-5'>
                        
                        {/* Title Input (Required) */}
                        <div className='col'>
                            <h3 className='text-[14px] font-[500] mb-1 text-black'>Banner Title *</h3>
                            <input 
                                type="text" 
                                className='w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm' 
                                name="title" 
                                value={formFields.title} 
                                onChange={onChangeInput}
                                placeholder="e.g., Up to 70% Off"
                                required
                            />
                        </div>

                        {/* Category Selection */}
                        <div className='col'>
                            <h3 className='text-[14px] font-[500] mb-1 text-black'>Category</h3>
                            {context?.catData?.length !== 0 && (
                                <Select
                                    labelId="category-select-label"
                                    id="productCatDrop"
                                    size="small"
                                    className='w-full'
                                    value={productCat}
                                    onChange={handleChangeProductCat}
                                >
                                    <MenuItem value="" onClick={() => {
                                        setProductCat('');
                                        setFormFields(prev => ({ ...prev, catId: '' }));
                                    }}>NONE</MenuItem>
                                    {context.catData.map((cat, index) => (
                                        <MenuItem value={cat._id} key={index}>{cat.name}</MenuItem>
                                    ))}
                                </Select>
                            )}
                        </div>

                        {/* Sub Category Selection */}
                        <div className='col'>
                            <h3 className='text-[14px] font-[500] mb-1 text-black'>Sub Category</h3>
                            {context?.catData?.length !== 0 && (
                                <Select
                                    labelId="subcategory-select-label"
                                    id="productSubCatDrop"
                                    size="small"
                                    className='w-full'
                                    value={productSubCat}
                                    onChange={handleChangeProductSubCat}
                                >
                                    <MenuItem value="" onClick={() => {
                                        setProductSubCat('');
                                        setFormFields(prev => ({ ...prev, subCatId: '' }));
                                    }}>NONE</MenuItem>
                                    {context.catData.map((cat, index) =>
                                        cat?.children?.length !== 0 && cat.children.map((subCat, index_) => (
                                            <MenuItem value={subCat._id} key={`${index}-${index_}`}>
                                                {subCat.name}
                                            </MenuItem>
                                        ))
                                    )}
                                </Select>
                            )}
                        </div>

                    </div>

                    {/* Third Level Category and Sort Order */}
                    <div className='grid grid-cols-1 sm:grid-cols-2 mb-3 gap-5'>
                        <div className='col'>
                            <h3 className='text-[14px] font-[500] mb-1 text-black'>Third Level Category</h3>
                            {context?.catData?.length !== 0 && (
                                <Select
                                    labelId="thirdcategory-select-label"
                                    id="productThirdCatDrop"
                                    size="small"
                                    className='w-full'
                                    value={productThirdLevelCat}
                                    onChange={handleChangeProductThirdLevelCat}
                                >
                                    <MenuItem value="" onClick={() => {
                                        setProductThirdLevelCat('');
                                        setFormFields(prev => ({ ...prev, thirdsubCatId: '' }));
                                    }}>NONE</MenuItem>
                                    {context.catData.map((cat) =>
                                        cat?.children?.length !== 0 && cat.children.map((subCat) =>
                                            subCat?.children?.length !== 0 && subCat.children.map((thirdLevelCat, index) => (
                                                <MenuItem value={thirdLevelCat._id} key={index}>
                                                    {thirdLevelCat.name}
                                                </MenuItem>
                                            ))
                                        )
                                    )}
                                </Select>
                            )}
                        </div>

                        {/* Sort Order */}
                        <div className='col'>
                            <h3 className='text-[14px] font-[500] mb-1 text-black'>Sort Order</h3>
                            <input 
                                type="number" 
                                className='w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm' 
                                name="sortOrder" 
                                value={formFields.sortOrder} 
                                onChange={onChangeInput}
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <br />

                    {/* Image Upload Section */}
                    <h3 className='text-[18px] font-[500] mb-0 text-black'>Banner Image *</h3>
                    <br />
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
                                    <img src={image} className='w-100 h-full object-cover' alt="Sales Banner" />
                                </div>
                            </div>
                        ))}

                        <UploadBox 
                            multiple={false} 
                            name="images" 
                            url="/api/salesBanners/uploadImages" 
                            setPreviewsFun={setPreviewsFun} 
                        />
                    </div>
                </div>

                <br />
                <div className='w-[250px]'>
                    <Button type="submit" className="btn-blue btn-lg w-full flex gap-2" disabled={isLoading}>
                        {isLoading ? (
                            <CircularProgress color="inherit" size={24} />
                        ) : (
                            <>
                                <FaCloudUploadAlt className='text-[25px] text-white' />
                                Update Sales Banner
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </section>
    );
};
