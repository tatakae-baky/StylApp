import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Rating from "@mui/material/Rating";
import { MdOutlineShoppingCart } from "react-icons/md";
import { FaRegHeart } from "react-icons/fa";
import { MyContext } from "../../App";
import CircularProgress from '@mui/material/CircularProgress';
import { postData, fetchDataFromApi } from "../../utils/api";
import { FaCheckDouble } from "react-icons/fa";
import { IoMdHeart } from "react-icons/io";
import { formatCurrencyBD } from "../../utils/currency";
import { Chip } from "@mui/material";

export const ProductDetailsNew = (props) => {
  const [productActionIndex, setProductActionIndex] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedTabName, setSelectedTabName] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tabError, setTabError] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isAddedInMyList, setIsAddedInMyList] = useState(false);
  const [sizeStockData, setSizeStockData] = useState([]);
  const [isStockDataLoaded, setIsStockDataLoaded] = useState(false);

  const context = useContext(MyContext);

  const handleSelecteQty = (qty) => {
    setQuantity(qty);
  };

  // Fetch size stock availability
  const fetchSizeStockAvailability = async () => {
    if (props?.item?._id) {
      try {
        setIsStockDataLoaded(false);
        const response = await fetchDataFromApi(`/api/product/size-stock/availability/${props.item._id}`);
        if (response?.success) {
          setSizeStockData(response.data);
        }
        setIsStockDataLoaded(true);
      } catch (error) {
        console.error('Error fetching size stock data:', error);
        setIsStockDataLoaded(true);
      }
    } else {
      setIsStockDataLoaded(true);
    }
  };

  // Get stock info for a specific size
  const getSizeStockInfo = (size) => {
    // Don't return stock info until data is loaded
    if (!isStockDataLoaded) {
      return { available: 0, total: 0, isOutOfStock: false };
    }
    
    const sizeStock = sizeStockData.find(s => s.size === size);
    if (sizeStock) {
      return {
        available: sizeStock.available,
        total: sizeStock.stock,
        isOutOfStock: sizeStock.available === 0
      };
    }
    return { available: 0, total: 0, isOutOfStock: true };
  };

  // Get stock status color
  const getStockStatusColor = (available, total) => {
    if (available === 0) return 'error';
    if (available <= (total * 0.2)) return 'warning';
    return 'success';
  };

  const handleClickActiveTab = (index, name) => {
    setProductActionIndex(index);
    setSelectedTabName(name);
  };

  useEffect(() => {
    const item = context?.cartData?.filter((cartItem) =>
      cartItem.productId.includes(props?.item?._id)
    );

    if (item?.length !== 0) {
      setIsAdded(true);
    } else {
      setIsAdded(false);
    }
  }, [isAdded]);

  useEffect(() => {
    // Reset loading state when product changes
    setIsStockDataLoaded(false);
    setSizeStockData([]);
    fetchSizeStockAvailability();
  }, [props?.item?._id]);

  useEffect(() => {
    const myListItem = context?.myListData?.filter((item) =>
      item.productId.includes(props?.item?._id)
    );

    if (myListItem?.length !== 0) {
      setIsAddedInMyList(true);
    } else {
      setIsAddedInMyList(false);
    }
  }, [context?.myListData]);

  const addToCart = (product, userId, quantity) => {
    if (userId === undefined) {
      context?.alertBox("error", "You are not logged in. Please log in first.");
      return false;
    }

    const productItem = {
      _id: product?._id,
      productTitle: product?.name,
      image: product?.images[0],
      rating: product?.rating,
      price: product?.price,
      oldPrice: product?.oldPrice,
      discount: product?.discount,
      quantity: quantity,
      subTotal: parseInt(product?.price * quantity),
      productId: product?._id,
      countInStock: product?.countInStock,
      brand: typeof product?.brand === 'object' ? product?.brand?.name : product?.brand,
      size: props?.item?.size?.length !== 0 ? selectedTabName : '',
      weight: '',
      ram: ''
    };

    if (props?.item?.size?.length !== 0) {
      if (selectedTabName !== null) {
        setIsLoading(true);

        postData("/api/cart/add", productItem).then((res) => {
          if (res?.error === false) {
            context?.alertBox("success", res?.message);
            context?.getCartItems();
            setTimeout(() => {
              setIsLoading(false);
              setIsAdded(true);
            }, 500);
          } else {
            context?.alertBox("error", res?.message);
            setTimeout(() => {
              setIsLoading(false);
            }, 500);
          }
        });
      } else {
        setTabError(true);
      }
    } else {
      setIsLoading(true);
      postData("/api/cart/add", productItem).then((res) => {
        if (res?.error === false) {
          context?.alertBox("success", res?.message);
          context?.getCartItems();
          setTimeout(() => {
            setIsLoading(false);
            setIsAdded(true);
          }, 500);
        } else {
          context?.alertBox("error", res?.message);
          setTimeout(() => {
            setIsLoading(false);
          }, 500);
        }
      });
    }
  };

  const handleAddToMyList = (item) => {
    if (context?.userData === null) {
      context?.alertBox("error", "You are not logged in. Please log in first.");
      return false;
    } else {
      const obj = {
        productId: item?._id,
        userId: context?.userData?._id,
        productTitle: item?.name,
        image: item?.images[0],
        rating: item?.rating,
        price: item?.price,
        oldPrice: item?.oldPrice,
        brand: typeof item?.brand === 'object' ? item?.brand?.name : item?.brand,
        discount: item?.discount
      };

      postData("/api/myList/add", obj).then((res) => {
        if (res?.error === false) {
          context?.alertBox("success", res?.message);
          setIsAddedInMyList(true);
          context?.getMyListData();
        } else {
          context?.alertBox("error", res?.message);
        }
      });
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Brand Name - Large and Bold (Selfridges style) with Link */}
      <div className="mb-1">
        {(typeof props?.item?.brand === 'object' && props?.item?.brand?.slug) ? (
          <Link to={`/brand/${props?.item?.brand?.slug}`}>
            <h2 className="text-[22px] min-[380px]:text-[24px] md:text-[28px] font-bold text-black uppercase tracking-wide hover:text-gray-700 transition-colors cursor-pointer">
              {props?.item?.brand?.name}
            </h2>
          </Link>
        ) : (
          <h2 className="text-[18px] min-[380px]:text-[24px] md:text-[28px] font-bold text-black uppercase tracking-wide">
            {typeof props?.item?.brand === 'object' ? props?.item?.brand?.name : props?.item?.brand}
          </h2>
        )}
      </div>

      {/* Product Name - Medium */}
      <h1 className="text-[14px] min-[380px]:text-[18px] md:text-[16px] font-[400] mb-2 text-gray-900 leading-tight">
        {props?.item?.name}
      </h1>

      {/* Price Section - Current price with discount percentage next to it */}
      <div className="mb-1">
        <div className="flex items-center gap-3">
          <span className="text-[20px] min-[380px]:text-[22px] md:text-[26px] font-[600] text-black">
            {formatCurrencyBD(props?.item?.price)}
          </span>
          {props?.item?.discount > 0 && (
            <span className="text-[14px] min-[380px]:text-[18px] font-[600] text-red-600  px-2 py-1 rounded">
              ({props?.item?.discount}% OFF)
            </span>
          )}
        </div>
      </div>

      {/* Previous Price - Below current price (Selfridges style) */}
      {props?.item?.oldPrice && props?.item?.oldPrice > props?.item?.price && (
        <div className="mb-4">
          <span className="text-[14px] min-[380px]:text-[16px] text-gray-500 line-through">
            {formatCurrencyBD(props?.item?.oldPrice)}
          </span>
        </div>
      )}

      {/* Rating */}
      <div className="flex items-center gap-3 mb-6">
        <Rating name="size-small" value={props?.item?.rating} size="small" readOnly />
        <span className="text-[12px] min-[380px]:text-[14px] text-gray-600 cursor-pointer hover:underline" onClick={props.gotoReviews}>
          ({props.reviewsCount} Reviews)
        </span>
      </div>



      {/* Size Selection */}
      {props?.item?.size?.length !== 0 && (
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-[14px] min-[380px]:text-[16px] font-[600] text-black">Size: {selectedTabName || ''}</span>
            {/* Show stock indicator for selected size */}
            {selectedTabName && (() => {
              const stockInfo = getSizeStockInfo(selectedTabName);
              if (stockInfo.available <= 5 && stockInfo.available > 0) {
                return <span className="text-[16px] text-red-600 font-[600]">Only {stockInfo.available} left</span>;
              } else if (stockInfo.available <= 15 && stockInfo.available > 5) {
                return <span className="text-[16px] text-red-600 font-[600]">Low in stock</span>;
              }
              return null;
            })()}
          </div>
          <div className="flex gap-2">
            {/* Show size stock availability */}
            {props?.item?.size?.map((item, index) => {
              const stockInfo = getSizeStockInfo(item);
              const isSelected = productActionIndex === index;
              const isOutOfStock = stockInfo.isOutOfStock;
              
              return (
                <button
                  key={index}
                  className={`w-[50px] h-[50px] border border-gray-400 text-[18px] font-[600] transition-all text-center flex items-center justify-center ${
                    isSelected
                      ? "bg-black text-white border-black"
                      : "bg-white text-black border-black hover:bg-black hover:text-white"
                  } ${tabError === true && 'border-red-500'} ${
                    isOutOfStock ? 'opacity-50 cursor-not-allowed border-gray-200 text-gray-400' : ''
                  }`}
                  onClick={() => !isOutOfStock && handleClickActiveTab(index, item)}
                  disabled={isOutOfStock}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity Selection */}
      <div className="mb-6">
        <div className="mb-2">
          <span className="text-[14px] min-[380px]:text-[16px] font-[600] text-black">Quantity</span>
        </div>
        <div className="flex items-center border border-gray-300 w-fit">
          <button 
            className="w-12 h-10 flex items-center justify-center text-[20px] font-[600] text-gray-700 bg-gray-50 transition-all duration-200 border-r border-gray-300"
            onClick={() => {
              if (quantity > 1) {
                setQuantity(quantity - 1);
                handleSelecteQty(quantity - 1);
              }
            }}
          >
            −
          </button>
          <div className="w-16 h-10 flex items-center justify-center text-[16px] font-[500] text-black bg-white">
            {quantity}
          </div>
          <button 
            className="w-12 h-10 flex items-center justify-center text-[20px] font-[600] bg-black text-white transition-all duration-200 border-l border-gray-300"
            onClick={() => {
              setQuantity(quantity + 1);
              handleSelecteQty(quantity + 1);
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* Action Buttons  */}
      <div className="space-y-2 mt-auto">
        <button 
          className="w-full bg-black text-white py-2 min-[380px]:py-3 text-[14px] min-[380px]:text-[16px] font-[600] hover:bg-gray-800 transition-all duration-200 flex items-center justify-center gap-2"
          onClick={() => addToCart(props?.item, context?.userData?._id, quantity)}
        >
          {isLoading === true ? (
            <CircularProgress size={20} sx={{ color: 'white' }} />
          ) : (
            <>
              {isAdded === true ? (
                <>
                  <FaCheckDouble /> Added to Bag
                </>
              ) : (
                <>
                Add to Bag
                </>
              )}
            </>
          )}
        </button>

        <button 
          className="w-full bg-[#FF2E4D] border border-gray-300 text-white py-2 min-[380px]:py-3 text-[14px] min-[380px]:text-[16px] font-[600] hover:bg-[#e63852] transition-all duration-200 flex items-center justify-center gap-2"
          onClick={() => handleAddToMyList(props?.item)}
        >
          {isAddedInMyList === true ? (
            <>
            Added to Wishlist
            </>
          ) : (
            <>
            Add to Wishlist
            </>
          )}
          
        </button>
      </div>
    </div>
  );
};
