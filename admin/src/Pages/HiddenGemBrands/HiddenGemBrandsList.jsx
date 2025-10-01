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
 * Hidden Gem Brands List Component
 * Displays and manages hidden gem brands
 */
export const HiddenGemBrandsList = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [brandData, setBrandData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const context = useContext(MyContext);

    const columns = [
        { id: "image", label: "IMAGE", minWidth: 100 },
        { id: "brandName", label: "BRAND NAME", minWidth: 150 },
        { id: "brand", label: "LINKED BRAND", minWidth: 150 },
        { id: "position", label: "POSITION", minWidth: 100 },
        { id: "status", label: "STATUS", minWidth: 100 },
        { id: "sortOrder", label: "ORDER", minWidth: 80 },
        { id: "action", label: "ACTION", minWidth: 150 },
    ];

    useEffect(() => {
        getData();
    }, []);

    /**
     * Fetch hidden gem brands data
     */
    const getData = () => {
        setIsLoading(true);
        fetchDataFromApi("/api/hiddenGemBrands").then((res) => {
            setBrandData(res?.data || []);
            setIsLoading(false);
        }).catch((error) => {
            console.error('Error fetching hidden gem brands:', error);
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
     * Delete hidden gem brand
     */
    const deleteBrand = (id) => {
        if (context?.userData?.role === "ADMIN") {
            if (window.confirm("Are you sure you want to delete this hidden gem brand?")) {
                deleteData(`/api/hiddenGemBrands/${id}`).then((res) => {
                    context.alertBox("success", "Hidden gem brand deleted successfully");
                    getData();
                }).catch((error) => {
                    context.alertBox("error", "Failed to delete hidden gem brand");
                });
            }
        } else {
            context.alertBox("error", "You don't have permission to delete");
        }
    };

    /**
     * Render brand image
     */
    const renderImage = (imageUrl) => {
        return (
            <div className="d-flex align-items-center productBox">
                <div className="imgWrapper">
                    <div className="img card shadow m-0">
                        <img
                            src={imageUrl}
                            className="w-100"
                            alt="Brand"
                            style={{ objectFit: 'cover', height: '60px', width: '60px' }}
                        />
                    </div>
                </div>
            </div>
        );
    };

    /**
     * Render status badge
     */
    const renderStatus = (isActive) => {
        return (
            <span className={`badge ${isActive ? 'badge-success' : 'badge-danger'}`}>
                {isActive ? 'Active' : 'Inactive'}
            </span>
        );
    };

    /**
     * Render position badge
     */
    const renderPosition = (position) => {
        return (
            <span className={`badge ${position === 'large' ? 'badge-primary' : 'badge-info'}`}>
                {position === 'large' ? 'Large Banner' : 'Small Card'}
            </span>
        );
    };

    return (
        <>
            <div className="right-content w-100">
                <div className="card shadow border-0 w-100 flex-row p-4 mt-2">
                    <h5 className="mb-0">Hidden Gem Brands List</h5>
                    <div className="ml-auto d-flex align-items-center">
                        <Button className="btn-blue ml-3 pl-3 pr-3">
                            <IoMdAdd />
                            <Link to="/hiddenGemBrands/add" className="text-white text-decoration-none">
                                Add Hidden Gem Brand
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="card shadow border-0 p-3 mt-4">
                    <div className="table-responsive mt-3">
                        <TableContainer className="tableContainer">
                            <Table stickyHeader aria-label="sticky table">
                                <TableHead>
                                    <TableRow>
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
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={columns.length} className="text-center">
                                                Loading...
                                            </TableCell>
                                        </TableRow>
                                    ) : brandData.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={columns.length} className="text-center">
                                                No hidden gem brands found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        brandData
                                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                            .map((brand, index) => (
                                                <TableRow hover role="checkbox" tabIndex={-1} key={brand._id}>
                                                    <TableCell className="tableCell">
                                                        {renderImage(brand.image)}
                                                    </TableCell>
                                                    <TableCell className="tableCell">
                                                        <span className="text-primary font-weight-bold">
                                                            {brand.brandName}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="tableCell">
                                                        <span className="text-dark font-weight-bold">
                                                            {brand.brandId?.name || 'Unknown Brand'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="tableCell">
                                                        {renderPosition(brand.position)}
                                                    </TableCell>
                                                    <TableCell className="tableCell">
                                                        {renderStatus(brand.isActive)}
                                                    </TableCell>
                                                    <TableCell className="tableCell">
                                                        <span className="badge badge-primary">
                                                            {brand.sortOrder}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="tableCell">
                                                        <div className="actions d-flex align-items-center">
                                                            <Link to={`/hiddenGemBrands/edit/${brand._id}`}>
                                                                <Button className="secondary" color="secondary">
                                                                    <FaRegEye />
                                                                </Button>
                                                            </Link>
                                                            <Link to={`/hiddenGemBrands/edit/${brand._id}`}>
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
        </>
    );
};

export default HiddenGemBrandsList;
