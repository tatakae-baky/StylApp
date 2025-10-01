import React, { useContext, useEffect, useState } from 'react';
import { Button, useTheme, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, Card, CardContent, Typography, Box, Chip, IconButton } from "@mui/material";
import { IoMdAdd } from "react-icons/io";
import { FaAngleDown, FaAngleUp, FaCopy } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineEdit } from "react-icons/ai";
import { MyContext } from '../../App';
import { fetchDataFromApi, putData } from '../../utils/api';
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import CircularProgress from '@mui/material/CircularProgress';
import Pagination from "@mui/material/Pagination";

// Format currency for Bangladesh Taka
const formatCurrencyBD = (amount) => {
  if (!amount && amount !== 0) return 'Tk 0';
  return `Tk ${amount?.toLocaleString('en-BD')}`;
};

const SizeStockManagement = () => {
    const context = useContext(MyContext);
    const navigate = useNavigate();
    const theme = useTheme();

    // Check access permissions
    useEffect(() => {
        if (!context.isLogin) {
            navigate('/login');
            return;
        }
        
        // Wait for user data to be loaded before checking role
        if (context.userData) {
            // Allow both ADMIN and BRAND_OWNER to access
            if (context.userData.role !== 'ADMIN' && context.userData.role !== 'BRAND_OWNER') {
                navigate('/');
            }
        }
    }, [context.isLogin, context.userData, navigate]);

    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchFields, setSearchFields] = useState({
        name: "",
        category: "",
        brand: ""
    });

    // Pagination
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Stock Update Dialog
    const [openStockDialog, setOpenStockDialog] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [stockUpdates, setStockUpdates] = useState({});

    // Expandable rows for mobile view
    const [isOpenProductDetails, setIsOpenProductDetails] = useState(null);

    useEffect(() => {
        // Only fetch products when user context is loaded
        if (context.userData) {
            fetchProducts();
        }
    }, [context.userData]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            
            // Use different API endpoints based on user role
            let endpoint = '/api/product/getAllProducts?page=1&limit=1000';
            if (context.userData?.role === 'BRAND_OWNER') {
                // For brand owners, get only their brand's products
                endpoint = `/api/brand/${context.userData.brandId}/products?page=1&perPage=1000`;
            }
            
            const response = await fetchDataFromApi(endpoint);
            
            if (response?.success) {
                // Only show products that have sizes
                const productsWithSizes = response.products.filter(product => 
                    product.size && product.size.length > 0 && product.size.some(s => s)
                );
                setProducts(productsWithSizes);
                setFilteredProducts(productsWithSizes);
            }
        } catch (error) {
            context.alertBox('error', 'Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (field, value) => {
        const newSearchFields = { ...searchFields, [field]: value };
        setSearchFields(newSearchFields);

        let filtered = products;
        
        if (newSearchFields.name) {
            filtered = filtered.filter(product => 
                product.name?.toLowerCase().includes(newSearchFields.name.toLowerCase())
            );
        }
        
        if (newSearchFields.category) {
            filtered = filtered.filter(product => 
                product.catName?.toLowerCase().includes(newSearchFields.category.toLowerCase())
            );
        }
        
        if (newSearchFields.brand) {
            filtered = filtered.filter(product => 
                product.brand?.name?.toLowerCase().includes(newSearchFields.brand.toLowerCase())
            );
        }

        setFilteredProducts(filtered);
        setPage(1);
    };

    /**
     * Toggle the visibility of product details for mobile view
     * @param {number} index - The index of the product to toggle
     */
    const toggleProductDetails = (index) => {
        if (isOpenProductDetails === index) {
            setIsOpenProductDetails(null);
        } else {
            setIsOpenProductDetails(index);
        }
    };

    const openStockUpdateDialog = (product) => {
        setSelectedProduct(product);
        
        // Initialize stock updates with current values
        const initialStockUpdates = {};
        if (product.sizeStock && product.sizeStock.length > 0) {
            product.sizeStock.forEach(sizeStock => {
                initialStockUpdates[sizeStock.size] = sizeStock.stock;
            });
        } else {
            // Initialize with sizes from size array if sizeStock is empty
            product.size?.forEach(size => {
                if (size) {
                    initialStockUpdates[size] = product.countInStock || 0;
                }
            });
        }
        
        setStockUpdates(initialStockUpdates);
        setOpenStockDialog(true);
    };

    const handleStockChange = (size, value) => {
        setStockUpdates(prev => ({
            ...prev,
            [size]: Math.max(0, parseInt(value) || 0)
        }));
    };

    const saveStockUpdates = async () => {
        try {
            const updates = Object.entries(stockUpdates).map(([size, stock]) => ({
                size,
                stock: parseInt(stock)
            }));

            const response = await putData(`/api/product/size-stock/update/${selectedProduct._id}`, {
                updates
            });

            if (response?.success) {
                context.alertBox('success', 'Stock updated successfully!');
                
                setOpenStockDialog(false);
                fetchProducts(); // Refresh data
            } else {
                throw new Error(response?.message || 'Update failed');
            }
        } catch (error) {
            context.alertBox('error', error.message || 'Failed to update stock');
        }
    };

    const getStockStatus = (available, total) => {
        const percentage = total > 0 ? (available / total) * 100 : 0;
        
        if (percentage === 0) return { color: 'error', label: 'Out of Stock' };
        if (percentage <= 20) return { color: 'warning', label: 'Low Stock' };
        return { color: 'success', label: 'In Stock' };
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(1);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <div className="bg-white border border-gray-200">
            {/* Header Section */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h2 className="text-[20px] font-[600] text-gray-900 mb-2">Size-Wise Stock Management</h2>
                        <p className="text-[14px] text-gray-600">
                            There are <span className="font-bold text-[#FF2E4D]">{filteredProducts?.length}</span>{" "}
                            products with size-based inventory
                        </p>
                    </div>
                </div>
            </div>

            {/* Search Filters */}
            <div className="p-6 border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className='w-full h-auto bg-[#f1f1f1] relative overflow-hidden'>
                        <input 
                            type='text' 
                            className='w-full h-[40px] border border-[rgba(0,0,0,0.1)] bg-[#f1f1f1] p-2 pl-3 focus:outline-none focus:border-[rgba(0,0,0,0.5)] rounded-md text-[13px]' 
                            placeholder="Search by product name..."
                            value={searchFields.name}
                            onChange={(e) => handleSearch('name', e.target.value)}
                        />
                    </div>
                    <div className='w-full h-auto bg-[#f1f1f1] relative overflow-hidden'>
                        <input 
                            type='text' 
                            className='w-full h-[40px] border border-[rgba(0,0,0,0.1)] bg-[#f1f1f1] p-2 pl-3 focus:outline-none focus:border-[rgba(0,0,0,0.5)] rounded-md text-[13px]' 
                            placeholder="Search by category..."
                            value={searchFields.category}
                            onChange={(e) => handleSearch('category', e.target.value)}
                        />
                    </div>
                    <div className='w-full h-auto bg-[#f1f1f1] relative overflow-hidden'>
                        <input 
                            type='text' 
                            className='w-full h-[40px] border border-[rgba(0,0,0,0.1)] bg-[#f1f1f1] p-2 pl-3 focus:outline-none focus:border-[rgba(0,0,0,0.5)] rounded-md text-[13px]' 
                            placeholder="Search by brand..."
                            value={searchFields.brand}
                            onChange={(e) => handleSearch('brand', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="p-6">
                {/* Mobile/Tablet View - Card Layout */}
                <div className="lg:hidden space-y-4">
                    {filteredProducts
                        .slice((page - 1) * rowsPerPage, page * rowsPerPage)
                        .map((product, index) => {
                            const totalStock = product.sizeStock?.reduce((sum, s) => sum + s.stock, 0) || 0;
                            const totalSold = product.sizeStock?.reduce((sum, s) => sum + s.sold, 0) || 0;
                            const available = totalStock;
                            
                            return (
                                <div key={product._id} className="border border-gray-200 p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                className="w-8 h-8 rounded-full bg-[#f1f1f1] flex items-center justify-center hover:bg-gray-200 transition-colors"
                                                onClick={() => toggleProductDetails(index)}
                                            >
                                                {isOpenProductDetails === index ? 
                                                    <FaAngleUp className="text-[14px] text-gray-600" /> : 
                                                    <FaAngleDown className="text-[14px] text-gray-600" />
                                                }
                                            </button>
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={product.images?.[0]}
                                                    className="w-12 h-12 object-cover rounded-md"
                                                    alt={product.name}
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <h5 className="font-[600] text-[14px] text-gray-900 truncate" title={product.name}>
                                                        {product.name.length > 30 ? `${product.name.substring(0, 30)}...` : product.name}
                                                    </h5>
                                                    <p className="text-[12px] text-gray-600">{formatCurrencyBD(product.price)}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => openStockUpdateDialog(product)}
                                            variant="outlined"
                                            size="small"
                                            className="!text-[12px] !py-1 !px-3"
                                        >
                                            <AiOutlineEdit className="mr-1" />
                                            Edit Stock
                                        </Button>
                                    </div>

                                    <div className="space-y-2 text-[14px]">
                                        <div className="flex justify-between">
                                            <span className="font-[600] text-gray-700">Category:</span>
                                            <span className="text-[13px]">{product.catName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-[600] text-gray-700">Brand:</span>
                                            <span className="text-[13px]">{product.brand?.name || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-[600] text-gray-700">Total Stock:</span>
                                            <span className="font-bold">{available}</span>
                                        </div>
                                    </div>

                                    {/* Expandable Product Details */}
                                    {isOpenProductDetails === index && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <h4 className="font-[600] text-gray-900 mb-3">Size-wise Stock Details</h4>
                                            <div className="space-y-3">
                                                <div className="bg-white p-3 rounded border">
                                                    <h5 className="font-[600] text-gray-900 mb-2">Product: {product.name}</h5>
                                                    <h6 className="font-[600] text-gray-700 mb-2">Available Sizes</h6>
                                                    <div className="flex flex-wrap gap-2">
                                                        {product.size?.filter(s => s).map((size, sizeIndex) => {
                                                            const sizeStock = product.sizeStock?.find(s => s.size === size);
                                                            const sizeAvailable = sizeStock ? sizeStock.stock : 0;
                                                            const status = getStockStatus(sizeAvailable, sizeStock?.stock || 0);
                                                            
                                                            return (
                                                                <Chip
                                                                    key={sizeIndex}
                                                                    label={`${size}: ${sizeAvailable}`}
                                                                    color={status.color}
                                                                    size="small"
                                                                    variant="outlined"
                                                                />
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                <div className="bg-white p-3 rounded border">
                                                    <h5 className="font-[600] text-gray-900 mb-2">Stock Summary</h5>
                                                    <div className="text-[13px] text-gray-600 space-y-1">
                                                        <div><span className="font-[600] text-gray-900">Total Available:</span> {available}</div>
                                                        <div><span className="font-[600] text-gray-900">Total Sold:</span> {totalSold}</div>
                                                        <div><span className="font-[600] text-gray-900">Product ID:</span> <span className="font-mono text-[#FF2E4D]">{product._id}</span></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                </div>

                {/* Desktop View - Compact Table */}
                <div className="hidden lg:block">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-4 py-3 w-12">
                                        &nbsp;
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        Product
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        Category
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        Brand
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        Available Sizes
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        Stock Status
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts
                                    .slice((page - 1) * rowsPerPage, page * rowsPerPage)
                                    .map((product, index) => {
                                        const totalStock = product.sizeStock?.reduce((sum, s) => sum + s.stock, 0) || 0;
                                        const totalSold = product.sizeStock?.reduce((sum, s) => sum + s.sold, 0) || 0;
                                        const available = totalStock;
                                        
                                        return (
                                            <React.Fragment key={product._id}>
                                                <tr className="bg-white border-b hover:bg-gray-50">
                                                    <td className="px-4 py-4">
                                                        <button
                                                            className="w-8 h-8 rounded-full bg-[#f1f1f1] flex items-center justify-center hover:bg-gray-200 transition-colors"
                                                            onClick={() => toggleProductDetails(index)}
                                                        >
                                                            {isOpenProductDetails === index ? 
                                                                <FaAngleUp className="text-[14px] text-gray-600" /> : 
                                                                <FaAngleDown className="text-[14px] text-gray-600" />
                                                            }
                                                        </button>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <img
                                                                src={product.images?.[0]}
                                                                className="w-12 h-12 object-cover rounded-md"
                                                                alt={product.name}
                                                            />
                                                            <div className="min-w-0 flex-1">
                                                                <h5 className="font-[600] text-[13px] text-gray-900 truncate" title={product.name}>
                                                                    {product.name.length > 25 ? `${product.name.substring(0, 25)}...` : product.name}
                                                                </h5>
                                                                <p className="text-[12px] text-gray-600">{formatCurrencyBD(product.price)}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-[13px]">
                                                        {product.catName}
                                                    </td>
                                                    <td className="px-4 py-4 text-[13px]">
                                                        {product.brand?.name || 'N/A'}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex flex-wrap gap-1">
                                                            {product.size?.filter(s => s).map((size, sizeIndex) => {
                                                                const sizeStock = product.sizeStock?.find(s => s.size === size);
                                                                const sizeAvailable = sizeStock ? sizeStock.stock : 0;
                                                                const status = getStockStatus(sizeAvailable, sizeStock?.stock || 0);
                                                                
                                                                return (
                                                                    <Chip
                                                                        key={sizeIndex}
                                                                        label={`${size}: ${sizeAvailable}`}
                                                                        color={status.color}
                                                                        size="small"
                                                                        variant="outlined"
                                                                    />
                                                                );
                                                            })}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <Chip
                                                            label={`${available}`}
                                                            color={getStockStatus(available, totalStock + totalSold).color}
                                                            size="small"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <Button
                                                            onClick={() => openStockUpdateDialog(product)}
                                                            variant="outlined"
                                                            size="small"
                                                            className="!text-[12px] !py-1 !px-2"
                                                        >
                                                            <AiOutlineEdit className="mr-1" />
                                                            Edit
                                                        </Button>
                                                    </td>
                                                </tr>

                                                {isOpenProductDetails === index && (
                                                    <tr>
                                                        <td colSpan="7" className="px-4 py-4 bg-gray-50">
                                                            <div className="space-y-4">
                                                                <h4 className="font-[600] text-gray-900 mb-3">Size-wise Stock Details</h4>
                                                                
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    <div className="bg-white p-4 rounded border">
                                                                        <h5 className="font-[600] text-gray-900 mb-2">Product: {product.name}</h5>
                                                                        <h6 className="font-[600] text-gray-700 mb-2">Available Sizes</h6>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {product.size?.filter(s => s).map((size, sizeIndex) => {
                                                                                const sizeStock = product.sizeStock?.find(s => s.size === size);
                                                                                const sizeAvailable = sizeStock ? sizeStock.stock : 0;
                                                                                const status = getStockStatus(sizeAvailable, sizeStock?.stock || 0);
                                                                                
                                                                                return (
                                                                                    <Chip
                                                                                        key={sizeIndex}
                                                                                        label={`${size}: ${sizeAvailable}`}
                                                                                        color={status.color}
                                                                                        size="small"
                                                                                        variant="outlined"
                                                                                    />
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </div>

                                                                    <div className="bg-white p-4 rounded border">
                                                                        <h5 className="font-[600] text-gray-900 mb-2">Stock Summary</h5>
                                                                        <div className="text-[13px] text-gray-600 space-y-1">
                                                                            <div><span className="font-[600] text-gray-900">Total Available:</span> {available}</div>
                                                                            <div><span className="font-[600] text-gray-900">Total Sold:</span> {totalSold}</div>
                                                                            <div><span className="font-[600] text-gray-900">Product ID:</span> <span className="font-mono text-[#FF2E4D]">{product._id}</span></div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Pagination */}
            {filteredProducts.length > rowsPerPage && (
                <div className="flex items-center justify-center mt-10 pb-6 px-6">
                    <Pagination
                        showFirstButton 
                        showLastButton
                        count={Math.ceil(filteredProducts.length / rowsPerPage)}
                        page={page}
                        onChange={(e, value) => setPage(value)}
                    />
                </div>
            )}
            {/* Stock Update Dialog */}
            <Dialog 
                open={openStockDialog} 
                onClose={() => setOpenStockDialog(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '12px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                    }
                }}
            >
                <DialogTitle sx={{ 
                    borderBottom: '1px solid #e5e7eb', 
                    padding: '24px 24px 16px 24px',
                    backgroundColor: '#f9fafb'
                }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#FF2E4D] rounded-lg flex items-center justify-center">
                            <AiOutlineEdit className="text-white text-lg" />
                        </div>
                        <div>
                            <h3 className="text-lg font-[600] text-gray-900">Update Stock</h3>
                            <p className="text-sm text-gray-600">{selectedProduct?.name}</p>
                        </div>
                    </div>
                </DialogTitle>
                <DialogContent sx={{ padding: '24px' }}>
                    <div className="mb-4">
                        <p className="text-sm text-gray-600">
                            Update the stock quantities for each size. The system will automatically track sold vs available inventory.
                        </p>
                    </div>
                    <Grid container spacing={3}>
                        {selectedProduct?.size?.filter(s => s).map((size, index) => {
                            const currentSizeStock = selectedProduct.sizeStock?.find(s => s.size === size);
                            const sold = currentSizeStock?.sold || 0;
                            const currentStock = stockUpdates[size] || 0;
                            const available = currentStock;

                            return (
                                <Grid item xs={12} sm={6} md={4} key={index}>
                                    <Card 
                                        variant="outlined" 
                                        sx={{ 
                                            borderRadius: '8px',
                                            border: '1px solid #e5e7eb',
                                            '&:hover': {
                                                borderColor: '#d1d5db',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                            }
                                        }}
                                    >
                                        <CardContent sx={{ padding: '16px' }}>
                                            <div className="flex items-center justify-between mb-3">
                                                <Typography variant="h6" sx={{ 
                                                    fontSize: '16px', 
                                                    fontWeight: 600, 
                                                    color: '#111827' 
                                                }}>
                                                    Size {size}
                                                </Typography>
                                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <span className="text-xs font-[600] text-gray-600">{size}</span>
                                                </div>
                                            </div>
                                            <TextField
                                                label="Stock Quantity"
                                                type="number"
                                                fullWidth
                                                value={stockUpdates[size] || 0}
                                                onChange={(e) => handleStockChange(size, e.target.value)}
                                                inputProps={{ min: 0 }}
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
                                            <Box mt={2} className="bg-gray-50 p-2 rounded-md">
                                                <Typography variant="body2" sx={{ 
                                                    fontSize: '12px', 
                                                    color: '#6b7280',
                                                    display: 'flex',
                                                    justifyContent: 'space-between'
                                                }}>
                                                    <span><span className="font-[600]">Sold:</span> {sold}</span>
                                                    <span><span className="font-[600]">Available:</span> {available}</span>
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ 
                    padding: '16px 24px 24px 24px',
                    borderTop: '1px solid #e5e7eb',
                    backgroundColor: '#f9fafb',
                    gap: '12px'
                }}>
                    <Button 
                        onClick={() => setOpenStockDialog(false)}
                        variant="outlined"
                        sx={{
                            borderRadius: '6px',
                            textTransform: 'none',
                            fontWeight: 500,
                            padding: '8px 16px'
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={saveStockUpdates} 
                        variant="contained" 
                        sx={{
                            backgroundColor: '#FF2E4D',
                            borderRadius: '6px',
                            textTransform: 'none',
                            fontWeight: 500,
                            padding: '8px 16px',
                            '&:hover': {
                                backgroundColor: '#e63852'
                            }
                        }}
                    >
                        Update Stock
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default SizeStockManagement;
