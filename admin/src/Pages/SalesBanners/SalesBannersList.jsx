import React, { useContext, useEffect, useState } from 'react';
import { Button } from "@mui/material";
import { IoMdAdd } from "react-icons/io";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { AiOutlineEdit } from "react-icons/ai";
import { FaRegEye } from "react-icons/fa6";
import { GoTrash } from "react-icons/go";
import { MyContext } from '../../App';
import { deleteData, fetchDataFromApi } from '../../utils/api';
import { Link } from "react-router-dom";

/**
 * Sales Banners List Component
 * Displays and manages "Sales You Can't Miss" carousel banners
 */
export const SalesBannersList = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [bannerData, setBannerData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const context = useContext(MyContext);

    const columns = [
        { id: "image", label: "IMAGE", minWidth: 100 },
        { id: "title", label: "TITLE", minWidth: 150 },
        { id: "category", label: "CATEGORY", minWidth: 150 },
        { id: "status", label: "STATUS", minWidth: 100 },
        { id: "sortOrder", label: "ORDER", minWidth: 80 },
        { id: "createdAt", label: "CREATED", minWidth: 120 },
        { id: "action", label: "ACTION", minWidth: 150 },
    ];

    useEffect(() => {
        getData();
    }, []);

    /**
     * Fetch sales banners data
     */
    const getData = () => {
        setIsLoading(true);
        fetchDataFromApi("/api/salesBanners").then((res) => {
            setBannerData(res?.data || []);
            setIsLoading(false);
        }).catch((error) => {
            console.error('Error fetching sales banners:', error);
            setIsLoading(false);
        });
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    /**
     * Delete sales banner
     */
    const deleteBanner = (id) => {
        if (context?.userData?.role === "ADMIN") {
            if (window.confirm("Are you sure you want to delete this sales banner?")) {
                deleteData(`/api/salesBanners/${id}`).then((res) => {
                    context.alertBox("success", "Sales banner deleted successfully");
                    getData();
                }).catch((error) => {
                    context.alertBox("error", "Failed to delete sales banner");
                });
            }
        } else {
            context.alertBox("error", "Only admin can delete banners");
        }
    };

    /**
     * Get category name from ID
     */
    const getCategoryName = (catId, subCatId, thirdsubCatId) => {
        if (!context?.catData) return 'No Category';
        
        if (thirdsubCatId) {
            // Find third level category name
            for (const cat of context.catData) {
                for (const subCat of cat.children || []) {
                    for (const thirdCat of subCat.children || []) {
                        if (thirdCat._id === thirdsubCatId) {
                            return thirdCat.name;
                        }
                    }
                }
            }
        } else if (subCatId) {
            // Find subcategory name
            for (const cat of context.catData) {
                for (const subCat of cat.children || []) {
                    if (subCat._id === subCatId) {
                        return subCat.name;
                    }
                }
            }
        } else if (catId) {
            // Find category name
            const category = context.catData.find(cat => cat._id === catId);
            return category ? category.name : 'Unknown Category';
        }
        
        return 'No Category';
    };

    /**
     * Format date
     */
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between px-2 py-0 mt-1 md:mt-3">
                <h2 className="text-[18px] font-[600]">
                    Sales Banners List
                    <span className="font-[400] text-[14px] ml-2">({bannerData.length} banners)</span>
                </h2>
                <p className="text-sm text-gray-600">"Sales You Can't Miss" carousel banners</p>

                <div className="col ml-auto flex items-center justify-end gap-3">
                    <Link to="/sales-banners/add">
                        <Button className="btn-blue !text-white btn-sm">
                            <IoMdAdd className="mr-2" />
                            Add Sales Banner
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Table */}
            <div className="card my-4 pt-5 shadow-md sm:rounded-lg bg-white">
                {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <TableContainer sx={{ maxHeight: 440 }}>
                        <Table stickyHeader aria-label="sticky table">
                            <TableHead>
                                <TableRow>
                                    {columns.map((column) => (
                                        <TableCell
                                            key={column.id}
                                            align={column.align}
                                            style={{ minWidth: column.minWidth }}
                                            className="font-semibold"
                                        >
                                            {column.label}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {bannerData
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((banner, index) => (
                                        <TableRow hover role="checkbox" tabIndex={-1} key={banner._id}>
                                            {/* Image */}
                                            <TableCell>
                                                <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100">
                                                    <img 
                                                        src={banner.image} 
                                                        alt={banner.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            </TableCell>

                                            {/* Title */}
                                            <TableCell>
                                                <span className="font-medium">{banner.title}</span>
                                            </TableCell>

                                            {/* Category */}
                                            <TableCell>
                                                {getCategoryName(banner.catId, banner.subCatId, banner.thirdsubCatId)}
                                            </TableCell>

                                            {/* Status */}
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    banner.isActive 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {banner.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </TableCell>

                                            {/* Sort Order */}
                                            <TableCell>
                                                {banner.sortOrder}
                                            </TableCell>

                                            {/* Created Date */}
                                            <TableCell>
                                                {formatDate(banner.createdAt)}
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        className="!min-w-[35px] !w-[35px] !h-[35px] !text-[14px] !text-blue-600 hover:!bg-blue-50"
                                                        onClick={() => window.open(banner.image, '_blank')}
                                                    >
                                                        <FaRegEye />
                                                    </Button>
                                                    
                                                    <Link to={`/sales-banners/edit/${banner._id}`}>
                                                        <Button className="!min-w-[35px] !w-[35px] !h-[35px] !text-[14px] !text-green-600 hover:!bg-green-50">
                                                            <AiOutlineEdit />
                                                        </Button>
                                                    </Link>
                                                    
                                                    <Button
                                                        className="!min-w-[35px] !w-[35px] !h-[35px] !text-[14px] !text-red-600 hover:!bg-red-50"
                                                        onClick={() => deleteBanner(banner._id)}
                                                    >
                                                        <GoTrash />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {/* Pagination */}
                {!isLoading && (
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 100]}
                        component="div"
                        count={bannerData.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                )}
            </div>
        </>
    );
};
