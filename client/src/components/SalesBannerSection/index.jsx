import React, { useContext } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";
import { Navigation, FreeMode } from "swiper/modules";
import { Link } from "react-router-dom";
import { MyContext } from "../../App";

/**
 * Sales Banner Section Component
 * Displays "Sales You Can't Miss" banners in a carousel
 * Replaces AdsBannerSlider, AdsBannerSliderV2, BannerBoxV2, and HomeSliderV2 components
 * @param {Object} props - Component props
 * @param {Array} props.banners - Array of sales banner data
 */
const SalesBannerSection = ({ banners }) => {
  const context = useContext(MyContext);

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
    return "/products";
  };

  // Don't render if no banners
  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-3 pt-2 lg:py-8 lg:pt-2 ">
      <div className="container">
        {/* Section Header */}
        <h2 className="text-[20px] lg:text-[24px] font-bold text-gray-900 uppercase mb-3"> <span className="bg-red-500 text-white px-3 py-1 mr-3">SALES</span>YOU CANT MISS</h2>
        <p className="text-[12px] lg:text-[14px] text-gray-600 font-[400] uppercase tracking-wider mt-0.5">Shop the best deals on the platform</p>

        {/* Mobile: Grid layout with 5 cards per row and horizontal scrolling (similar to HottestBrandsSection) */}
        <div className="md:hidden">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="grid grid-cols-5 gap-4 w-max min-w-full">
              {banners.map((banner, index) => (
                <Link key={banner._id || index} to={getNavigationUrl(banner)} className="group block bg-white overflow-hidden w-36">
                  {/* Image container with aspect square */}
                  <div className="relative overflow-hidden mb-1 aspect-[3/4]">
                    <img
                      src={banner.image}
                      alt={banner.title}
                      className="w-full h-full object-cover transition-all group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  
                  {/* Text content below image */}
                  <div className="px-1">
                    <h3 className="text-[14px] font-[600] text-black leading-tight">
                      {banner.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop: Banner Carousel (original design) */}
        <div className="hidden md:block">
          <Swiper
            slidesPerView={5}
            spaceBetween={20}
            navigation={context?.windowWidth < 992 ? false : true}
            modules={[Navigation, FreeMode]}
            freeMode={true}
            breakpoints={{
              750: {
                slidesPerView: 3,
                spaceBetween: 20,
              },
              1100: {
                slidesPerView: 5,
                spaceBetween: 20,
              },
            }}
            className="salesBannerSlider"
          >
            {banners.map((banner, index) => (
              <SwiperSlide key={banner._id || index}>
                <Link to={getNavigationUrl(banner)} className="block group">
                  <div className="relative overflow-hidden bg-white">
                    {/* Banner Image */}
                    <img
                      src={banner.image}
                      alt={banner.title}
                      className="w-full h-[350px] object-cover transition-all group-hover:scale-105"
                    />
                    {/* Banner Title Overlay */}
                    <p className="text-center text-[18px] font-[600] text-black mt-3">
                      {banner.title}
                    </p>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default SalesBannerSection;
