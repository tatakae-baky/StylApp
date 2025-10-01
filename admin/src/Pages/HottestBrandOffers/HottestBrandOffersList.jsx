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
 * Hottest Brand Offers List Component
 * Displays and manages hottest brand offers
 */
export const HottestBrandOffersList = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [offerData, setOfferData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const context = useContext(MyContext);

    const columns = [
        { id: "image", label: "IMAGE", minWidth: 100 },
        { id: "discount", label: "DISCOUNT", minWidth: 150 },
        { id: "description", label: "DESCRIPTION", minWidth: 200 },
        { id: "brand", label: "BRAND", minWidth: 150 },
        { id: "status", label: "STATUS", minWidth: 100 },
        { id: "sortOrder", label: "ORDER", minWidth: 80 },
        { id: "action", label: "ACTION", minWidth: 150 },
    ];

    useEffect(() => {
        getData();
    }, []);

    /**
     * Fetch hottest brand offers data
     */
    const getData = () => {
        setIsLoading(true);
        fetchDataFromApi("/api/hottestBrandOffers").then((res) => {
            setOfferData(res?.data || []);
            setIsLoading(false);
        }).catch((error) => {
            console.error('Error fetching hottest brand offers:', error);
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
     * Delete hottest brand offer
     */
    const deleteOffer = (id) => {
        if (context?.userData?.role === "ADMIN") {
            if (window.confirm("Are you sure you want to delete this hottest brand offer?")) {
                deleteData(`/api/hottestBrandOffers/${id}`).then((res) => {
                    context.alertBox("success", "Hottest brand offer deleted successfully");
                    getData();
                }).catch((error) => {
                    context.alertBox("error", "Failed to delete hottest brand offer");
                });
            }
        } else {
            context.alertBox("error", "You don't have permission to delete");
        }
    };

    /**
     * Render offer image
     */
    const renderImage = (imageUrl) => {
        return (
            <div className="d-flex align-items-center productBox">
                <div className="imgWrapper">
                    <div className="img card shadow m-0">
                        <img
                            src={imageUrl}
                            className="w-100"
                            alt="Offer"
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

    return (
        <>
            <div className="right-content w-100">
                <div className="card shadow border-0 w-100 flex-row p-4 mt-2">
                    <h5 className="mb-0">Hottest Brand Offers List</h5>
                    <div className="ml-auto d-flex align-items-center">
                        <Button className="btn-blue ml-3 pl-3 pr-3">
                            <IoMdAdd />
                            <Link to="/hottestBrandOffers/add" className="text-white text-decoration-none">
                                Add Hottest Brand Offer
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
                                    ) : offerData.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={columns.length} className="text-center">
                                                No hottest brand offers found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        offerData
                                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                            .map((offer, index) => (
                                                <TableRow hover role="checkbox" tabIndex={-1} key={offer._id}>
                                                    <TableCell className="tableCell">
                                                        {renderImage(offer.image)}
                                                    </TableCell>
                                                    <TableCell className="tableCell">
                                                        <span className="text-primary font-weight-bold">
                                                            {offer.discount}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="tableCell">
                                                        <span className="text-muted">
                                                            {offer.description}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="tableCell">
                                                        <span className="text-dark font-weight-bold">
                                                            {offer.brandId?.name || 'Unknown Brand'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="tableCell">
                                                        {renderStatus(offer.isActive)}
                                                    </TableCell>
                                                    <TableCell className="tableCell">
                                                        <span className="badge badge-primary">
                                                            {offer.sortOrder}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="tableCell">
                                                        <div className="actions d-flex align-items-center">
                                                            <Link to={`/hottestBrandOffers/edit/${offer._id}`}>
                                                                <Button className="secondary" color="secondary">
                                                                    <FaRegEye />
                                                                </Button>
                                                            </Link>
                                                            <Link to={`/hottestBrandOffers/edit/${offer._id}`}>
                                                                <Button className="success" color="success">
                                                                    <AiOutlineEdit />
                                                                </Button>
                                                            </Link>
                                                            <Button 
                                                                className="error" 
                                                                color="error"
                                                                onClick={() => deleteOffer(offer._id)}
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
                            count={offerData.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            className="table-pagination"
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default HottestBrandOffersList;
