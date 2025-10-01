import React, { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Badge from "@mui/material/Badge";
import { styled } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Navigation from "./Navigation";
import { MyContext } from "../../App";
import { Button } from "@mui/material";

import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { IoBagCheckOutline } from "react-icons/io5";
import { IoMdHeartEmpty } from "react-icons/io";
import { IoIosLogOut } from "react-icons/io";
import { RxHamburgerMenu } from "react-icons/rx";
import { fetchDataFromApi } from "../../utils/api";
import { LuMapPin } from "react-icons/lu";
import { useEffect } from "react";
import AdvancedSearchInput from "../AdvancedSearchInput";
import useEnhancedSearch from "../../utils/useEnhancedSearch";

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: "0 4px",
    backgroundColor: "#FF2E4D",
    color: "white",
    fontSize: "11px",
    fontWeight: "bold",
    minWidth: "18px",
    height: "18px",
  },
}));

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [openMobileSearch, setOpenMobileSearch] = useState(false);
  const [openMobileSidebar, setOpenMobileSidebar] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const open = Boolean(anchorEl);
  const context = useContext(MyContext);
  const history = useNavigate();

  // Enhanced search functionality
  const {
    searchQuery,
    suggestions,
    isLoading,
    showSuggestions,
    searchHistory,
    setSearchQuery,
    performSearch,
    performExplicitSearch, // Add explicit search function
    setShowSuggestions,
    clearHistory
  } = useEnhancedSearch();

  // Handle explicit search execution (Enter, click search, click suggestion)
  const handleSearch = async (query) => {
    if (query.trim()) {
      console.log('🎯 HEADER: Explicit search action for:', query);
      await performExplicitSearch(query); // Wait for search to complete before navigation
      
      // Close mobile search if open
      setOpenMobileSearch(false);
      
      history("/search");
    }
  };

  // Toggle category expansion in mobile sidebar
  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Close mobile sidebar and reset expanded categories
  const closeMobileSidebar = () => {
    setOpenMobileSidebar(false);
    setExpandedCategories({});
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const location = useLocation();

  useEffect(() => {
    fetchDataFromApi("/api/logo").then((res) => {
      localStorage.setItem("logo", res?.logo[0]?.logo);
    });

    // Remove problematic timeout-based auth check
    // This was causing unnecessary rerenders and redirects
  }, []); // Empty dependency array to run only once on mount

  const logout = () => {
    setAnchorEl(null);

    fetchDataFromApi(
      `/api/user/logout?token=${localStorage.getItem("accessToken")}`,
      { withCredentials: true }
    ).then((res) => {
      if (res?.error === false) {
        context.setIsLogin(false);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        context.setUserData(null);
        context?.setCartData([]);
        context?.setMyListData([]);
        history("/");
      }
    });
  };

  return (
    <>
      <header className="bg-white fixed lg:sticky left-0 w-full top-0 lg:-top-[0px] z-[101]">
        {/* Main Header Row */}
        <div className="header p-3 lg:pt-4 lg:pb-0 ">
          <div className="container flex items-center justify-between gap-4">
            
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to={"/"}>
                <img
                  src={localStorage.getItem("logo")}
                  className="max-w-[120px] lg:max-w-[160px] h-auto"
                  alt="Styl' Logo"
                />
              </Link>
            </div>

            {/* Search Bar - Only show on desktop */}
            {context?.windowWidth > 992 && (
              <div className="flex-1 max-w-2xl mx-8">
                <AdvancedSearchInput
                  searchQuery={searchQuery}
                  onSearchQueryChange={setSearchQuery}
                  suggestions={suggestions}
                  searchHistory={searchHistory}
                  showSuggestions={showSuggestions}
                  onShowSuggestions={setShowSuggestions}
                  onSearch={handleSearch}
                  onClearHistory={clearHistory}
                  isLoading={isLoading}
                  placeholder="Search for products..."
                  className="w-full"
                />
              </div>
            )}

            {/* Mobile Search Bar - Centered between logo and hamburger menu */}
            {context?.windowWidth <= 992 && (
              <div className="flex-1 mx-2 sm:mx-4 sm:max-w-md">
                <div 
                  className="w-full bg-white border border-gray-300 px-2 sm:px-3 py-2 cursor-pointer"
                  onClick={() => setOpenMobileSearch(true)}
                >
                  <div className="flex items-center gap-2">
                    <img src="/search-not-filled.svg" alt="Styl' Search" className="w-4 h-4 opacity-60 flex-shrink-0" />
                    <span className="text-sm text-gray-500 truncate">Search for products...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Right Icons */}
            <div className="flex items-center gap-3 lg:gap-4">
              {/* Profile/Account - Only show on desktop */}
              {context?.windowWidth > 992 && (
                <>
                  {context.isLogin !== true ? (
                    <div className="flex items-center gap-2 text-sm">
                      <Link
                        to="/login"
                        className="text-black hover:text-red-500 transition font-medium"
                      >
                        Login
                      </Link>
                      <span className="text-gray-400">|</span>
                      <Link
                        to="/register"
                        className="text-black hover:text-red-500 transition font-medium"
                      >
                        Register
                      </Link>
                    </div>
                  ) : (
                    <>
                      <IconButton
                        onClick={handleClick}
                        className="!p-2"
                      >
                        <img src="/profile-not-filled.svg" alt="Styl' Profile" className="w-6 h-6" />
                      </IconButton>

                      <Menu
                        anchorEl={anchorEl}
                        id="account-menu"
                        open={open}
                        onClose={handleClose}
                        onClick={handleClose}
                        slotProps={{
                          paper: {
                            elevation: 0,
                            sx: {
                              overflow: "visible",
                              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                              mt: 1.5,
                              "& .MuiAvatar-root": {
                                width: 32,
                                height: 32,
                                ml: -0.5,
                                mr: 1,
                              },
                              "&::before": {
                                content: '""',
                                display: "block",
                                position: "absolute",
                                top: 0,
                                right: 14,
                                width: 10,
                                height: 10,
                                bgcolor: "background.paper",
                                transform: "translateY(-50%) rotate(45deg)",
                                zIndex: 0,
                              },
                            },
                          },
                        }}
                        transformOrigin={{
                          horizontal: "right",
                          vertical: "top",
                        }}
                        anchorOrigin={{
                          horizontal: "right",
                          vertical: "bottom",
                        }}
                      >
                        <Link to="/my-account" className="w-full block">
                          <MenuItem onClick={handleClose} className="flex gap-2 !py-2">
                            <img src="/profile.svg" alt="Styl' Account" className="w-5 h-5" />
                            <span className="text-[14px]">My Account</span>
                          </MenuItem>
                        </Link>
                        <Link to="/address" className="w-full block">
                          <MenuItem onClick={handleClose} className="flex gap-2 !py-2">
                            <LuMapPin className="text-[18px]" />
                            <span className="text-[14px]">Address</span>
                          </MenuItem>
                        </Link>
                        <Link to="/my-orders" className="w-full block">
                          <MenuItem onClick={handleClose} className="flex gap-2 !py-2">
                            <IoBagCheckOutline className="text-[18px]" />
                            <span className="text-[14px]">Orders</span>
                          </MenuItem>
                        </Link>
                        <Link to="/my-list" className="w-full block">
                          <MenuItem onClick={handleClose} className="flex gap-2 !py-2">
                            <IoMdHeartEmpty className="text-[18px]" />
                            <span className="text-[14px]">My List</span>
                          </MenuItem>
                        </Link>
                        <MenuItem onClick={logout} className="flex gap-2 !py-2">
                          <IoIosLogOut className="text-[18px]" />
                          <span className="text-[14px]">Logout</span>
                        </MenuItem>
                      </Menu>
                    </>
                  )}
                </>
              )}

              {/* Wishlist */}
              {context?.windowWidth > 992 && (
                <Tooltip title="Wishlist">
                  <Link to="/my-list">
                    <div className="relative">
                      <IconButton className="!p-2">
                        <img src="/heart-not-filled.svg" alt="Styl' Wishlist" className="w-6 h-6" />
                      </IconButton>
                      {context?.myListData?.length > 0 && (
                        <StyledBadge
                          badgeContent={context?.myListData?.length}
                          color="secondary"
                        />
                      )}
                    </div>
                  </Link>
                </Tooltip>
              )}

              {/* Cart - Only show on desktop */}
              {context?.windowWidth > 992 && (
                <Tooltip title="Cart">
                  <div className="relative">
                    <IconButton
                      onClick={() => context.setOpenCartPanel(true)}
                      className="!p-2"
                    >
                      <img src="/cart.svg" alt="Styl' Cart" className="w-6 h-6" />
                    </IconButton>
                    {context?.cartData?.length > 0 && (
                      <StyledBadge
                        badgeContent={context?.cartData?.length}
                        color="secondary"
                      />
                    )}
                  </div>
                </Tooltip>
              )}

              {/* Mobile Menu Icon - Only show on mobile */}
              {context?.windowWidth <= 992 && (
                <Tooltip title="Menu">
                  <IconButton
                    onClick={() => setOpenMobileSidebar(true)}
                    className="!p-2"
                  >
                    <RxHamburgerMenu className="text-2xl" />
                  </IconButton>
                </Tooltip>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Bar */}
        {context?.windowWidth > 992 && (
          <div className="border-b-[1px] border-gray-200 bg-white">
            <div className="container">
              <Navigation />
            </div>
          </div>
        )}

        {/* Mobile Navigation - Only render bottom nav on mobile */}
        {context?.windowWidth <= 992 && <Navigation onlyMobileNav={true} />}

        {/* Mobile Search Panel */}
        <div
          className={`fixed top-0 left-0 w-full h-full lg:hidden bg-white z-50 ${
            openMobileSearch === true ? "block" : "hidden"
          }`}
        >
          {/* Close overlay */}
          <div 
            className="absolute inset-0 bg-transparent"
            onClick={() => setOpenMobileSearch(false)}
          ></div>
          
          <div className="relative p-4 pt-6">
            {/* Back Arrow and Search Input Container */}
            <div className="flex items-center gap-3 mb-4">
              {/* Back Arrow */}
              <button
                onClick={() => setOpenMobileSearch(false)}
                className="flex-shrink-0 p-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </button>
              
              {/* Search Input */}
              <div className="flex-1">
                <AdvancedSearchInput
                  searchQuery={searchQuery}
                  onSearchQueryChange={setSearchQuery}
                  suggestions={suggestions}
                  searchHistory={searchHistory}
                  showSuggestions={showSuggestions}
                  onShowSuggestions={setShowSuggestions}
                  onSearch={handleSearch}
                  onClearHistory={clearHistory}
                  isLoading={isLoading}
                  placeholder="Search for products..."
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Panel */}
        <div
          className={`fixed top-0 left-0 w-80 h-full bg-white z-50 transform transition-transform duration-300 lg:hidden ${
            openMobileSidebar ? "translate-x-0" : "-translate-x-full"
          } shadow-xl`}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-[24px] font-bold text-[#FF2E4D]">Styl'</h2>
            <Button
              onClick={closeMobileSidebar}
              className="!min-w-auto !p-2 !text-gray-800 hover:!text-gray-800"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </Button>
          </div>

          {/* Categories List */}
          <div className="overflow-y-auto h-full pb-20">
            {context?.catData?.length > 0 ? (
              <div>
                {/* Brands Link */}
                <Link 
                  to="/brands" 
                  onClick={closeMobileSidebar}
                  className="block py-2 px-6 text-gray-800 hover:bg-gray-50 border-b border-gray-100 font-medium"
                >
                  Brands
                </Link>

                {/* Categories */}
                {context.catData.map((cat, index) => (
                  <div key={index} className="border-b border-gray-100">
                    <div className="flex items-center">
                      <Link 
                        to={`/products?catId=${cat?._id}`}
                        onClick={closeMobileSidebar}
                        className="flex-1 block py-2 px-6 text-gray-800 hover:bg-gray-50 font-medium"
                      >
                        {cat?.name}
                      </Link>
                      {cat?.children?.length > 0 && (
                        <button
                          onClick={() => toggleCategoryExpansion(cat._id)}
                          className="p-4 hover:bg-gray-50"
                        >
                          <svg 
                            className={`w-4 h-4 transition-transform ${expandedCategories[cat._id] ? 'rotate-90' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      )}
                    </div>
                    
                    {/* Subcategories - Only show when expanded */}
                    {cat?.children?.length > 0 && expandedCategories[cat._id] && (
                      <div className="bg-gray-50">
                        {cat.children.map((subCat, subIndex) => (
                          <Link
                            key={subIndex}
                            to={`/products?catId=${cat?._id}&subCatId=${subCat?._id}`}
                            onClick={closeMobileSidebar}
                            className="block py-3 px-10 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-800 border-b border-gray-100"
                          >
                            {subCat?.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Additional Links */}
                <div className="mt-6 px-6 py-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Explore</h3>
                  <div className="space-y-2">
                    <Link 
                      to="/my-account" 
                      onClick={closeMobileSidebar}
                      className="block py-2 text-gray-600 hover:text-gray-800"
                    >
                      My Account
                    </Link>
                    <Link 
                      to="/my-orders" 
                      onClick={closeMobileSidebar}
                      className="block py-2 text-gray-600 hover:text-gray-800"
                    >
                      My Orders
                    </Link>
                    <Link 
                      to="/my-list" 
                      onClick={closeMobileSidebar}
                      className="block py-2 text-gray-600 hover:text-gray-800"
                    >
                      Wishlist
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="text-center text-gray-500">Loading categories...</div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {openMobileSidebar && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={closeMobileSidebar}
          ></div>
        )}
      </header>

      <div className="afterHeader mt-[70px] lg:mt-0"></div>
    </>
  );
};

export default Header;
