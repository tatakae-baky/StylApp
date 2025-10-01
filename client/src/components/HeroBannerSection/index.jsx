import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { MyContext } from "../../App";
import SubCategorySection from "../SubCategorySection";

/**
 * Hero Banner Section Component
 * Displays hero banners in 70-30 layout with carousel support for multiple banners
 * @param {Object} props - Component props
 * @param {Array} props.banners - Array of hero banner data
 */
const HeroBannerSection = ({ banners }) => {
    const context = useContext(MyContext);
    
    // Separate main and side banners based on position
    const mainBanners = banners?.filter(banner => banner.position === 'main') || [];
    const sideBanners = banners?.filter(banner => banner.position === 'side') || [];
    
    /**
     * Generate navigation URL based on category hierarchy
     * @param {Object} banner - Banner object with category IDs
     * @returns {string} - Navigation URL
     */
    const getNavigationUrl = (banner) => {
        if (banner.thirdsubCatId) {
            return `/products?thirdsubCatId=${banner.thirdsubCatId}`;
        }
        if (banner.subCatId) {
            return `/products?subCatId=${banner.subCatId}`;
        }
        if (banner.catId) {
            return `/products?catId=${banner.catId}`;
        }
        return '/products';
    };

    /**
     * Render individual banner
     * @param {Object} banner - Banner object
     * @param {boolean} isMain - Whether this is a main banner (affects title size)
     * @returns {JSX.Element} - Banner component
     */
    const renderBanner = (banner, isMain = true) => (
        <Link 
            to={getNavigationUrl(banner)} 
            className="block group"
            key={banner._id}
        >
            <div className="relative overflow-hidden">
                <img 
                    src={banner.image} 
                    alt={banner.title || "Hero Banner"}
                    className={`w-full object-cover ${
                        isMain 
                            ? "h-[180px] lg:h-[450px]" 
                            : "h-[400px] lg:h-[450px]"
                    }`}
                />
                {/* Optional title overlay */}
                {banner.title && (
                    <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-4 py-2 rounded-md">
                        <span className={`${isMain ? 'text-lg' : 'text-sm'} font-bold`}>
                            {banner.title}
                        </span>
                    </div>
                )}
            </div>
        </Link>
    );

    return (
        <div className="homeSlider pb-3 lg:pb-5 relative z-[99]">
            <div className="container">
                {/* Desktop Layout */}
                <div className="hidden lg:flex lg:flex-row gap-4">
                    {/* Main Hero Banner - 70% width */}
                    <div className="w-full lg:w-[70%]">
                        {mainBanners?.length > 1 ? (
                            // Multiple main banners - show as carousel
                            <Swiper
                                loop={true}
                                slidesPerView={1}
                                spaceBetween={0}
                                navigation={context?.windowWidth >= 992}
                                pagination={{ clickable: true }}
                                autoplay={{ delay: 4000, disableOnInteraction: false }}
                                modules={[Navigation, Pagination, Autoplay]}
                                className="mainHeroSlider"
                            >
                                {mainBanners.map((banner) => (
                                    <SwiperSlide key={banner._id}>
                                        {renderBanner(banner, true)}
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        ) : mainBanners?.[0] ? (
                            // Single main banner - show directly
                            renderBanner(mainBanners[0], true)
                        ) : (
                            // No main banners - show placeholder or nothing
                            <div className="w-full h-[250px] lg:h-[350px] bg-gray-100 rounded-[10px] flex items-center justify-center">
                                <span className="text-gray-500">No main hero banner available</span>
                            </div>
                        )}
                    </div>
                    
                    {/* Side Hero Banner - 30% width */}
                    <div className="w-full lg:w-[30%]">
                        {sideBanners?.length > 1 ? (
                            // Multiple side banners - show as carousel
                            <Swiper
                                loop={true}
                                slidesPerView={1}
                                spaceBetween={0}
                                // navigation={context?.windowWidth >= 992}
                                pagination={{ clickable: true }}
                                autoplay={{ delay: 4000, disableOnInteraction: false }}
                                modules={[Navigation, Pagination, Autoplay]}
                                className="sideHeroSlider"
                            >
                                {sideBanners.map((banner) => (
                                    <SwiperSlide key={banner._id}>
                                        {renderBanner(banner, false)}
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        ) : sideBanners?.[0] ? (
                            // Single side banner - show directly
                            renderBanner(sideBanners[0], false)
                        ) : (
                            // No side banners - show placeholder or nothing
                            <div className="w-full h-[250px] lg:h-[350px] bg-gray-100 rounded-[10px] flex items-center justify-center">
                                <span className="text-gray-500">No side hero banner available</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Layout */}
                <div className="block lg:hidden">
                    {/* Main Hero Banner - Full width on mobile */}
                    <div className="w-full mb-4">
                        {mainBanners?.length > 1 ? (
                            // Multiple main banners - show as carousel
                            <Swiper
                                loop={true}
                                slidesPerView={1}
                                spaceBetween={0}
                                navigation={false}
                                pagination={{ clickable: true }}
                                autoplay={{ delay: 4000, disableOnInteraction: false }}
                                modules={[Navigation, Pagination, Autoplay]}
                                className="mainHeroSlider"
                            >
                                {mainBanners.map((banner) => (
                                    <SwiperSlide key={banner._id}>
                                        {renderBanner(banner, true)}
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        ) : mainBanners?.[0] ? (
                            // Single main banner - show directly
                            renderBanner(mainBanners[0], true)
                        ) : (
                            // No main banners - show placeholder or nothing
                            <div className="w-full h-[150px] bg-gray-100 rounded-[10px] flex items-center justify-center">
                                <span className="text-gray-500">No main hero banner available</span>
                            </div>
                        )}
                    </div>

                    {/* SubCategory Section - Mobile only */}
                    <div className="mb-4">
                        <SubCategorySection />
                    </div>

                    {/* Side Hero Banner - Full width on mobile, increased height */}
                    <div className="w-full">
                        {sideBanners?.length > 1 ? (
                            // Multiple side banners - show as carousel
                            <Swiper
                                loop={true}
                                slidesPerView={1}
                                spaceBetween={0}
                                navigation={false}
                                pagination={{ clickable: true }}
                                autoplay={{ delay: 4000, disableOnInteraction: false }}
                                modules={[Navigation, Pagination, Autoplay]}
                                className="sideHeroSlider"
                            >
                                {sideBanners.map((banner) => (
                                    <SwiperSlide key={banner._id}>
                                        {renderBanner(banner, false)}
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        ) : sideBanners?.[0] ? (
                            // Single side banner - show directly
                            renderBanner(sideBanners[0], false)
                        ) : (
                            // No side banners - show placeholder or nothing
                            <div className="w-full h-[200px] bg-gray-100 rounded-[10px] flex items-center justify-center">
                                <span className="text-gray-500">No side hero banner available</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroBannerSection;