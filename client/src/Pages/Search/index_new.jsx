import React, { useContext, useEffect, useState } from "react";
import { Sidebar } from "../../components/Sidebar";
import ProductItem from "../../components/ProductItem";
import ProductItemListView from "../../components/ProductItemListView";
import Button from "@mui/material/Button";
import { IoGridSharp } from "react-icons/io5";
import { LuMenu } from "react-icons/lu";
import { IoMdArrowDropdown } from "react-icons/io";
import { BiSortDown } from "react-icons/bi";
import Pagination from "@mui/material/Pagination";
import ProductLoadingGrid from "../../components/ProductLoading/productLoadingGrid";
import { postData } from "../../utils/api";
import { MyContext } from "../../App";
import { SearchFeedback } from "../../components/SearchFeedback";
import { useNavigate, useLocation } from "react-router-dom";
import AdvancedSearchInput from "../../components/AdvancedSearchInput";

const SearchPage = () => {
  const [itemView, setItemView] = useState("grid");
  const [anchorEl, setAnchorEl] = React.useState(null);

  const [productsData, setProductsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentSearchQuery, setCurrentSearchQuery] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedSortVal, setSelectedSortVal] = useState("Name, A to Z");

  const context = useContext(MyContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Load search results from sessionStorage
    const searchResults = sessionStorage.getItem('searchResults');
    const searchQuery = sessionStorage.getItem('searchQuery');
    
    if (searchResults) {
      try {
        const parsedResults = JSON.parse(searchResults);
        setProductsData(parsedResults);
        setCurrentSearchQuery(searchQuery || "");
        
        if (parsedResults?.totalPages) {
          setTotalPages(parsedResults.totalPages);
        }
      } catch (error) {
        console.error('Error parsing search results:', error);
        setError('Failed to load search results');
      }
    }
  }, [])

  // Handle pagination
  useEffect(() => {
    if (page > 1 && currentSearchQuery) {
      handlePageSearch(page);
    }
  }, [page]);

  // Handle search for specific page
  const handlePageSearch = (pageNum) => {
    const searchData = {
      page: pageNum,
      limit: 20,
      query: currentSearchQuery
    };

    setIsLoading(true);
    setError(null);

    postData('/api/product/search/get', searchData)
      .then((res) => {
        setProductsData(res);
        sessionStorage.setItem('searchResults', JSON.stringify(res));
        
        if (res?.totalPages) {
          setTotalPages(res.totalPages);
        }
      })
      .catch((error) => {
        console.error('Search error:', error);
        setError('Search failed. Please try again.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Handle retry for failed searches
  const handleRetry = () => {
    setError(null);
    // Reload the page to retry
    window.location.reload();
  };

  // Handle suggestion clicks
  const handleSuggestionClick = (suggestion) => {
    // Store the suggestion as a new search
    sessionStorage.setItem('searchQuery', suggestion);
    
    // Perform new search
    const searchData = {
      page: 1,
      limit: 20,
      query: suggestion
    };

    setIsLoading(true);
    setError(null);
    setPage(1); // Reset to page 1

    postData('/api/product/search/get', searchData)
      .then((res) => {
        setProductsData(res);
        setCurrentSearchQuery(suggestion);
        sessionStorage.setItem('searchResults', JSON.stringify(res));
        
        if (res?.totalPages) {
          setTotalPages(res.totalPages);
        }
      })
      .catch((error) => {
        console.error('Search error:', error);
        setError('Search failed. Please try again.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const open = Boolean(anchorEl);
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

  return (
    <section className="pb-0">
      <div className="bg-white p-2">
        <div className="px-6 flex gap-1">
          <div className={`sidebarWrapper fixed -bottom-[100%] left-0 w-fulllg:h-full lg:static lg:w-[20%] bg-white z-[102] lg:z-[100] p-2 lg:p-0  transition-all lg:opacity-100 opacity-0 ${context?.openFilter === true ? 'open' : ''}`}>
            <Sidebar
              productsData={productsData}
              setProductsData={setProductsData}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              page={page}
              setTotalPages={setTotalPages}
            />
          </div>

          {
            context?.windowWidth < 992 &&
            <div className={`filter_overlay w-full h-full bg-[rgba(0,0,0,0.5)] fixed top-0 left-0 z-[101]  ${context?.openFilter === true ? 'block' : 'hidden'}`}
              onClick={()=>context?.setOpenFilter(false)}
            ></div>
          }

          <div className="rightContent p-2 w-full lg:w-[80%] ">
            {/* Search Query Display */}
            {currentSearchQuery && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <span className="text-sm text-gray-600">
                  Search results for: <span className="font-semibold text-blue-800">"{currentSearchQuery}"</span>
                </span>
              </div>
            )}

            <div className="pt-1 pb-2 w-full flex items-center justify-between top-[135px] z-[99]">
              {/* View Toggle and Results Count */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    className={`w-[35px] h-[35px] min-w-[35px] rounded-full text-black ${itemView === "list" ? "bg-gray-300" : ""}`}
                    onClick={() => setItemView("list")}
                  >
                    <LuMenu className="text-gray-700 text-[16px]" />
                  </Button>
                  <Button
                    className={`w-[35px] h-[35px] min-w-[35px] rounded-full text-black ${itemView === "grid" ? "bg-gray-300" : ""}`}
                    onClick={() => setItemView("grid")}
                  >
                    <IoGridSharp className="text-gray-700 text-[14px]" />
                  </Button>
                </div>

                <span className="text-[15px] font-[600] text-gray-700">
                  {productsData?.products?.length !== 0 ? productsData?.products?.length : 0} results
                </span>
              </div>

              {/* Sort Dropdown */}
              <div className="relative sort-dropdown">
                <button
                  onClick={handleClick}
                  className={`flex items-center justify-between gap-3 px-4 py-2 bg-white border border-gray-300 hover:border-gray-400 transition-colors duration-200 min-w-[200px] ${open ? 'border-gray-400' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <BiSortDown className="text-gray-600 text-[16px]" />
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
                        { label: 'Name: A to Z', value: 'Name: A to Z', sortBy: 'name', order: 'asc' },
                        { label: 'Name: Z to A', value: 'Name: Z to A', sortBy: 'name', order: 'desc' },
                        { label: 'Price: Low to High', value: 'Price: Low to High', sortBy: 'price', order: 'asc' },
                        { label: 'Price: High to Low', value: 'Price: High to Low', sortBy: 'price', order: 'desc' }
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

            <SearchFeedback
              isLoading={isLoading}
              error={error}
              results={productsData?.products || []}
              query={currentSearchQuery}
              onRetry={handleRetry}
              onSuggestionClick={handleSuggestionClick}
            >
              <div
                className={`grid ${itemView === "grid"
                  ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-1 min-[380px]:gap-2 sm:gap-3 md:gap-3"
                  : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-1 gap-2 md:gap-3"
                }`}
              >
                {itemView === "grid" ? (
                  <>
                    {productsData?.products?.map((item, index) => (
                      <ProductItem key={index} item={item} />
                    ))}
                  </>
                ) : (
                  <>
                    {productsData?.products?.map((item, index) => (
                      <ProductItemListView key={index} item={item} />
                    ))}
                  </>
                )}
              </div>
            </SearchFeedback>

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

export default SearchPage;
