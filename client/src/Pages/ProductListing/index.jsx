import React, { useContext, useEffect, useState } from "react";
import { Sidebar } from "../../components/Sidebar";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import ProductItem from "../../components/ProductItem";

import Button from "@mui/material/Button";
import { IoMdArrowDropdown } from "react-icons/io";
import { BiSortDown } from "react-icons/bi";
import { MdClose } from "react-icons/md";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Pagination from "@mui/material/Pagination";
import ProductLoadingGrid from "../../components/ProductLoading/productLoadingGrid";
import { postData } from "../../utils/api";
import { MyContext } from "../../App";

const ProductListing = () => {

  const [anchorEl, setAnchorEl] = React.useState(null);

  const [productsData, setProductsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedSortVal, setSelectedSortVal] = useState("Popularity");
  const [activeFilters, setActiveFilters] = useState([]);

  const context = useContext(MyContext);

  const open = Boolean(anchorEl);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (open && !event.target.closest('.sort-dropdown')) {
        setAnchorEl(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };



  const handleSortBy = (name, order, products, value) => {
    setSelectedSortVal(value);
    postData(`/api/product/sortBy`, {
      products: products,
      sortBy: name,
      order: order
    }).then((res) => {
      setProductsData(res);
      setAnchorEl(null);
    })
  }

  const addFilter = (filter) => {
    setActiveFilters(prev => {
      // Remove existing filter of same type and value
      const filtered = prev.filter(f => !(f.type === filter.type && f.value === filter.value));
      return [...filtered, filter];
    });
  };

  const removeFilter = (filterToRemove) => {
    setActiveFilters(prev => prev.filter(f => 
      !(f.type === filterToRemove.type && f.value === filterToRemove.value)
    ));
    // Note: Individual filter removal will be handled by implementing
    // specific removal logic for each filter type in sidebar
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    // The sidebar will respond to this change via useEffect
  };

  return (
    <section className=" pb-0">
      <div className="bg-white p-2">
        <div className="flex gap-0 min-[380px]:gap-1">
          <div className={`sidebarWrapper fixed -bottom-[100%] left-0 w-full lg:h-full lg:static lg:w-[20%] bg-white z-[102] lg:z-[100] p-2 lg:p-0  transition-all lg:opacity-100 opacity-0 ${context?.openFilter === true ? 'open' : ''}`}>
            <Sidebar
              productsData={productsData}
              setProductsData={setProductsData}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              page={page}
              setTotalPages={setTotalPages}
              addFilter={addFilter}
              removeFilter={removeFilter}
              clearAllFilters={clearAllFilters}
              activeFilters={activeFilters}
            />
          </div>

          {
            context?.windowWidth < 992 &&
            <div className={`filter_overlay w-full h-full bg-[rgba(0,0,0,0.5)] fixed top-0 left-0 z-[101]  ${context?.openFilter === true ? 'block' : 'hidden'}`}
              onClick={()=>context?.setOpenFilter(false)}
            ></div>
          }


          <div className="rightContent p-0 min-[380px]:p-2 w-full lg:w-[80%] ">
            <div className="pt-1 pb-2 w-full flex items-center justify-between top-[135px] z-[99] px-1 min-[380px]:px-0 gap-2">
              {/* Active Filters Display */}
              <div className="flex items-center gap-2 flex-wrap">
                {activeFilters.map((filter, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1 bg-pink-100 border border-pink-300 rounded-full text-[13px] text-gray-700"
                  >
                    <span>{filter.label}</span>
                    <button
                      onClick={() => removeFilter(filter)}
                      className="text-pink-600 hover:text-red-600 transition-colors duration-200"
                    >
                      <MdClose className="text-[14px]" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <span className="text-[15px] font-[600] text-[rgba(0,0,0,0.7)]">
                  {productsData?.products?.length !== 0 ? productsData?.products?.length : 0} results
                </span>
                
                <div className="relative sort-dropdown">
                  <button
                    onClick={handleClick}
                    className={`flex items-center justify-between gap-3 px-4 py-2 bg-white border border-gray-300 hover:border-gray-400 transition-colors duration-200 min-w-[200px] ${open ? 'border-gray-400' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <BiSortDown className="text-[rgba(0,0,0,0.6)] text-[16px]" />
                      <span className="text-[15px] text-gray-700 font-medium">
                        Sort by <span className="text-red-600 font-bold text-[16px]">{selectedSortVal}</span>
                      </span>
                    </div>
                    <IoMdArrowDropdown className={`text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {open && (
                    <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 shadow-lg z-50">
                      <div className="py-1">
                        {[
                          { label: 'Popularity', value: 'Popularity', sortBy: 'rating', order: 'desc' },
                          { label: 'Price: Low to High', value: 'Price: Low to High', sortBy: 'price', order: 'asc' },
                          { label: 'Price: High to Low', value: 'Price: High to Low', sortBy: 'price', order: 'desc' },
                          { label: 'Name: A to Z', value: 'Name: A to Z', sortBy: 'name', order: 'asc' },
                          { label: 'Name: Z to A', value: 'Name: Z to A', sortBy: 'name', order: 'desc' }
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleSortBy(option.sortBy, option.order, productsData, option.value)}
                            className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 ${
                              selectedSortVal === option.value ? 'bg-pink-50' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                selectedSortVal === option.value 
                                  ? 'border-red-600 bg-red-600' 
                                  : 'border-gray-300'
                              }`}>
                                {selectedSortVal === option.value && (
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                )}
                              </div>
                              <span className="text-[14px] text-gray-700">
                                {option.label}
                              </span>
                            </div>
                            {selectedSortVal === option.value && (
                              <div className="text-red-600 text-[16px]">✓</div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-1 min-[380px]:gap-2 sm:gap-3 md:gap-3">
              {isLoading === true ? (
                <ProductLoadingGrid view="grid" />
              ) : (
                productsData?.products?.length !== 0 && 
                productsData?.products?.map((item, index) => (
                  <ProductItem key={index} item={item} />
                ))
              )}
            </div>

            {
              totalPages > 1 &&
              <div className="flex items-center justify-center mt-10">
                <Pagination
                  showFirstButton showLastButton
                  count={totalPages}
                  page={page}
                  onChange={(e, value) => setPage(value)}
                />
              </div>
            }


          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductListing;
