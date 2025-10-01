import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";
import { Navigation, FreeMode } from "swiper/modules";
import { MyContext } from "../../App";
import { fetchDataFromApi } from "../../utils/api";

/**
 * SubCategory Section Component
 * Displays subcategories in a horizontal scrollable layout using SwiperJS
 * Now dynamic - fetches data from backend API
 */
const SubCategorySection = () => {
    const context = useContext(MyContext);
    const [subCategories, setSubCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Fetch active subcategory sections from backend
        fetchDataFromApi("/api/subCategorySections/active")
            .then((res) => {
                if (res.success && res.subCategorySections) {
                    // Transform backend data to match the component's expected format
                    const transformedData = res.subCategorySections.map(item => ({
                        id: item._id,
                        name: item.title,
                        imageUrl: item.image,
                        link: generateCategoryLink(item),
                        sortOrder: item.sortOrder
                    }));
                    
                    // Sort by sortOrder
                    transformedData.sort((a, b) => a.sortOrder - b.sortOrder);
                    setSubCategories(transformedData);
                }
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching subcategory sections:", error);
                setIsLoading(false);
            });
    }, []);

    /**
     * Generate the appropriate link based on selected categories
     */
    const generateCategoryLink = (item) => {
        let link = "/products";
        const params = new URLSearchParams();

        if (item.thirdsubCatId) {
            params.append("subSubCatId", item.thirdsubCatId);
        } else if (item.subCatId) {
            params.append("subCatId", item.subCatId);
        } else if (item.catId) {
            params.append("catId", item.catId);
        }

        const queryString = params.toString();
        return queryString ? `${link}?${queryString}` : link;
    };

    // Show loading or empty state
    if (isLoading) {
        return (
            <section className="py-4 lg:py-2">
                <div className="container mx-auto">
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                    </div>
                </div>
            </section>
        );
    }

    // Don't render if no subcategories
    if (subCategories.length === 0) {
        return null;
    }

    return (
        <section className="lg:py-2">
            <div className="container mx-auto">
                <Swiper
                    slidesPerView={8}
                    spaceBetween={0}
                    navigation={context?.windowWidth < 992 ? false : true}
                    modules={[Navigation, FreeMode]}
                    freeMode={true}
                    breakpoints={{
                        250: {
                            slidesPerView: 3,
                            spaceBetween: 8,
                        },
                        330: {
                            slidesPerView: 4,
                            spaceBetween: 10,
                        },
                        360: {
                            slidesPerView: 4,
                            spaceBetween: 12,
                        },
                        400: {
                            slidesPerView: 4,
                            spaceBetween: 15,
                        },
                        500: {
                            slidesPerView: 5,
                            spaceBetween: 15,
                        },
                        700: {
                            slidesPerView: 6,
                            spaceBetween: 15,
                        },
                        900: {
                            slidesPerView: 7,
                            spaceBetween: 15,
                        },
                        1100: {
                            slidesPerView: 8,
                            spaceBetween: 0,
                        },
                    }}
                    className="categorySlider"
                >
                    {subCategories.map((category) => (
                        <SwiperSlide key={category.id}>
                            <Link
                                to={category.link}
                                className="block cursor-pointer group"
                            >
                                <div className="flex flex-col items-center text-center">
                                    {/* Category Image - Responsive scaling maintaining aspect ratio */}
                                    <div className="w-[70px] h-[85px] min-[400px]:w-[90px] min-[400px]:h-[100px] sm:w-[72px] sm:h-[84px] md:w-[84px] md:h-[98px] xl:w-[118px] xl:h-[132px] 2xl:w-[148px] 2xl:h-[156px] overflow-hidden">
                                        <img
                                            src={category.imageUrl}
                                            alt={category.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = "/homeBannerPlaceholder.jpg";
                                            }}
                                        />
                                    </div>
                                    
                                    {/* Category Name - Responsive text sizing */}
                                    <span className="text-[10px] sm:text-[11px] md:text-xs xl:text-[16px] font-semibold text-gray-700 leading-tight transition-colors duration-200 group-hover:text-gray-900 mt-1 sm:mt-1.5 md:mt-2">
                                        {category.name}
                                    </span>
                                </div>
                            </Link>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
};

export default SubCategorySection;
