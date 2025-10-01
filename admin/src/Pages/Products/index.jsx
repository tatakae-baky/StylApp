import React, { useContext, useEffect, useState } from 'react';
import { Button, useTheme } from "@mui/material";
import { IoMdAdd } from "react-icons/io";
import Rating from '@mui/material/Rating';
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Checkbox from "@mui/material/Checkbox";
import { Link } from "react-router-dom";
import Progress from "../../Components/ProgressBar";
import { AiOutlineEdit } from "react-icons/ai";
import { FaRegEye } from "react-icons/fa6";
import { GoTrash } from "react-icons/go";
import SearchBox from '../../Components/SearchBox';
import { MyContext } from '../../App';
import { fetchDataFromApi, deleteData, deleteMultipleData } from '../../utils/api';
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import CircularProgress from '@mui/material/CircularProgress';

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

// Import currency utility for Bangladesh Taka
const formatCurrencyBD = (amount) => {
  if (!amount && amount !== 0) return 'Tk 0';
  return `Tk ${amount?.toLocaleString('en-BD')}`;
};


const label = { inputProps: { "aria-label": "Checkbox demo" } };

const columns = [
    { id: "product", label: "PRODUCT", minWidth: 150 },
    { id: "category", label: "CATEGORY", minWidth: 100 },
    {
        id: "subcategory",
        label: "SUB CATEGORY",
        minWidth: 150,
    },
    {
        id: "price",
        label: "PRICE",
        minWidth: 130,
    },
    {
        id: "sales",
        label: "SALES",
        minWidth: 100,
    },
    {
        id: "stock",
        label: "STOCK",
        minWidth: 100,
    },
    {
        id: "rating",
        label: "RATING",
        minWidth: 100,
    },
    {
        id: "action",
        label: "ACTION",
        minWidth: 120,
    },
];

