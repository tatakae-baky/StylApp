import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MyContext } from '../../App';
import { fetchDataFromApi, deleteData } from '../../utils/api';
import { Button } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Pagination from '@mui/material/Pagination';
import { FaEye } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";

const SubCategorySectionsList = () => {
    const [subCategorySectionList, setSubCategorySectionList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [deleteId, setDeleteId] = useState(null);

    const context = useContext(MyContext);

    useEffect(() => {
        context?.getCat();
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchDataFromApi(`/api/subCategorySections/get?page=${currentPage}`)
            .then((res) => {
                if (res && res.subCategorySections) {
                    setSubCategorySectionList(res.subCategorySections);
                    setTotalPages(res.totalPages || 1);
                } else {
                    setSubCategorySectionList([]);
                    setTotalPages(1);
                }
            })
            .catch((error) => {
                console.error("Error fetching subcategory sections:", error);
                setSubCategorySectionList([]);
                setTotalPages(1);
                context.alertBox("error", "Failed to fetch subcategory sections");
            });
    }, [currentPage]);

    const getCategoryPath = (item) => {
        const categories = [];
        
        // Check if context and catData exist
        if (!context || !context.catData || !Array.isArray(context.catData)) {
            return 'No category data available';
        }
        
        // Find category name
        if (item.catId) {
            const category = context.catData.find(cat => cat._id === item.catId);
            if (category) categories.push(category.name);
        }
        
        // Find subcategory name
        if (item.subCatId) {
            const subCategory = context.catData.find(cat => 
                cat.children?.some(sub => sub._id === item.subCatId)
            )?.children?.find(sub => sub._id === item.subCatId);
            if (subCategory) categories.push(subCategory.name);
        }
        
        // Find third level category name
        if (item.thirdsubCatId) {
            let thirdCategory = null;
            context.catData.forEach(cat => {
                if (cat.children) {
                    cat.children.forEach(sub => {
                        if (sub.children) {
                            const third = sub.children.find(third => third._id === item.thirdsubCatId);
                            if (third) thirdCategory = third;
                        }
                    });
                }
            });
            if (thirdCategory) categories.push(thirdCategory.name);
        }
        
        return categories.length > 0 ? categories.join(' > ') : 'No category selected';
    };

    const showConfirmModal = (id) => {
        setDeleteId(id);
        setIsOpenModal(true);
    };

    const deleteSubCategorySection = () => {
        setIsLoading(true);
        deleteData(`/api/subCategorySections/delete/${deleteId}`)
            .then((res) => {
                context.alertBox("success", "SubCategory section deleted successfully");
                setIsOpenModal(false);
                setIsLoading(false);
                
                // Refresh the list
                fetchDataFromApi(`/api/subCategorySections/get?page=${currentPage}`)
                    .then((res) => {
                        if (res && res.subCategorySections) {
                            setSubCategorySectionList(res.subCategorySections);
                            setTotalPages(res.totalPages || 1);
                        }
                    })
                    .catch((error) => {
                        console.error("Error refreshing list:", error);
                    });
            })
            .catch((error) => {
                console.error("Error deleting subcategory section:", error);
                context.alertBox("error", "Failed to delete subcategory section");
                setIsLoading(false);
                setIsOpenModal(false);
            });
    };

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    return (
        <>
            <section className="p-5 bg-gray-50 min-h-screen">
                <div className="card bg-white shadow rounded-lg">
                    <div className="card-header bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-lg">
                        <div className="d-flex align-items-center justify-content-between">
                            <h5 className="mb-0 font-semibold text-lg">SubCategory Sections List</h5>
                            <Link to="/subcategory-sections/add">
                                <Button className="btn-blue ml-3 text-white bg-blue-600 hover:bg-blue-700">
                                    <span className="mr-2">+</span> Add SubCategory Section
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="w-full">
                                <thead className="bg-gray-100">
                                    <tr className="border-b">
                                        <th className="text-left p-3 font-semibold">#</th>
                                        <th className="text-left p-3 font-semibold">Image</th>
                                        <th className="text-left p-3 font-semibold">Title</th>
                                        <th className="text-left p-3 font-semibold">Category Path</th>
                                        <th className="text-left p-3 font-semibold">Sort Order</th>
                                        <th className="text-left p-3 font-semibold">Status</th>
                                        <th className="text-left p-3 font-semibold">Date Created</th>
                                        <th className="text-left p-3 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subCategorySectionList?.length !== 0 && subCategorySectionList?.map((item, index) => {
                                        return (
                                            <tr className="border-b hover:bg-gray-50" key={index}>
                                                <td className="p-3">
                                                    <span className="text-blue-600 font-medium">
                                                        #{(currentPage - 1) * 10 + index + 1}
                                                    </span>
                                                </td>
                                                
                                                <td className="p-3">
                                                    <div className="productItem rounded-md overflow-hidden w-[60px] h-[60px]">
                                                        <img 
                                                            src={item.image} 
                                                            className="w-full h-full object-cover" 
                                                            alt={item.title}
                                                        />
                                                    </div>
                                                </td>
                                                
                                                <td className="p-3">
                                                    <span className="font-medium text-gray-800">{item.title}</span>
                                                </td>
                                                
                                                <td className="p-3">
                                                    <span className="text-sm text-gray-600">{getCategoryPath(item)}</span>
                                                </td>
                                                
                                                <td className="p-3">
                                                    <span className="text-sm font-medium">{item.sortOrder}</span>
                                                </td>
                                                
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        item.isActive 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {item.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                
                                                <td className="p-3">
                                                    <span className="text-sm text-gray-600">
                                                        {new Date(item.createdAt).toLocaleDateString()}
                                                    </span>
                                                </td>
                                                
                                                <td className="p-3">
                                                    <div className="actions flex gap-2">
                                                        <Link to={`/subcategory-sections/edit/${item._id}`}>
                                                            <Button className="btn-sm bg-blue-500 hover:bg-blue-600 text-white p-2 min-w-[40px]">
                                                                <MdEdit className="text-lg" />
                                                            </Button>
                                                        </Link>
                                                        
                                                        <Button 
                                                            className="btn-sm bg-red-500 hover:bg-red-600 text-white p-2 min-w-[40px]"
                                                            onClick={() => showConfirmModal(item._id)}
                                                        >
                                                            <MdDelete className="text-lg" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>

                            {subCategorySectionList?.length === 0 && (
                                <div className="text-center p-8">
                                    <p className="text-gray-500">No subcategory sections found</p>
                                </div>
                            )}
                        </div>

                        {totalPages > 1 && (
                            <div className="d-flex justify-content-center p-4 border-t">
                                <Pagination 
                                    count={totalPages} 
                                    page={currentPage} 
                                    onChange={handlePageChange}
                                    color="primary"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <Dialog open={isOpenModal} onClose={() => setIsOpenModal(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <p>Are you sure you want to delete this subcategory section?</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsOpenModal(false)}>Cancel</Button>
                    <Button 
                        onClick={deleteSubCategorySection} 
                        color="error" 
                        variant="contained"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default SubCategorySectionsList;
