import React, { useContext, useEffect, useState } from "react";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import "../Sidebar/style.css";
import { Collapse } from "react-collapse";
import { IoMdArrowDropdown } from "react-icons/io";
import Button from "@mui/material/Button";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";
import Rating from "@mui/material/Rating";
import { MyContext } from "../../App";
import { useLocation } from "react-router-dom";
import { postData, fetchDataFromApi } from "../../utils/api";
import { MdOutlineFilterAlt } from "react-icons/md";


export const Sidebar = (props) => {
  const { addFilter, removeFilter, clearAllFilters } = props;
  const [openSection, setOpenSection] = useState('category'); // 'category', 'brand', 'rating', or null
  const [brandData, setBrandData] = useState([]);
  const [isBrandDataLoaded, setIsBrandDataLoaded] = useState(false);

  const [filters, setFilters] = useState({
    catId: [],
    subCatId: [],
    thirdsubCatId: [],
    brandId: [],
    minPrice: '',
    maxPrice: '',
    rating: '',
    page: 1,
    limit: 25
  })



  const [price, setPrice] = useState([0, 60000]);
  const [minAmount, setMinAmount] = useState(0);
  const [maxAmount, setMaxAmount] = useState(60000);
  const [tempPrice, setTempPrice] = useState([0, 60000]);

  const context = useContext(MyContext);

  const location = useLocation();


  const handleCheckboxChange = (field, value) => {
    // Only clear search results when we're not on the search page
    // Search page should preserve its own search results  
    if (location.pathname !== '/search') {
      sessionStorage.removeItem('searchResults');
      sessionStorage.removeItem('searchQuery');
    }

    const currentValues = filters[field] || []
    const isRemoving = currentValues?.includes(value);
    const updatedValues = isRemoving ?
      currentValues.filter((item) => item !== value) :
      [...currentValues, value];

    setFilters((prev) => ({
      ...prev,
      [field]: updatedValues
    }))

    // Update active filters display
    if (addFilter && removeFilter) {
      if (isRemoving) {
        // Remove filter
        removeFilter({ type: field, value: value, label: getFilterLabel(field, value) });
      } else {
        // Add filter
        addFilter({ type: field, value: value, label: getFilterLabel(field, value) });
      }
    }

    if (field === "catId") {
      setFilters((prev) => ({
        ...prev,
        subCatId: [],
        thirdsubCatId: []
      }))
    }

  }

  const getFilterLabel = (field, value) => {
    switch(field) {
      case 'catId':
        const category = context?.catData?.find(cat => cat._id === value);
        return category?.name || 'Category';
      case 'brandId':
        const brand = brandData?.find(b => b._id === value);
        return brand?.name || 'Brand';
      case 'rating':
        return `${value}⭐`;
      default:
        return 'Filter';
    }
  };


  const clearOtherFilters = (exceptField) => {
    const fieldsToReset = ['catId', 'subCatId', 'thirdsubCatId', 'brandId', 'rating'];
    fieldsToReset.forEach(field => {
      if (field !== exceptField) {
        // Remove filter chips for cleared fields
        if (removeFilter && filters[field] && filters[field].length > 0) {
          filters[field].forEach(value => {
            removeFilter({ type: field, value: value, label: getFilterLabel(field, value) });
          });
        }
        filters[field] = [];
      }
    });
    // Only clear search results when we're not on the search page
    // Search page should preserve its own search results
    if (location.pathname !== '/search') {
      sessionStorage.removeItem('searchResults');
      sessionStorage.removeItem('searchQuery');
    }
  };

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  // Allow price section to be opened when needed
  const openPriceSection = () => {
    setOpenSection('price');
  };

  useEffect(() => {
    // Don't run URL-based filtering on search page to preserve search results
    if (location.pathname === '/search') {
      setOpenSection('category'); // Just set default open section
      return;
    }

    const queryParameters = new URLSearchParams(location.search);
    const url = window.location.href;

    // Set which section should be open based on URL parameters
    if (url.includes("catId") || url.includes("subCatId") || url.includes("thirdLavelCatId")) {
      setOpenSection('category');
    } else if (url.includes("brand")) {
      setOpenSection('brand');
    } else {
      // Default to category section if no specific filter is applied
      setOpenSection('category');
    }

    // Immediately clear product data and set loading when navigating to any filtered page
    // This prevents flickering of old product data
    if (url.includes("catId") || url.includes("subCatId") || url.includes("thirdLavelCatId") || url.includes("brand")) {
      props.setIsLoading(true);
      props.setProductsData({ products: [] });
    }

    // Don't proceed with filtering if we need brand data but it's not loaded yet
    if (url.includes("brand") && (!isBrandDataLoaded || brandData.length === 0)) {
      return;
    }

    if (url.includes("catId")) {
      const categoryId = queryParameters.get("catId");
      filters.catId = [categoryId];
      clearOtherFilters('catId');
      
      // Add filter chip for category
      if (addFilter && context?.catData?.length > 0) {
        const category = context.catData.find(cat => cat._id === categoryId);
        if (category) {
          addFilter({ type: 'catId', value: categoryId, label: category.name });
        }
      }
    }

    if (url.includes("subCatId")) {
      const subcategoryId = queryParameters.get("subCatId");
      filters.subCatId = [subcategoryId];
      clearOtherFilters('subCatId');
    }

    if (url.includes("thirdLavelCatId")) {
      const thirdcategoryId = queryParameters.get("thirdLavelCatId");
      filters.thirdsubCatId = [thirdcategoryId];
      clearOtherFilters('thirdsubCatId');
    }

    if (url.includes("brand")) {
      const brandSlug = queryParameters.get("brand");
      // Find brand by slug
      const foundBrand = brandData.find(brand => 
        brand.slug === brandSlug || 
        brand.name?.toLowerCase().replace(/\s+/g, '-') === brandSlug
      );
      
      if (foundBrand) {
        filters.brandId = [foundBrand._id];
        clearOtherFilters('brandId');
        
        // Add filter chip for brand
        if (addFilter) {
          addFilter({ type: 'brandId', value: foundBrand._id, label: foundBrand.name });
        }
      } else {
        // If brand not found, don't proceed with filtering
        return;
      }
    }

    filters.page = 1;

    // Apply filtering immediately for better user experience
    filtesData();

  }, [location, brandData, isBrandDataLoaded]);

  const filtesData = () => {
    props.setIsLoading(true);

    // Always fetch fresh data for filtering to prevent showing stale cached results
    postData(`/api/product/filters`, filters).then((res) => {
      props.setProductsData(res);
      props.setIsLoading(false);
      props.setTotalPages(res?.totalPages)
      window.scrollTo(0, 0);
    })
  }



  useEffect(() => {
    // Don't run filtering on search page to preserve search results
    if (location.pathname === '/search') {
      return;
    }
    
    // Only run filtering when we have the necessary data and when filters/page changes
    if (!isBrandDataLoaded) {
      return;
    }
    
    filters.page = props.page;
    filtesData();
  }, [filters, props.page, isBrandDataLoaded])


  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      minPrice: price[0],
      maxPrice: price[1]
    }))
  }, [price]);

  // Initialize temp price and input values when component mounts
  useEffect(() => {
    setMinAmount(price[0]);
    setMaxAmount(price[1]);
    setTempPrice(price);
  }, []);

  // Handle filter removal from ProductListing component
  useEffect(() => {
    if (props.activeFilters) {
      // Check if filters have been cleared
      if (props.activeFilters.length === 0) {
        // Reset all filters
        setFilters({
          catId: [],
          subCatId: [],
          thirdsubCatId: [],
          brandId: [],
          minPrice: '',
          maxPrice: '',
          rating: '',
          page: 1,
          limit: 25
        });
        setPrice([0, 60000]);
        setTempPrice([0, 60000]);
        setMinAmount(0);
        setMaxAmount(60000);
      }
    }
  }, [props.activeFilters]);

  // Add filter chips when category data becomes available (for URL navigation)
  useEffect(() => {
    const url = window.location.href;
    const queryParameters = new URLSearchParams(location.search);

    if (addFilter && context?.catData?.length > 0) {
      // Check if we have a category filter from URL but no chip yet
      if (url.includes("catId")) {
        const categoryId = queryParameters.get("catId");
        const category = context.catData.find(cat => cat._id === categoryId);
        if (category && filters.catId.includes(categoryId)) {
          // Only add if not already in active filters
          const exists = props.activeFilters?.some(f => f.type === 'catId' && f.value === categoryId);
          if (!exists) {
            addFilter({ type: 'catId', value: categoryId, label: category.name });
          }
        }
      }
    }
  }, [context?.catData, addFilter]);

  useEffect(() => {
    fetchDataFromApi("/api/brand/get")
      .then((res) => {
        setBrandData(res?.brands || []);
        setIsBrandDataLoaded(true);
      })
      .catch((error) => {
        console.error("Error fetching brands:", error);
        setIsBrandDataLoaded(true); // Set to true even on error to prevent infinite waiting
      });
  }, []);

  // Add brand filter chips when brand data becomes available (for URL navigation)
  useEffect(() => {
    const url = window.location.href;
    const queryParameters = new URLSearchParams(location.search);

    if (addFilter && isBrandDataLoaded && brandData.length > 0) {
      // Check if we have a brand filter from URL but no chip yet
      if (url.includes("brand")) {
        const brandSlug = queryParameters.get("brand");
        const foundBrand = brandData.find(brand => 
          brand.slug === brandSlug || 
          brand.name?.toLowerCase().replace(/\s+/g, '-') === brandSlug
        );
        
        if (foundBrand && filters.brandId.includes(foundBrand._id)) {
          // Only add if not already in active filters
          const exists = props.activeFilters?.some(f => f.type === 'brandId' && f.value === foundBrand._id);
          if (!exists) {
            addFilter({ type: 'brandId', value: foundBrand._id, label: foundBrand.name });
          }
        }
      }
    }
  }, [brandData, isBrandDataLoaded, addFilter]);

  // Set loading state immediately if we're on a brand-filtered URL on initial load
  useEffect(() => {
    const url = window.location.href;
    if (url.includes("brand") && !isBrandDataLoaded) {
      props.setIsLoading(true);
      props.setProductsData({ products: [] });
    }
  }, []);


  return (
    <aside className="sidebar py-3 lg:py-5 static lg:sticky top-[130px] z-[50] pr-0 ">
      <div className=" max-h-[60vh] lg:overflow-visible overflow-auto  w-full">
        <div className="box">
          <h3 className="w-full mb-3 text-[17px] font-bold text-gray-700 flex items-center pr-5">
            Shop by Category
            <Button
              className="!w-[30px] !h-[30px] !min-w-[30px] !rounded-full !ml-auto !text-[#000]"
              onClick={() => toggleSection('category')}
            >
              <IoMdArrowDropdown className={`transition-transform duration-200 ${openSection === 'category' ? 'rotate-180' : ''}`} />
            </Button>
          </h3>
          <Collapse isOpened={openSection === 'category'}>
            <div className="scroll px-4 relative -left-[20px]">


              {
                context?.catData?.length !== 0 && context?.catData?.map((item, index) => {
                  const isSelected = filters?.catId?.includes(item?._id);
                  return (
                    <div
                      key={index}
                      onClick={() => handleCheckboxChange('catId', item?._id)}
                      className={`w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors duration-150 ${
                        isSelected ? 'bg-pink-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isSelected 
                            ? 'border-red-600 bg-red-600' 
                            : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <span className={`text-[14px] text-gray-700 ${isSelected ? 'font-bold' : ''}`}>
                          {item?.name}
                        </span>
                      </div>
                    </div>
                  )
                })
              }

            </div>
          </Collapse>
        </div>

        <div className="box mt-4">
          <h3 className="w-full mb-3 text-[17px] font-bold text-gray-700 flex items-center pr-5">
            Filter By Price
            <Button
              className="!w-[30px] !h-[30px] !min-w-[30px] !rounded-full !ml-auto !text-[#000]"
              onClick={() => toggleSection('price')}
            >
              <IoMdArrowDropdown className={`transition-transform duration-200 ${openSection === 'price' ? 'rotate-180' : ''}`} />
            </Button>
          </h3>
          <Collapse isOpened={openSection === 'price'}>
            <div className="px-4 relative -left-[13px]">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-[12px] text-gray-500 mb-1 block">Min. Amount</label>
                  <input
                    type="number"
                    value={minAmount}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setMinAmount(value);
                      setTempPrice([value, tempPrice[1]]);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 text-[15px] text-gray-700 font-medium bg-white hover:border-gray-400 focus:outline-none focus:border-gray-400 transition-colors duration-200"
                    min="0"
                    max="60000"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-[12px] text-gray-500 mb-1 block">Max. Amount</label>
                  <input
                    type="number"
                    value={maxAmount}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 60000;
                      setMaxAmount(value);
                      setTempPrice([tempPrice[0], value]);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 text-[15px] text-gray-700 font-medium bg-white hover:border-gray-400 focus:outline-none focus:border-gray-400 transition-colors duration-200"
                    min="0"
                    max="60000"
                    placeholder="60000"
                  />
                </div>
              </div>

              <div className="mb-4">
                <RangeSlider
                  value={tempPrice}
                  onInput={(value) => {
                    setTempPrice(value);
                    setMinAmount(value[0]);
                    setMaxAmount(value[1]);
                  }}
                  min={0}
                  max={60000}
                  setp={100}
                />
                <div className="flex justify-between pt-2 text-[13px] text-gray-600">
                  <span>Tk {tempPrice[0].toLocaleString()}</span>
                  <span>Tk {tempPrice[1].toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setPrice(tempPrice);
                  // Add price filter to active filters
                  if (addFilter && (tempPrice[0] > 0 || tempPrice[1] < 60000)) {
                    addFilter({ 
                      type: 'price', 
                      value: `${tempPrice[0]}-${tempPrice[1]}`, 
                      label: `Price: Tk ${tempPrice[0].toLocaleString()} - Tk ${tempPrice[1].toLocaleString()}` 
                    });
                  }
                }}
                className="w-full flex items-center justify-center px-4 py-2 bg-white border border-gray-300 hover:border-red-600 hover:bg-pink-50 hover:text-gray-700 font-medium transition-colors duration-200 text-[14px] text-gray-700"
              >
                Apply
              </button>
            </div>
          </Collapse>
        </div>

        <div className="box mt-4">
          <h3 className="w-full mb-3 text-[17px] font-bold text-gray-700 flex items-center pr-5">
            Shop by Brand
            <Button
              className="!w-[30px] !h-[30px] !min-w-[30px] !rounded-full !ml-auto !text-[#000]"
              onClick={() => toggleSection('brand')}
            >
              <IoMdArrowDropdown className={`transition-transform duration-200 ${openSection === 'brand' ? 'rotate-180' : ''}`} />
            </Button>
          </h3>
          <Collapse isOpened={openSection === 'brand'}>
            <div className="scroll px-4 relative -left-[13px]">
              {
                brandData?.length !== 0 && brandData?.slice(0, 10)?.map((item, index) => {
                  const isSelected = filters?.brandId?.includes(item?._id);
                  return (
                    <div
                      key={index}
                      onClick={() => handleCheckboxChange('brandId', item?._id)}
                      className={`w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors duration-150 ${
                        isSelected ? 'bg-pink-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isSelected 
                            ? 'border-red-600 bg-red-600' 
                            : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <span className={`text-[14px] text-gray-700 ${isSelected ? 'font-bold' : ''}`}>
                          {item?.name}
                        </span>
                      </div>
                    </div>
                  )
                })
              }
            </div>
          </Collapse>
        </div>

        <div className="box mt-4">
          <h3 className="w-full mb-3 text-[17px] font-bold text-gray-700 flex items-center pr-5">
            Filter By Rating
            <Button
              className="!w-[30px] !h-[30px] !min-w-[30px] !rounded-full !ml-auto !text-[#000]"
              onClick={() => toggleSection('rating')}
            >
              <IoMdArrowDropdown className={`transition-transform duration-200 ${openSection === 'rating' ? 'rotate-180' : ''}`} />
            </Button>
          </h3>
          <Collapse isOpened={openSection === 'rating'}>

            <div className="px-4 relative -left-[13px]">
              {[5, 4, 3, 2, 1].map((rating) => {
                const isSelected = filters?.rating?.includes(rating);
                return (
                  <div
                    key={rating}
                    onClick={() => handleCheckboxChange('rating', rating)}
                    className={`w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors duration-150 ${
                      isSelected ? 'bg-pink-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        isSelected 
                          ? 'border-red-600 bg-red-600' 
                          : 'border-gray-300'
                      }`}>
                        {isSelected && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <span className={`text-[14px] text-gray-700 ${isSelected ? 'font-bold' : ''}`}>
                        {rating}⭐
                      </span>
                    </div>
                    
                  </div>
                )
              })}
            </div>
          </Collapse>
        </div>


      </div>
      <br />
      <Button className="btn-org w-full !flex lg:!hidden" onClick={() => context?.setOpenFilter(false)}><MdOutlineFilterAlt size={20} /> Filers</Button>


    </aside>
  );
};
