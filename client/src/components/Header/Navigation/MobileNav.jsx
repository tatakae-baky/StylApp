import { Button } from '@mui/material'
import React, { useContext, useEffect } from 'react';
import { NavLink, useNavigate } from "react-router-dom";
import { MdOutlineFilterAlt } from "react-icons/md";
import { MyContext } from '../../../App';
import { useLocation } from "react-router-dom";

// Import SVG icons - use public URL paths instead of relative imports
const homeFilled = '/home.svg';
const homeNotFilled = '/home-not-filled.svg';
const searchFilled = '/search.svg';
const searchNotFilled = '/search-not-filled.svg';
const heartFilled = '/heart.svg';
const heartNotFilled = '/heart-not-filled.svg';
const cartFilled = '/cart.svg';
const cartNotFilled = '/cart-not-filled.svg';
const brandFilled = '/brand.svg';
const brandNotFilled = '/brand-not-filled.svg';
const profileFilled = '/profile.svg';
const profileNotFilled = '/profile-not-filled.svg';

/**
 * MobileNav Component
 * 
 * Renders the mobile navigation bar with SVG icons that change between
 * filled and not-filled states based on the active route
 */
const MobileNav = () => {

    const context = useContext(MyContext)
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // Show filter button only on products or search pages
        if (location.pathname === "/products" || location.pathname === "/search") {
            context?.setisFilterBtnShow(true)
        } else {
            context?.setisFilterBtnShow(false)
        }
    }, [location]);

    /**
     * Opens the filter panel
     */
    const openFilters = () => {
        context?.setOpenFilter(true);
    }

    /**
     * Handles authentication-protected navigation
     * @param {string} path - The path to navigate to
     * @param {Event} e - Click event
     */
    const handleProtectedNavigation = (path, e) => {
        e.preventDefault();
        if (!context.isLogin) {
            navigate('/login');
        } else {
            navigate(path);
        }
    }

    /**
     * Renders an SVG icon based on the current route and target path
     * @param {string} targetPath - The path to check against current location
     * @param {string} filledIcon - The filled SVG icon import
     * @param {string} notFilledIcon - The not-filled SVG icon import
     * @param {number} size - The size of the icon (default: 18)
     * @returns {JSX.Element} The appropriate SVG icon
     */
    const renderIcon = (targetPath, filledIcon, notFilledIcon, size = 18) => {
        const isActive = location.pathname === targetPath;
        const iconSrc = isActive ? filledIcon : notFilledIcon;
        
        return (
            <img 
                src={iconSrc} 
                alt={`${targetPath} icon`} 
                width={size} 
                height={size}
                className="transition-all duration-200"
            />
        );
    };

    /**
     * Check if a path is currently active
     * @param {string} path - The path to check
     * @returns {boolean} Whether the path is active
     */
    const isPathActive = (path) => {
        return location.pathname === path;
    };

    return (
        <div className='mobileNav bg-white p-2 px-4 w-full flex items-center justify-between fixed bottom-0 left-0 gap-0 z-[51] border-t border-gray-200 shadow-lg'>
            {/* Home Navigation */}
            <NavLink to="/" className={({ isActive }) => isActive ? "isActive" : ""}>
                <Button className="flex-col !w-[40px] !min-w-[40px] !capitalize !text-gray-700">
                    {renderIcon("/", homeFilled, homeNotFilled, 20)}
                    <span className='text-[11px] font-medium'>Home</span>
                </Button>
            </NavLink>

            {/* Filter Button - Only shown on products/search pages */}
            {
                context?.isFilterBtnShow === true &&
                <Button className="flex-col !w-[40px] !h-[40px] !min-w-[40px] !capitalize !text-gray-700 !bg-primary !rounded-full" onClick={openFilters}>
                    <MdOutlineFilterAlt size={18} className='text-white' />
                </Button>
            }

            {/* Search functionality is now handled in Header component */}

            {/* Brands Navigation */}
            <NavLink to="/brands" className={({ isActive }) => isActive ? "isActive" : ""}>
                <Button className="flex-col !w-[40px] !min-w-[40px] !capitalize !text-gray-700">
                    {renderIcon("/brands", brandFilled, brandNotFilled, 20)}
                    <span className='text-[11px] font-medium'>Brands</span>
                </Button>
            </NavLink>

            {/* Wishlist Navigation */}
            <div 
                onClick={(e) => handleProtectedNavigation('/my-list', e)}
                className={isPathActive('/my-list') ? "isActive" : ""}
            >
                <Button className="flex-col !w-[40px] !min-w-[40px] !capitalize !text-gray-700">
                    {renderIcon("/my-list", heartFilled, heartNotFilled, 20)}
                    <span className='text-[11px] font-medium'>Wishlist</span>
                </Button>
            </div>

            {/* Cart Navigation */}
            <Button 
                className="flex-col !w-[40px] !min-w-[40px] !capitalize !text-gray-700"
                onClick={() => context.setOpenCartPanel(true)}
            >
                <div className="relative">
                    {renderIcon("/cart", cartFilled, cartNotFilled, 20)}
                    {context?.cartData?.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                            {context?.cartData?.length}
                        </span>
                    )}
                </div>
                <span className='text-[11px] font-medium'>Cart</span>
            </Button>

            {/* Account Navigation */}
            <div 
                onClick={(e) => handleProtectedNavigation('/my-account', e)}
                className={isPathActive('/my-account') ? "isActive" : ""}
            >
                <Button className="flex-col !w-[40px] !min-w-[40px] !capitalize !text-gray-700">
                    {renderIcon("/my-account", profileFilled, profileNotFilled, 20)}
                    <span className='text-[11px] font-medium'>Account</span>
                </Button>
            </div>
        </div>
    )
}

export default MobileNav