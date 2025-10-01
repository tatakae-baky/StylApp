import React, { useContext, useEffect, useState } from 'react';
import { Button } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Checkbox from "@mui/material/Checkbox";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineEdit } from "react-icons/ai";
import { FaRegEye } from "react-icons/fa6";
import { GoTrash } from "react-icons/go";
import { IoMdAdd } from "react-icons/io";
import { MyContext } from '../../App';
import { fetchDataFromApi, deleteData } from '../../utils/api';
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { Switch, Chip } from '@mui/material';

const label = { inputProps: { "aria-label": "Checkbox demo" } };

const columns = [
    { id: "image", label: "LOGO", minWidth: 100 },
    { id: "name", label: "BRAND NAME", minWidth: 150 },
    { id: "email", label: "EMAIL", minWidth: 200 },
    { id: "products", label: "PRODUCTS", minWidth: 100 },
    { id: "status", label: "STATUS", minWidth: 100 },
    { id: "featured", label: "FEATURED", minWidth: 100 },
    { id: "action", label: "ACTION", minWidth: 150 },
];

export const BrandList = () => {
    const [brandData, setBrandData] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [loading, setLoading] = useState(true);
    
    const context = useContext(MyContext);
    const navigate = useNavigate();

    useEffect(() => {
        // Wait for userData to be loaded before proceeding
        if (!context?.userData) {
            return; // Don't do anything if user data is not loaded yet
        }
        
        // Check if user is brand owner and prevent access
        if (context.userData.role === 'BRAND_OWNER') {
            console.log('🚫 Brand owner trying to access brands management page - redirecting to dashboard');
            context.alertBox("error", "Access denied. Brand owners cannot view all brands.");
            navigate('/dashboard', { replace: true });
            return;
        }
    }, [context?.userData, navigate]);

    // Separate useEffect for fetching brands - only runs once
    useEffect(() => {
        // Only fetch if we have user data and user is admin
        if (context?.userData?.role === 'ADMIN') {
            getBrands();
        }
    }, []); // Empty dependency array for one-time load

    const getBrands = () => {
        context?.setProgress(50);
        setLoading(true);
        fetchDataFromApi('/api/brand/get').then((res) => {
            if (res?.error === false) {
                setBrandData(res.brands);
                context?.setBrandData(res.brands);
            }
            setLoading(false);
            context?.setProgress(100);
        });
    };

    const deleteBrand = (id) => {
        context.alertBox("question", "Are you sure you want to delete this brand?", () => {
            context.setProgress(30);
            
            deleteData(`/api/brand/delete/${id}`).then((res) => {
                if (res?.error === false || res?.success === true) {
                    context.alertBox("success", "Brand deleted successfully");
                    getBrands(); // Refresh the brand list
                } else {
                    const errorMessage = res?.message || "Failed to delete brand";
                    context.alertBox("error", errorMessage);
                }
                context.setProgress(100);
            }).catch((error) => {
                const errorMessage = error?.response?.data?.message || 
                                   error?.message || 
                                   "An error occurred while deleting the brand";
                context.alertBox("error", errorMessage);
                context.setProgress(100);
            });
        });
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    // Additional protection against brand owners accessing this page
    if (context?.userData?.role === 'BRAND_OWNER') {
        return (
            <div className="right-content w-full">
                <div className="card shadow-md border-0 w-full bg-white p-4 text-center">
                    <div className="text-red-500 text-6xl mb-4">🚫</div>
                    <h3 className="font-bold text-xl mb-4 text-red-600">Access Denied</h3>
                    <p className="text-gray-600 mb-4">
                        Brand owners are not allowed to view all brands. You can only manage your own brand.
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
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-xl">Brand Management</h3>
                    <Link to="/brands/add">
                        <Button className="btn-blue" variant="contained">
                            <IoMdAdd className="mr-2" />
                            Add New Brand
                        </Button>
                    </Link>
                </div>

                <div className="table-responsive mt-3">
                    <TableContainer className="shadow border">
                        <Table stickyHeader aria-label="sticky table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        <Checkbox {...label} />
                                    </TableCell>
                                    {columns.map((column) => (
                                        <TableCell
                                            key={column.id}
                                            style={{ minWidth: column.minWidth }}
                                            className="tableCell"
                                        >
                                            {column.label}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center">
                                            Loading brands...
                                        </TableCell>
                                    </TableRow>
                                ) : brandData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center">
                                            No brands found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    brandData
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((brand, index) => (
                                            <TableRow hover role="checkbox" tabIndex={-1} key={brand._id}>
                                                <TableCell>
                                                    <Checkbox {...label} />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="d-flex align-items-center productBox">
                                                        <div className="imgWrapper" style={{ width: '60px', height: '60px' }}>
                                                            <div className="img" style={{ width: '100%', height: '100%', borderRadius: '8px', overflow: 'hidden' }}>
                                                                <LazyLoadImage
                                                                    alt={brand.name}
                                                                    effect="blur"
                                                                    className="w-100 h-100"
                                                                    style={{ objectFit: 'cover' }}
                                                                    src={brand.logo || '/placeholder-brand.png'}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <h6 className="font-semibold">{brand.name}</h6>
                                                        <p className="text-sm text-gray-500">{brand.slug}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        {brand.email ? (
                                                            <a 
                                                                href={`mailto:${brand.email}`}
                                                                className="text-blue-600 hover:underline text-sm"
                                                            >
                                                                {brand.email}
                                                            </a>
                                                        ) : (
                                                            <span className="text-gray-400 text-sm">No email</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={brand.totalProducts || 0}
                                                        color="primary"
                                                        variant="outlined"
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center">
                                                        <Switch
                                                            checked={brand.isActive}
                                                            color="primary"
                                                            size="small"
                                                        />
                                                        <span className="ml-2 text-sm">
                                                            {brand.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center">
                                                        <Switch
                                                            checked={brand.isFeatured}
                                                            color="secondary"
                                                            size="small"
                                                        />
                                                        <span className="ml-2 text-sm">
                                                            {brand.isFeatured ? 'Yes' : 'No'}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="actions d-flex align-items-center">
                                                        <Link to={`/brands/view/${brand._id}`}>
                                                            <Button className="secondary" color="secondary">
                                                                <FaRegEye />
                                                            </Button>
                                                        </Link>
                                                        <Link to={`/brands/edit/${brand._id}`}>
                                                            <Button className="success" color="success">
                                                                <AiOutlineEdit />
                                                            </Button>
                                                        </Link>
                                                        <Button 
                                                            className="error" 
                                                            color="error"
                                                            onClick={() => deleteBrand(brand._id)}
                                                        >
                                                            <GoTrash />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 100]}
                        component="div"
                        count={brandData.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </div>
            </div>
        </div>
    );
};

export default BrandList;
