import React, { useEffect, useRef, useState } from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import { Link, useParams } from "react-router-dom";
import { ProductImageGrid } from "../../components/ProductImageGrid";
import ProductsSlider from "../../components/ProductsSlider";
import { ProductDetailsNew } from "../../components/ProductDetailsNew";

import { fetchDataFromApi } from "../../utils/api";
import CircularProgress from "@mui/material/CircularProgress";
import { Reviews } from "./reviews";

export const ProductDetails = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [productData, setProductData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [relatedProductData, setRelatedProductData] = useState([]);

  const { id } = useParams();

  const reviewSec = useRef();

  useEffect(() => {
    fetchDataFromApi(`/api/user/getReviews?productId=${id}`).then((res) => {
      if (res?.error === false) {
        setReviewsCount(res.reviews.length);
      }
    });
  }, [reviewsCount]);

  useEffect(() => {
    setIsLoading(true);
    fetchDataFromApi(`/api/product/${id}`).then((res) => {
      if (res?.error === false) {
        setProductData(res?.product);

        fetchDataFromApi(
          `/api/product/getAllProductsBySubCatId/${res?.product?.subCatId}`
        ).then((res) => {
          if (res?.error === false) {
            const filteredData = res?.products?.filter(
              (item) => item._id !== id
            );
            setRelatedProductData(filteredData);
          }
        });

        setTimeout(() => {
          setIsLoading(false);
        }, 700);
      }
    });

    window.scrollTo(0, 0);
  }, [id]);

  const gotoReviews = () => {
    window.scrollTo({
      top: reviewSec?.current.offsetTop - 170,
      behavior: "smooth",
    });

    setActiveTab(1);
  };

  return (
    <>
      <div className="py-5 hidden">
        <div className="container">
          <Breadcrumbs aria-label="breadcrumb">
            <Link
              underline="hover"
              color="inherit"
              to="/"
              className="link transition !text-[14px]"
            >
              Home
            </Link>
            <Link
              underline="hover"
              color="inherit"
              to="/"
              className="link transition !text-[14px]"
            >
              Fashion
            </Link>

            <Link
              underline="hover"
              color="inherit"
              className="link transition !text-[14px]"
            >
              Cropped Satin Bomber Jacket
            </Link>
          </Breadcrumbs>
        </div>
      </div>

      <section className="bg-white py-1 min-[380px]:py-5">
        {isLoading === true ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <CircularProgress />
          </div>
        ) : (
          <>
            <div className="container flex lg:gap-8 flex-col lg:flex-row items-start product-details-container gap-2 min-[380px]:gap-4">
              {/* Left side - Image Grid (70% width) */}
              <div className="w-full lg:w-[70%]">
                <ProductImageGrid images={productData?.images} />
              </div>

              {/* Right side - Product Details (30% width) */}
              <div className="w-full lg:w-[30%] lg:sticky lg:top-32 lg:self-start">
                <ProductDetailsNew
                  item={productData}
                  reviewsCount={reviewsCount}
                  gotoReviews={gotoReviews}
                />
              </div>
            </div>

            <div className="container pt-4 min-[380px]:pt-10">
              <div className="flex items-center gap-4 min-[380px]:gap-8 mb-5">
                <span
                  className={`link text-[16px] min-[380px]:text-[20px] cursor-pointer font-[600] ${
                    activeTab === 0 && "text-[#FF2E4D]"
                  }`}
                  onClick={() => setActiveTab(0)}
                >
                  Description
                </span>

                <span
                  className={`link text-[16px] min-[380px]:text-[20px] cursor-pointer font-[600] ${
                    activeTab === 1 && "text-[#FF2E4D]"
                  }`}
                  onClick={() => setActiveTab(1)}
                  ref={reviewSec}
                >
                  Reviews ({reviewsCount})
                </span>
              </div>

              {activeTab === 0 && (
                <div className="w-full py-2 text-[14px] min-[380px]:text-[16px] font-[400]">
                  {productData?.description}
                </div>
              )}

              {activeTab === 1 && (
                <div className="shadow-none w-full sm:w-[80%] py-0  lg:py-5 px-0 lg:px-8">
                  {productData?.length !== 0 && (
                    <Reviews
                      productId={productData?._id}
                      setReviewsCount={setReviewsCount}
                    />
                  )}
                </div>
              )}
            </div>
            {relatedProductData?.length !== 0 && (
              <div className="container pt-4 min-[380px]:pt-8">
                <h2 className="text-[18px] min-[380px]:text-[24px] font-bold text-gray-900 uppercase">
                  Related Products
                </h2>
                <ProductsSlider items={6} data={relatedProductData} />
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
};
