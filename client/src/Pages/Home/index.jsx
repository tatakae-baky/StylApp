import React, { useContext, useEffect, useState } from "react";
import { LiaShippingFastSolid } from "react-icons/lia";
// Import redesigned banner components
import HeroBannerSection from "../../components/HeroBannerSection";
import SalesBannerSection from "../../components/SalesBannerSection";
// Import new sections
import HottestBrandsSection from "../../components/HottestBrandsSection";
import HiddenGemBrandsSection from "../../components/HiddenGemBrandsSection";
import SubCategorySection from "../../components/SubCategorySection";

import ProductsSlider from "../../components/ProductsSlider";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";

import { Navigation, FreeMode } from "swiper/modules";
import BlogItem from "../../components/BlogItem";
import { fetchDataFromApi } from "../../utils/api";
import { MyContext } from "../../App";
import ProductLoading from "../../components/ProductLoading";
import BannerLoading from "../../components/LoadingSkeleton/bannerLoading";
import { Button } from "@mui/material";
import { Link } from "react-router-dom";

const Home = () => {
  const [popularProductsData, setPopularProductsData] = useState([]);
  const [productsData, setAllProductsData] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [blogData, setBlogData] = useState([]);
  const [randomCatProducts, setRandomCatProducts] = useState([]);

  // Banner state variables for redesigned system
  const [heroBannersData, setHeroBannersData] = useState([]);
  const [salesBannersData, setSalesBannersData] = useState([]);

  const context = useContext(MyContext);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Fetch hero banners for 70-30 layout
    fetchDataFromApi("/api/heroBanners/active").then((res) => {
      setHeroBannersData(res?.data || []);
    });

    // Fetch sales banners for "Sales You Can't Miss" section
    fetchDataFromApi("/api/salesBanners/active").then((res) => {
      setSalesBannersData(res?.data || []);
    });

    // Fetch popular products
    fetchDataFromApi("/api/product/getAllPopularProducts").then((res) => {
      setPopularProductsData(res?.products || []);
    });

    // Keep existing product API calls
    fetchDataFromApi("/api/product/getAllProducts?page=1&limit=12").then(
      (res) => {
        setAllProductsData(res?.products);
      }
    );

    fetchDataFromApi("/api/product/getAllFeaturedProducts").then((res) => {
      setFeaturedProducts(res?.products);
    });

    fetchDataFromApi("/api/blog").then((res) => {
      setBlogData(res?.blogs);
    });
  }, []);

  useEffect(() => {
    if (context?.catData?.length !== 0) {
      // Configuration: Choose which categories to display on homepage
      const featuredCategoryNames = [
        "Men",
        "Women",
        "Bags",
        "Shoes",
        "Beauty",
        "Jewelry",
      ];

      // Find indices of featured categories
      const categoryIndices = context?.catData
        ?.map((cat, index) =>
          featuredCategoryNames.includes(cat.name) ? index : -1
        )
        ?.filter((index) => index !== -1);

      // Fallback: if no featured categories found, show all
      const indicesToUse =
        categoryIndices.length > 0
          ? categoryIndices
          : context?.catData?.map((_, index) => index);

      getCategoryProducts(indicesToUse, context?.catData);
    }
  }, [context?.catData]);

  const getCategoryProducts = async (arr, catArr) => {
    try {
      // Use Promise.all to handle all API calls properly
      const promises = arr.map(async (index) => {
        let catId = catArr[index]?._id;
        let catName = catArr[index]?.name;
        if (!catId) return null;

        try {
          const res = await fetchDataFromApi(
            `/api/product/getAllProductsByCatId/${catId}`
          );
          // Only return categories that have products
          if (res?.products && res.products.length > 0) {
            return {
              catName: catName,
              data: res?.products,
              sortOrder: getSortOrder(catName), // Add custom sorting
            };
          }
        } catch (error) {
          console.error(
            `Error fetching products for category ${catName}:`,
            error
          );
        }
        return null;
      });

      const results = await Promise.all(promises);
      const validResults = results
        .filter((result) => result !== null)
        .sort((a, b) => a.sortOrder - b.sortOrder); // Sort by custom order

      setRandomCatProducts(validResults);
    } catch (error) {
      console.error("Error fetching category products:", error);
    }
  };

  // Helper function to define category display order
  const getSortOrder = (categoryName) => {
    const order = {
      Men: 1,
      Women: 2,
      Kids: 3,
      Bags: 4,
      Shoes: 5,
      Beauty: 6,
      Jewelry: 7,
      Watches: 8,
      Gifts: 9,
    };
    return order[categoryName] || 99;
  };

  return (
    <>
      {/* Hero Banner Section */}
      {heroBannersData?.length === 0 && <BannerLoading />}

      {heroBannersData?.length > 0 && (
        <HeroBannerSection banners={heroBannersData} />
      )}

      {/* Subcategory Section - Desktop only (mobile version is inside HeroBannerSection) */}
      <div className="hidden lg:block">
        <SubCategorySection />
      </div>

      {/* Hottest Brands Section */}
      <HottestBrandsSection />

      {/* Popular Products Section */}
      <section className="bg-white py-3 pt-2 lg:py-8 lg:pt-2 ">
        <div className="container">
          <h2 className="text-[20px] lg:text-[24px] font-bold text-gray-900 uppercase">
            Popular Products
          </h2>
          <p className="text-[12px] lg:text-[14px] text-gray-600 font-[400] uppercase tracking-wider mt-0.5 mb-0">
            Shop the most popular products on the platform
          </p>

          <div className="min-h-max lg:min-h-[60vh]">
            {popularProductsData?.length === 0 && <ProductLoading />}
            {popularProductsData?.length !== 0 && (
              <ProductsSlider items={6} data={popularProductsData} />
            )}
          </div>
        </div>
      </section>

      {/* Sales Banner Section */}
      {salesBannersData?.length > 0 && (
        <SalesBannerSection banners={salesBannersData} />
      )}

      {/* Hidden Gem Brands Section */}
      <HiddenGemBrandsSection />

      {/* Featured Products Section */}
      <section className="py-2 lg:py-0 pt-0 bg-white">
        <div className="container">
          <h2 className="text-[20px] lg:text-[24px] font-[600]">Featured Products</h2>
          {featuredProducts?.length === 0 && <ProductLoading />}
          {featuredProducts?.length !== 0 && (
            <ProductsSlider items={6} data={featuredProducts} />
          )}
        </div>
      </section>

      {/*  Latest Products Section */}
      <section className="py-3 lg:py-2 pt-0 bg-white">
        <div className="container">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] lg:text-[24px] font-[600]">Latest Products</h2>
            <Link to="/products">
              <Button
                className="!bg-gray-100 hover:!bg-gray-200 !text-gray-800 !rounded-none !capitalize !px-3 !border !border-[rgba(0,0,0,0.4)]"
                size="small"
              >
                View All
              </Button>
            </Link>
          </div>

          {productsData?.length === 0 && <ProductLoading />}

          {productsData?.length !== 0 && (
            <ProductsSlider items={6} data={productsData} />
          )}
        </div>
      </section>

      {/* Category Products Section */}
      {randomCatProducts?.length !== 0 &&
        randomCatProducts?.map((productRow, index) => {
          if (
            productRow?.catName !== undefined &&
            productRow?.data?.length !== 0
          )
            return (
              <section className="py-5 pt-0 bg-white" key={index}>
                <div className="container">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[20px] lg:text-[24px] font-[600]">
                      {productRow?.catName}
                    </h2>
                    {productRow?.data?.length > 6 && (
                      <Link to={`products?catId=${productRow?.data[0]?.catId}`}>
                        <Button
                          className="!bg-gray-100 hover:!bg-gray-200 !text-gray-800 !capitalize !rounded-none !px-3 !border !border-[rgba(0,0,0,0.4)]"
                          size="small"
                        >
                          View All
                        </Button>
                      </Link>
                    )}
                  </div>

                  {productRow?.data?.length === 0 && <ProductLoading />}

                  {productRow?.data?.length !== 0 && (
                    <ProductsSlider items={6} data={productRow?.data} />
                  )}
                </div>
              </section>
            );
        })}

      {/* Blog Section */}
      {blogData?.length !== 0 && (
        <section className="py-5 pb-8 pt-0 bg-white blogSection">
          <div className="container">
            <h2 className="text-[20px] lg:text-[24px] font-[600] mb-4">From The Blog</h2>
            <Swiper
              slidesPerView={4}
              spaceBetween={30}
              navigation={context?.windowWidth < 992 ? false : true}
              modules={[Navigation, FreeMode]}
              freeMode={true}
              breakpoints={{
                250: {
                  slidesPerView: 1,
                  spaceBetween: 10,
                },
                330: {
                  slidesPerView: 1,
                  spaceBetween: 10,
                },
                500: {
                  slidesPerView: 2,
                  spaceBetween: 20,
                },
                700: {
                  slidesPerView: 3,
                  spaceBetween: 20,
                },
                1100: {
                  slidesPerView: 4,
                  spaceBetween: 30,
                },
              }}
              className="blogSlider"
            >
              {blogData
                ?.slice()
                ?.reverse()
                ?.map((item, index) => {
                  return (
                    <SwiperSlide key={index}>
                      <BlogItem item={item} />
                    </SwiperSlide>
                  );
                })}
            </Swiper>
          </div>
        </section>
      )}
    </>
  );
};

export default Home;
