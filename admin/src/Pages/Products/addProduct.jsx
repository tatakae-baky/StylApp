import React, { useContext, useEffect, useState } from 'react'
import Rating from '@mui/material/Rating';
import UploadBox from '../../Components/UploadBox';
import CustomDropdown from '../../Components/CustomDropdown';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { IoMdClose } from "react-icons/io";
import { Button } from '@mui/material';
import { FaCloudUploadAlt } from "react-icons/fa";
import { MyContext } from '../../App';
import { deleteImages, fetchDataFromApi, postData } from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';


const AddProduct = () => {

    const [formFields, setFormFields] = useState({
        name: "",
        description: "",
        images: [],
        brand: "",
        brandName: "",
        price: "",
        oldPrice: "",
        category: "",
        catName: "",
        catId: "",
        subCatId: "",
        subCat: "",
        thirdsubCat: "",
        thirdsubCatId: "",
        countInStock: 0,
        rating: "",
        isFeatured: false,
        isPopular: false,
        discount: "",
        size: []

    })


    const [productCat, setProductCat] = React.useState('');
    const [productSubCat, setProductSubCat] = React.useState('');
    const [productBrand, setProductBrand] = React.useState('');
    const [productFeatured, setProductFeatured] = React.useState('');
    const [productPopular, setProductPopular] = React.useState('');
    const [productSize, setProductSize] = React.useState([]);
    const [productSizeData, setProductSizeData] = React.useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [productThirdLavelCat, setProductThirdLavelCat] = useState('');

    const [previews, setPreviews] = useState([]);

    const [checkedSwitch, setCheckedSwitch] = useState(false);


    const history = useNavigate();

    const context = useContext(MyContext);


    useEffect(() => {
        fetchDataFromApi("/api/product/productSize/get").then((res) => {
            if (res?.error === false) {
                setProductSizeData(res?.data);
            }
        })
    }, [])

    // Auto-set brand for brand owners
    useEffect(() => {
        if (context.userData?.role === 'BRAND_OWNER' && context.userData?.brandId && context.brandData?.length > 0) {
            const userBrand = context.brandData.find(brand => brand._id === context.userData.brandId);
            if (userBrand) {
                setProductBrand(context.userData.brandId);
                formFields.brand = context.userData.brandId;
                formFields.brandName = userBrand.name;
            }
        }
    }, [context.userData, context.brandData]);


    const handleChangeProductCat = (event) => {
        setProductCat(event.target.value);
        formFields.catId = event.target.value
        formFields.category = event.target.value

    };

    const selectCatByName = (name) => {
        formFields.catName = name
    }

    const handleChangeProductSubCat = (event) => {
        setProductSubCat(event.target.value);
        formFields.subCatId = event.target.value
    };

    const selectSubCatByName = (name) => {
        formFields.subCat = name
    }

    const handleChangeProductBrand = (event) => {
        setProductBrand(event.target.value);
        formFields.brand = event.target.value
        // Find brand name from brandData and set brandName
        const selectedBrand = context?.brandData?.find(brand => brand._id === event.target.value);
        if (selectedBrand) {
            formFields.brandName = selectedBrand.name;
        }
    };

    const handleChangeProductThirdLavelCat = (event) => {
        setProductThirdLavelCat(event.target.value);
        formFields.thirdsubCatId = event.target.value
    };

    const selectSubCatByThirdLavel = (name) => {
        formFields.thirdsubCat = name
    }


    const handleChangeProductFeatured = (event) => {
        setProductFeatured(event.target.value);
        formFields.isFeatured = event.target.value
    };

    const handleChangeProductPopular = (event) => {
        setProductPopular(event.target.value);
        formFields.isPopular = event.target.value
    };

    const handleChangeProductSize = (event) => {

        const {
            target: { value },
        } = event;
        setProductSize(
            // On autofill we get a stringified value.
            typeof value === "string" ? value.split(",") : value
        );

        formFields.size = value;
    };


    const onChangeInput = (e) => {
        const { name, value } = e.target;
        setFormFields(() => {
            return {
                ...formFields,
                [name]: value
            }
        })
    }

    const onChangeRating = (e) => {
        setFormFields((formFields) => (
            {
                ...formFields,
                rating: e.target.value
            }
        ))
    }


    const setPreviewsFun = (previewsArr) => {
        const imgArr = previews;
        for (let i = 0; i < previewsArr.length; i++) {
            imgArr.push(previewsArr[i])
        }

        setPreviews([])
        setTimeout(() => {
            setPreviews(imgArr)
            formFields.images = imgArr
        }, 10);
    }


    const removeImg = (image, index) => {
        var imageArr = [];
        imageArr = previews;
        deleteImages(`/api/product/deteleImage?img=${image}`).then((res) => {
            imageArr.splice(index, 1);

            setPreviews([]);
            setTimeout(() => {
                setPreviews(imageArr);
                formFields.images = imageArr
            }, 100);

        })
    }
    const handleSubmitg = (e) => {
        e.preventDefault(0);

        console.log(formFields)
        if (formFields.name === "") {
            context.alertBox("error", "Please enter product name");
            return false;
        }

        if (formFields.description === "") {
            context.alertBox("error", "Please enter product description");
            return false;
        }



        if (formFields?.catId === "") {
            context.alertBox("error", "Please select product category");
            return false;
        }



        if (formFields?.price === "") {
            context.alertBox("error", "Please enter product price");
            return false;
        }


        if (formFields?.oldPrice === "") {
            context.alertBox("error", "Please enter product old Price");
            return false;
        }


        if (formFields?.brand === "" && context.userData?.role !== 'BRAND_OWNER') {
            context.alertBox("error", "Please select product brand");
            return false;
        }


        if (formFields?.discount === "") {
            context.alertBox("error", "Please enter product discount");
            return false;
        }




        if (formFields?.rating === "") {
            context.alertBox("error", "Please enter  product rating");
            return false;
        }


        if (previews?.length === 0) {
            context.alertBox("error", "Please select product images");
            return false;
        }


        setIsLoading(true);

        postData("/api/product/create", formFields).then((res) => {

            if (res?.error === false) {
                context.alertBox("success", res?.message);
                setTimeout(() => {
                    setIsLoading(false);
                    context.setIsOpenFullScreenPanel({
                        open: false,
                    })
                    history("/products");
                }, 1000);
            } else {
                setIsLoading(false);
                context.alertBox("error", res?.message);
            }
        })
    }

    return (
        <div className="bg-white border border-gray-200 h-full">
            <form className='p-6 h-full' onSubmit={handleSubmitg}>
                <div className='p-4'>

                    {/* Product Basic Information */}
                    <div className="mb-6">
                        <h3 className="text-[16px] font-[600] text-gray-900 mb-4">Basic Information</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[14px] font-[500] mb-1 text-gray-900">
                                    Product Name <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    className="w-full h-[40px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-md p-3 text-sm" 
                                    name="name" 
                                    value={formFields.name} 
                                    onChange={onChangeInput}
                                    placeholder="Enter product name"
                                />
                            </div>
                            <div>
                                <label className="block text-[14px] font-[500] mb-1 text-gray-900">
                                    Product Brand <span className="text-red-500">*</span>
                                </label>
                                {context.userData?.role === 'BRAND_OWNER' ? (
                                    <input 
                                        type="text" 
                                        className="w-full h-[40px] border border-gray-300 rounded-md p-3 text-sm bg-gray-100" 
                                        value={formFields.brandName || ''} 
                                        readOnly 
                                        placeholder="Your brand will be auto-selected"
                                    />
                                ) : (
                                    <CustomDropdown
                                        options={context?.brandData?.map(brand => ({ value: brand._id, label: brand.name })) || []}
                                        value={productBrand}
                                        onChange={(value) => {
                                            setProductBrand(value);
                                            formFields.brand = value;
                                            const selectedBrand = context?.brandData?.find(brand => brand._id === value);
                                            if (selectedBrand) {
                                                formFields.brandName = selectedBrand.name;
                                            }
                                        }}
                                        placeholder="Select Brand"
                                        label=""
                                        required
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Product Description */}
                    <div className="mb-6">
                        <label className="block text-[14px] font-[500] mb-1 text-gray-900">
                            Product Description <span className="text-red-500">*</span>
                        </label>
                        <textarea 
                            className="w-full h-[120px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-md p-3 text-sm resize-none" 
                            name="description" 
                            value={formFields.description} 
                            onChange={onChangeInput}
                            placeholder="Enter detailed product description"
                        />
                    </div>



                    {/* Product Categories */}
                    <div className="mb-6">
                        <h3 className="text-[16px] font-[600] text-gray-900 mb-4">Categories & Classification</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <CustomDropdown
                                options={context?.catData?.map(cat => ({ value: cat._id, label: cat.name })) || []}
                                value={productCat}
                                onChange={(value) => {
                                    setProductCat(value);
                                    formFields.catId = value;
                                    formFields.category = value;
                                    const selectedCat = context?.catData?.find(cat => cat._id === value);
                                    if (selectedCat) {
                                        formFields.catName = selectedCat.name;
                                    }
                                }}
                                placeholder="Select Category"
                                label="Product Category"
                                required
                            />

                            <CustomDropdown
                                options={(() => {
                                    const subCategories = [];
                                    context?.catData?.forEach(cat => {
                                        if (cat?.children?.length > 0) {
                                            cat.children.forEach(subCat => {
                                                subCategories.push({ value: subCat._id, label: subCat.name });
                                            });
                                        }
                                    });
                                    return subCategories;
                                })()}
                                value={productSubCat}
                                onChange={(value) => {
                                    setProductSubCat(value);
                                    formFields.subCatId = value;
                                    const selectedSubCat = context?.catData?.flatMap(cat => cat.children || []).find(subCat => subCat._id === value);
                                    if (selectedSubCat) {
                                        formFields.subCat = selectedSubCat.name;
                                    }
                                }}
                                placeholder="Select Sub Category"
                                label="Product Sub Category"
                            />

                            <CustomDropdown
                                options={(() => {
                                    const thirdLevelCategories = [];
                                    context?.catData?.forEach(cat => {
                                        if (cat?.children?.length > 0) {
                                            cat.children.forEach(subCat => {
                                                if (subCat?.children?.length > 0) {
                                                    subCat.children.forEach(thirdCat => {
                                                        thirdLevelCategories.push({ value: thirdCat._id, label: thirdCat.name });
                                                    });
                                                }
                                            });
                                        }
                                    });
                                    return thirdLevelCategories;
                                })()}
                                value={productThirdLavelCat}
                                onChange={(value) => {
                                    setProductThirdLavelCat(value);
                                    formFields.thirdsubCatId = value;
                                    const selectedThirdCat = context?.catData?.flatMap(cat => 
                                        cat.children?.flatMap(subCat => subCat.children || []) || []
                                    ).find(thirdCat => thirdCat._id === value);
                                    if (selectedThirdCat) {
                                        formFields.thirdsubCat = selectedThirdCat.name;
                                    }
                                }}
                                placeholder="Select Third Level Category"
                                label="Product Third Level Category"
                            />
                        </div>
                    </div>

                    {/* Product Pricing */}
                    <div className="mb-6">
                        <h3 className="text-[16px] font-[600] text-gray-900 mb-4">Pricing Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-[14px] font-[500] mb-1 text-gray-900">
                                    Product Price <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type="number" 
                                    className="w-full h-[40px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-md p-3 text-sm" 
                                    name="price" 
                                    value={formFields.price} 
                                    onChange={onChangeInput}
                                    placeholder="Enter current price"
                                />
                            </div>

                            <div>
                                <label className="block text-[14px] font-[500] mb-1 text-gray-900">
                                    Product Old Price <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type="number" 
                                    className="w-full h-[40px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-md p-3 text-sm" 
                                    name="oldPrice" 
                                    value={formFields.oldPrice} 
                                    onChange={onChangeInput}
                                    placeholder="Enter original price"
                                />
                            </div>

                            <div>
                                <label className="block text-[14px] font-[500] mb-1 text-gray-900">
                                    Product Discount <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type="number" 
                                    className="w-full h-[40px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-md p-3 text-sm" 
                                    name="discount" 
                                    value={formFields.discount} 
                                    onChange={onChangeInput}
                                    placeholder="Enter discount percentage"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Product Features */}
                    <div className="mb-6">
                        <h3 className="text-[16px] font-[600] text-gray-900 mb-4">Product Features</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <CustomDropdown
                                options={[
                                    { value: true, label: 'Yes' },
                                    { value: false, label: 'No' }
                                ]}
                                value={productFeatured}
                                onChange={(value) => {
                                    setProductFeatured(value);
                                    formFields.isFeatured = value;
                                }}
                                placeholder="Select Featured Status"
                                label="Is Featured?"
                            />

                            <CustomDropdown
                                options={[
                                    { value: true, label: 'Yes' },
                                    { value: false, label: 'No' }
                                ]}
                                value={productPopular}
                                onChange={(value) => {
                                    setProductPopular(value);
                                    formFields.isPopular = value;
                                }}
                                placeholder="Select Popular Status"
                                label="Is Popular?"
                            />

                            <CustomDropdown
                                options={productSizeData?.map(item => ({ value: item.name, label: item.name })) || []}
                                value={productSize}
                                onChange={(value) => {
                                    setProductSize(value);
                                    formFields.size = value;
                                }}
                                placeholder="Select Sizes"
                                label="Product Size"
                                multiple
                            />
                        </div>
                    </div>




                    {/* Product Rating */}
                    <div className="mb-6">
                        <h3 className="text-[16px] font-[600] text-gray-900 mb-4">Product Rating</h3>
                        <div className="flex items-center gap-4">
                            <label className="text-[14px] font-[500] text-gray-900">Rating:</label>
                            <Rating 
                                name="product-rating" 
                                defaultValue={1} 
                                onChange={onChangeRating}
                                size="large"
                            />
                        </div>
                    </div>

                    {/* Media & Images */}
                    <div className="mb-6">
                        <h3 className="text-[16px] font-[600] text-gray-900 mb-4">Media & Images</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {previews?.length !== 0 && previews?.map((image, index) => (
                                <div className="relative group" key={index}>
                                    <span 
                                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 flex items-center justify-center z-10 cursor-pointer hover:bg-red-700 transition-colors shadow-lg"
                                        onClick={() => removeImg(image, index)}
                                        title="Remove image"
                                    >
                                        <IoMdClose className="text-white text-sm" />
                                    </span>
                                    <div className="w-full aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                                        <img 
                                            src={image} 
                                            alt={`Product ${index + 1}`}
                                            className="w-full h-full object-contain p-2"
                                        />
                                    </div>
                                </div>
                            ))}
                            <div className="w-full aspect-square">
                                <UploadBox 
                                    multiple={true} 
                                    name="images" 
                                    url="/api/product/uploadImages" 
                                    setPreviewsFun={setPreviewsFun}
                                    className="w-full h-full"
                                />
                            </div>
                        </div>

                        {/* Submit Button - positioned right after Media & Images */}
                        <div className="mt-4 mb-4 flex justify-start">
                            <button 
                                type="submit" 
                                className="bg-black text-white py-3 px-8 text-[16px] font-[600] hover:bg-gray-800 transition-all duration-200 flex items-center justify-center gap-2 rounded-md"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <CircularProgress size={20} sx={{ color: 'white' }} />
                                        <span>Publishing...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Publish and View</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                </div>

            </form>
        </div>
    )
}

export default AddProduct;