export const Products = () => {
    const [productCat, setProductCat] = React.useState('');
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const [productData, setProductData] = useState([]);
    const [productTotalData, setProductTotalData] = useState([]);

    const [productSubCat, setProductSubCat] = React.useState('');
    const [productThirdLavelCat, setProductThirdLavelCat] = useState('');
    const [sortedIds, setSortedIds] = useState([]);
    const [isLoading, setIsloading] = useState(false);

    const [pageOrder, setPageOrder] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");

    const [photos, setPhotos] = useState([]);
    const [open, setOpen] = useState(false);

    const context = useContext(MyContext);

    useEffect(() => {
        // Avoid fetching global products for brand owners before userData is ready
        const role = context?.userData?.role;
        const brandId = context?.userData?.brandId;
        
        // Don't run until we have user data
        if (!role) {
            return;
        }
        
        if (role === 'BRAND_OWNER' && !brandId) return; // wait for brand link
        getProducts(page, rowsPerPage, role, brandId);
    }, [context?.isOpenFullScreenPanel, page, rowsPerPage, context?.userData?.role, context?.userData?.brandId])



    useEffect(() => {
        // Filter orders based on search query
        if (searchQuery !== "") {
            const filteredOrders = productTotalData?.totalProducts?.filter((product) =>
                product._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product?.catName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product?.subCat?.includes(searchQuery)
            );
            setProductData({
                error: false,
                success: true,
                products: filteredOrders,
                total: filteredOrders?.length,
                page: parseInt(page),
                totalPages: Math.ceil(filteredOrders?.length / rowsPerPage),
                totalCount: productData?.totalCount
            });

        } else {
            const role = context?.userData?.role;
            const brandId = context?.userData?.brandId;
            getProducts(page, rowsPerPage, role, brandId);
        }

    }, [searchQuery])


    // Handler to toggle all checkboxes
    const handleSelectAll = (e) => {
        const isChecked = e.target.checked;

        // Update all items' checked status
        const updatedItems = productData?.products?.map((item) => ({
            ...item,
            checked: isChecked,
        }));
        setProductData({
            error: false,
            success: true,
            products: updatedItems,
            total: updatedItems?.length,
            page: parseInt(page),
            totalPages: Math.ceil(updatedItems?.length / rowsPerPage),
            totalCount: productData?.totalCount
        });

        // Update the sorted IDs state
        if (isChecked) {
            const ids = updatedItems.map((item) => item._id).sort((a, b) => a - b);
            setSortedIds(ids);
        } else {
            setSortedIds([]);
        }
    };


    // Handler to toggle individual checkboxes
    const handleCheckboxChange = (e, id, index) => {

        const updatedItems = productData?.products?.map((item) =>
            item._id === id ? { ...item, checked: !item.checked } : item
        );
        setProductData({
            error: false,
            success: true,
            products: updatedItems,
            total: updatedItems?.length,
            page: parseInt(page),
            totalPages: Math.ceil(updatedItems?.length / rowsPerPage),
            totalCount: productData?.totalCount
        });



        // Update the sorted IDs state
        const selectedIds = updatedItems
            .filter((item) => item.checked)
            .map((item) => item._id)
            .sort((a, b) => a - b);
        setSortedIds(selectedIds);
    };


    const getProducts = async (page, limit, role, brandId) => {
        setIsloading(true)
        
        // Don't fetch anything if role is not available yet
        if (!role) {
            setIsloading(false);
            return;
        }
        
        const isBrandOwner = role === 'BRAND_OWNER';
        // If brand owner and brand not yet available, avoid global fetch
        if (isBrandOwner && !brandId) {
            setIsloading(false);
            return;
        }
        const url = isBrandOwner
          ? `/api/brand/${brandId}/products?page=${page + 1}&perPage=${limit}`
          : `/api/product/getAllProducts?page=${page + 1}&limit=${limit}`;
        fetchDataFromApi(url).then((res) => {
            setProductData(res)

            setProductTotalData(res)
            setIsloading(false)

            let arr = [];

            for (let i = 0; i < res?.products?.length; i++) {
                arr.push({
                    src: res?.products[i]?.images[0]
                })
            }

            setPhotos(arr);

        })
    }

    const handleChangeProductCat = (event) => {
        if (event.target.value !== null) {
            setProductCat(event.target.value);
            setProductSubCat('');
            setProductThirdLavelCat('');
            setIsloading(true)
            fetchDataFromApi(`/api/product/getAllProductsByCatId/${event.target.value}`).then((res) => {
                if (res?.error === false) {
                    setProductData({
                        error: false,
                        success: true,
                        products: res?.products,
                        total: res?.products?.length,
                        page: parseInt(page),
                        totalPages: Math.ceil(res?.products?.length / rowsPerPage),
                        totalCount: res?.products?.length
                    });

                    setTimeout(() => {
                        setIsloading(false)
                    }, 300);
                }
            })
        } else {
            const role = context?.userData?.role;
            const brandId = context?.userData?.brandId;
            getProducts(0, 50, role, brandId);
            setProductSubCat('');
            setProductCat(event.target.value);
            setProductThirdLavelCat('');
        }

    };


    const handleChangeProductSubCat = (event) => {
        if (event.target.value !== null) {
            setProductSubCat(event.target.value);
            setProductCat('');
            setProductThirdLavelCat('');
            setIsloading(true)
            fetchDataFromApi(`/api/product/getAllProductsBySubCatId/${event.target.value}`).then((res) => {
                if (res?.error === false) {
                    setProductData({
                        error: false,
                        success: true,
                        products: res?.products,
                        total: res?.products?.length,
                        page: parseInt(page),
                        totalPages: Math.ceil(res?.products?.length / rowsPerPage),
                        totalCount: res?.products?.length
                    });
                    setTimeout(() => {
                        setIsloading(false)
                    }, 500);
                }
            })
        } else {
            setProductSubCat(event.target.value);
            const role = context?.userData?.role;
            const brandId = context?.userData?.brandId;
            getProducts(0, 50, role, brandId);
            setProductCat('');
            setProductThirdLavelCat('');
        }
    };

    const handleChangeProductThirdLavelCat = (event) => {
        if (event.target.value !== null) {
            setProductThirdLavelCat(event.target.value);
            setProductCat('');
            setProductSubCat('');
            setIsloading(true)
            fetchDataFromApi(`/api/product/getAllProductsByThirdLavelCat/${event.target.value}`).then((res) => {
                console.log(res)
                if (res?.error === false) {
                    setProductData({
                        error: false,
                        success: true,
                        products: res?.products,
                        total: res?.products?.length,
                        page: parseInt(page),
                        totalPages: Math.ceil(res?.products?.length / rowsPerPage),
                        totalCount: res?.products?.length
                    });
                    setTimeout(() => {
                        setIsloading(false)
                    }, 300);
                }
            })
        } else {
            setProductThirdLavelCat(event.target.value);
            const role = context?.userData?.role;
            const brandId = context?.userData?.brandId;
            getProducts(0, 50, role, brandId);
            setProductCat('');
            setProductSubCat('');
        }
    };

    const handleChangeRowsPerPage = (event) => {
        const newRowsPerPage = event.target.value;
        if (newRowsPerPage === -1) {
            // Show all products
            setRowsPerPage(productData?.totalPages * rowsPerPage || 1000);
        } else {
            setRowsPerPage(+newRowsPerPage);
        }
        setPage(0);
    };


    const deleteProduct = (id) => {
        if (context?.userData?.role === "ADMIN") {
            deleteData(`/api/product/${id}`).then((res) => {
                const role = context?.userData?.role;
                const brandId = context?.userData?.brandId;
                getProducts(page, rowsPerPage, role, brandId);
                context.alertBox("success", "Product deleted");

            })
        } else {
            context.alertBox("error", "Only admin can delete data");
        }
    }


    const deleteMultipleProduct = () => {

        if (sortedIds.length === 0) {
            context.alertBox('error', 'Please select items to delete.');
            return;
        }


        try {
            deleteMultipleData(`/api/product/deleteMultiple`, {
                data: { ids: sortedIds },
            }).then((res) => {
                const role = context?.userData?.role;
                const brandId = context?.userData?.brandId;
                getProducts(page, rowsPerPage, role, brandId);
                context.alertBox("success", "Product deleted");
                setSortedIds([]);

            })

        } catch (error) {
            context.alertBox('error', 'Error deleting items.');
        }


    }



    const handleChangePage = (event, newPage) => {
        const role = context?.userData?.role;
        const brandId = context?.userData?.brandId;
        getProducts(newPage, rowsPerPage, role, brandId);
        setPage(newPage);
    };

    return (
        <div className="bg-white border border-gray-200">
            {/* Header Section */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h2 className="text-[20px] font-[600] text-gray-900 mb-2">Products Management</h2>
                        <p className="text-[14px] text-gray-600">
                            Manage your <span className="font-bold text-[#FF2E4D]">{productData?.products?.length}</span>{" "}
                            products.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {sortedIds?.length !== 0 && (
                            <Button 
                                variant="contained" 
                                size="small" 
                                color="error"
                                onClick={deleteMultipleProduct}
                                className="!text-[12px] !py-2 !px-4"
                            >
                                Delete ({sortedIds.length})
                            </Button>
                        )}
                        <Button 
                            className="btn-blue !text-white !text-[12px] !py-2 !px-4"
                            onClick={() => context.setIsOpenFullScreenPanel({
                                open: true,
                                model: 'Add Product'
                            })}
                        >
                            <IoMdAdd className="mr-1" />
                            Add Product
                        </Button>
                    </div>
                </div>
            </div>


            {/* Filters Section */}
            <div className="p-6 pb-0 border-b border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                        <label className="block text-[13px] font-[600] text-gray-700 mb-2">Category</label>
                        {context?.catData?.length !== 0 && (
                                            <Select
                                size="small"
                                className='w-full'
                                value={productCat}
                                onChange={handleChangeProductCat}
                                displayEmpty
                            >
                                <MenuItem value={null}>All Categories</MenuItem>
                                {context?.catData?.map((cat, index) => (
                                    <MenuItem key={index} value={cat?._id}>{cat?.name}</MenuItem>
                                ))}
                            </Select>
                        )}
                    </div>

                    <div>
                        <label className="block text-[13px] font-[600] text-gray-700 mb-2">Sub Category</label>
                        {context?.catData?.length !== 0 && (
                            <Select
                                size="small"
                                className='w-full'
                                value={productSubCat}
                                onChange={handleChangeProductSubCat}
                                displayEmpty
                            >
                                <MenuItem value={null}>All Sub Categories</MenuItem>
                                {context?.catData?.map((cat, index) => 
                                    cat?.children?.length !== 0 && cat?.children?.map((subCat, index_) => (
                                        <MenuItem key={index_} value={subCat?._id}>
                                            {subCat?.name}
                                        </MenuItem>
                                    ))
                                )}
                            </Select>
                        )}
                    </div>

                    <div>
                        <label className="block text-[13px] font-[600] text-gray-700 mb-2">Third Level Category</label>
                        {context?.catData?.length !== 0 && (
                            <Select
                                size="small"
                                className='w-full'
                                value={productThirdLavelCat}
                                onChange={handleChangeProductThirdLavelCat}
                                displayEmpty
                            >
                                <MenuItem value={null}>All Third Level</MenuItem>
                                {context?.catData?.map((cat) => 
                                    cat?.children?.length !== 0 && cat?.children?.map((subCat) => 
                                        subCat?.children?.length !== 0 && subCat?.children?.map((thirdLavelCat, index) => (
                                            <MenuItem key={index} value={thirdLavelCat?._id}>
                                                {thirdLavelCat?.name}
                                            </MenuItem>
                                        ))
                                    )
                                )}
                            </Select>
                        )}
                    </div>

                    <div>
                        <label className="block text-[13px] font-[600] text-gray-700 mb-2">Search Products</label>
                        <SearchBox
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            setPageOrder={setPageOrder}
                        />
                    </div>
                </div>
            </div>

            {/* Products Content */}
            <div className="p-6 pt-0">
                {/* Mobile/Tablet View - Card Layout */}
                <div className="lg:hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center w-full min-h-[400px]">
                            <CircularProgress color="inherit" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Select All Checkbox */}
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <Checkbox 
                                    {...label} 
                                    size="small"
                                    onChange={handleSelectAll}
                                    checked={productData?.products?.length > 0 ? productData?.products?.every((item) => item.checked) : false}
                                />
                                <span className="text-[14px] font-[600] text-gray-700">
                                    Select All ({productData?.products?.length || 0} products)
                                </span>
                            </div>

                            {/* Product Cards */}
                            {productData?.products?.length !== 0 && productData?.products?.map((product, index) => (
                                <div key={index} className={`border border-gray-200 p-4 rounded-lg ${product.checked ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}>
                                    <div className="flex items-start gap-4">
                                        <Checkbox 
                                            {...label} 
                                            size="small" 
                                            checked={product.checked === true}
                                            onChange={(e) => handleCheckboxChange(e, product._id, index)}
                                        />
                                        
                                        <div className="flex-1">
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className="w-16 h-16 rounded-md overflow-hidden group cursor-pointer flex-shrink-0" onClick={() => setOpen(true)}>
                                                    <LazyLoadImage
                                                        alt="product"
                                                        effect="blur"
                                                        src={product?.images[0]}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-all"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-[600] text-[14px] leading-5 mb-1">
                                                        <Link to={`/product/${product?._id}`} className="hover:text-primary">
                                                            {product?.name}
                                                        </Link>
                                                    </h3>
                                                    <p className="text-[12px] text-gray-600 mb-2">
                                                        {typeof product?.brand === 'object' ? product?.brand?.name : product?.brand}
                                                    </p>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-[12px] bg-gray-100 px-2 py-1 rounded">
                                                            {product?.catName}
                                                        </span>
                                                        {product?.subCat && (
                                                            <span className="text-[12px] bg-gray-100 px-2 py-1 rounded">
                                                                {product?.subCat}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-3">
                                                <div>
                                                    <span className="text-[12px] text-gray-500">Price:</span>
                                                    <div className="flex flex-col">
                                                        {product?.oldPrice && (
                                                            <span className="text-[12px] line-through text-gray-500">
                                                                {formatCurrencyBD(product?.oldPrice)}
                                                            </span>
                                                        )}
                                                        <span className="text-[14px] font-[600] text-primary">
                                                            {formatCurrencyBD(product?.price)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-[12px] text-gray-500">Stock:</span>
                                                    <p className="text-[14px] font-[600] text-primary">
                                                        {product?.countInStock}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-[12px] text-gray-500">Sales:</span>
                                                    <p className="text-[14px] font-[600]">
                                                        {product?.sale}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-[12px] text-gray-500">Rating:</span>
                                                    <Rating name="half-rating" size="small" defaultValue={product?.rating} readOnly />
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 pt-3 border-t">
                                                <Button 
                                                    size="small"
                                                    variant="outlined"
                                                    onClick={() => context.setIsOpenFullScreenPanel({
                                                        open: true,
                                                        model: 'Edit Product',
                                                        id: product?._id
                                                    })}
                                                    className="!text-[11px] !py-1 !px-2"
                                                >
                                                    <AiOutlineEdit className="mr-1" />
                                                    Edit
                                                </Button>
                                                <Link to={`/product/${product?._id}`}>
                                                    <Button 
                                                        size="small"
                                                        variant="outlined"
                                                        className="!text-[11px] !py-1 !px-2"
                                                    >
                                                        <FaRegEye className="mr-1" />
                                                        View
                                                    </Button>
                                                </Link>
                                                <Button 
                                                    size="small"
                                                    variant="outlined"
                                                    color="error"
                                                    onClick={() => deleteProduct(product?._id)}
                                                    className="!text-[11px] !py-1 !px-2"
                                                >
                                                    <GoTrash className="mr-1" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Desktop View - Compact Table */}
                <div className="hidden lg:block">
                    {isLoading ? (
                        <div className="flex items-center justify-center w-full min-h-[400px]">
                            <CircularProgress color="inherit" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 w-12">
                                            <Checkbox 
                                                {...label} 
                                                size="small"
                                                onChange={handleSelectAll}
                                                checked={productData?.products?.length > 0 ? productData?.products?.every((item) => item.checked) : false}
                                            />
                                        </th>
                                        <th scope="col" className="px-4 py-3">Product</th>
                                        <th scope="col" className="px-4 py-3">Category</th>
                                        <th scope="col" className="px-4 py-3">Price</th>
                                        <th scope="col" className="px-4 py-3">Stock</th>
                                        <th scope="col" className="px-4 py-3">Sales</th>
                                        <th scope="col" className="px-4 py-3">Rating</th>
                                        <th scope="col" className="px-4 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productData?.products?.length !== 0 && productData?.products?.map((product, index) => (
                                        <tr key={index} className={`bg-white border-b hover:bg-gray-50 ${product.checked ? 'bg-blue-50' : ''}`}>
                                            <td className="px-4 py-4">
                                                <Checkbox 
                                                    {...label} 
                                                    size="small" 
                                                    checked={product.checked === true}
                                                    onChange={(e) => handleCheckboxChange(e, product._id, index)}
                                                />
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-md overflow-hidden group cursor-pointer flex-shrink-0" onClick={() => setOpen(true)}>
                                                        <LazyLoadImage
                                                            alt="product"
                                                            effect="blur"
                                                            src={product?.images[0]}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-all"
                                                        />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="font-[600] text-[13px] leading-4 mb-1">
                                                            <Link to={`/product/${product?._id}`} className="hover:text-primary">
                                                                {product?.name?.length > 30 ? product?.name?.substr(0, 30) + '...' : product?.name}
                                                            </Link>
                                                        </h3>
                                                        <p className="text-[11px] text-gray-600">
                                                            {typeof product?.brand === 'object' ? product?.brand?.name : product?.brand}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div>
                                                    <div className="text-[12px] font-[600]">{product?.catName}</div>
                                                    {product?.subCat && (
                                                        <div className="text-[11px] text-gray-500">{product?.subCat}</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex flex-col">
                                                    {product?.oldPrice && (
                                                        <span className="text-[11px] line-through text-gray-500">
                                                            {formatCurrencyBD(product?.oldPrice)}
                                                        </span>
                                                    )}
                                                    <span className="text-[13px] font-[600] text-primary">
                                                        {formatCurrencyBD(product?.price)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-[13px] font-[600] text-primary">
                                                    {product?.countInStock}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-[13px] font-[600]">
                                                    {product?.sale}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <Rating name="half-rating" size="small" defaultValue={product?.rating} readOnly />
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-1">
                                                    <Button 
                                                        size="small"
                                                        variant="outlined"
                                                        onClick={() => context.setIsOpenFullScreenPanel({
                                                            open: true,
                                                            model: 'Edit Product',
                                                            id: product?._id
                                                        })}
                                                        className="!w-8 !h-8 !min-w-8 !p-0"
                                                    >
                                                        <AiOutlineEdit className="text-[14px]" />
                                                    </Button>
                                                    <Link to={`/product/${product?._id}`}>
                                                        <Button 
                                                            size="small"
                                                            variant="outlined"
                                                            className="!w-8 !h-8 !min-w-8 !p-0"
                                                        >
                                                            <FaRegEye className="text-[12px]" />
                                                        </Button>
                                                    </Link>
                                                    <Button 
                                                        size="small"
                                                        variant="outlined"
                                                        color="error"
                                                        onClick={() => deleteProduct(product?._id)}
                                                        className="!w-8 !h-8 !min-w-8 !p-0"
                                                    >
                                                        <GoTrash className="text-[12px]" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Pagination */}
            {productData?.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pb-6 px-6 border-t border-gray-200">
                    <div className="text-[14px] text-gray-600">
                        Showing {page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, productData?.totalPages * rowsPerPage)} of {productData?.totalPages * rowsPerPage} products
                    </div>
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 50, 100, { label: 'All', value: -1 }]}
                        component="div"
                        count={productData?.totalPages * rowsPerPage}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Products per page:"
                        labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
                    />
                </div>
            )}
            <Lightbox
                open={open}
                close={() => setOpen(false)}
                slides={photos}
            />
        </div>
    )
}

export default Products;
