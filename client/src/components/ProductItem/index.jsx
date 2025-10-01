import React, { useContext, useEffect, useState } from "react";
import "../ProductItem/style.css";
import { Link } from "react-router-dom";
import Rating from "@mui/material/Rating";
import Button from "@mui/material/Button";
import { FaRegHeart } from "react-icons/fa";
import { MyContext } from "../../App";
import { MdOutlineShoppingCart } from "react-icons/md";
import { FaMinus } from "react-icons/fa6";
import { FaPlus } from "react-icons/fa6";
import {
  deleteData,
  editData,
  postData,
  fetchDataFromApi,
} from "../../utils/api";
import CircularProgress from "@mui/material/CircularProgress";
import { MdClose } from "react-icons/md";
import { IoMdHeart } from "react-icons/io";
import { formatCurrencyBD } from "../../utils/currency";
import { Chip } from "@mui/material";

const ProductItem = (props) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isAddedInMyList, setIsAddedInMyList] = useState(false);
  const [cartItem, setCartItem] = useState([]);

  const [activeTab, setActiveTab] = useState(null);
  const [isShowTabs, setIsShowTabs] = useState(false);
  const [selectedTabName, setSelectedTabName] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sizeStockData, setSizeStockData] = useState([]);

  const context = useContext(MyContext);

  /**
   * Generate brand slug for navigation
   * @param {object|string} brand - Brand object with slug/name or brand string
   * @returns {string} - Brand slug for URL
   */
  const getBrandSlug = (brand) => {
    if (!brand) return "";

    // If brand is an object and has a slug, use it
    if (typeof brand === "object" && brand?.slug) {
      return brand.slug;
    }

    // If brand is an object with name, create slug from name
    if (typeof brand === "object" && brand?.name) {
      const generatedSlug = brand.name.toLowerCase().replace(/\s+/g, "-");
      return generatedSlug;
    }

    // If brand is a string, create slug from it
    if (typeof brand === "string") {
      const generatedSlug = brand.toLowerCase().replace(/\s+/g, "-");
      return generatedSlug;
    }
    return "";
  };

  /**
   * Get brand name for display
   * @param {object|string} brand - Brand object or string
   * @returns {string} - Brand name for display
   */
  const getBrandName = (brand) => {
    if (!brand) return "";

    if (typeof brand === "object" && brand?.name) {
      return brand.name;
    }

    if (typeof brand === "string") {
      return brand;
    }

    return "";
  };

  // Fetch size stock availability
  const fetchSizeStockAvailability = async () => {
    if (props?.item?._id) {
      try {
        const response = await fetchDataFromApi(
          `/api/product/size-stock/availability/${props.item._id}`
        );
        if (response?.success) {
          setSizeStockData(response.data);
        }
      } catch (error) {
        console.error("Error fetching size stock data:", error);
      }
    }
  };

  // Get stock info for a specific size
  const getSizeStockInfo = (size) => {
    const sizeStock = sizeStockData.find((s) => s.size === size);
    if (sizeStock) {
      return {
        available: sizeStock.available,
        total: sizeStock.stock,
        isOutOfStock: sizeStock.available === 0,
      };
    }
    return { available: 0, total: 0, isOutOfStock: true };
  };

  // Get stock status color
  const getStockStatusColor = (available, total) => {
    if (available === 0) return "error";
    if (available <= total * 0.2) return "warning";
    return "success";
  };

  // Check if product has multiple options (sizes, weights, or RAM)
  const hasMultipleOptions = () => {
    const sizeCount = props?.item?.size?.length || 0;
    const weightCount = props?.item?.productWeight?.length || 0;
    const ramCount = props?.item?.productRam?.length || 0;

    return (
      sizeCount > 1 ||
      weightCount > 1 ||
      ramCount > 1 ||
      (sizeCount >= 1 && weightCount >= 1) ||
      (sizeCount >= 1 && ramCount >= 1) ||
      (weightCount >= 1 && ramCount >= 1)
    );
  };

  // Check if product has any options at all
  const hasAnyOptions = () => {
    const sizeCount = props?.item?.size?.length || 0;
    const weightCount = props?.item?.productWeight?.length || 0;
    const ramCount = props?.item?.productRam?.length || 0;

    return sizeCount > 0 || weightCount > 0 || ramCount > 0;
  };

  // Handle size selection button click
  const handleSelectSize = () => {
    setIsShowTabs(true);
  };

  // Handle closing the size selection overlay
  const handleCloseTabs = () => {
    setIsShowTabs(false);
    setActiveTab(null);
    setSelectedTabName(null);
  };

  const addToCart = (product, userId, quantity) => {
    const productItem = {
      _id: product?._id,
      name: product?.name,
      image: product?.images[0],
      rating: product?.rating,
      price: product?.price,
      oldPrice: product?.oldPrice,
      discount: product?.discount,
      quantity: quantity,
      subTotal: parseInt(product?.price * quantity),
      productId: product?._id,
      countInStock: product?.countInStock,
      brand: getBrandName(product?.brand),
      size: props?.item?.size?.length !== 0 ? selectedTabName : "",
      weight: props?.item?.productWeight?.length !== 0 ? selectedTabName : "",
      ram: props?.item?.productRam?.length !== 0 ? selectedTabName : "",
    };

    setIsLoading(true);

    // If product has multiple options but no option is selected, show selection overlay
    if (hasMultipleOptions() && activeTab === null) {
      setIsShowTabs(true);
      setIsLoading(false);
      return;
    }

    // Check stock availability for selected size
    if (selectedTabName && props?.item?.size?.length > 0) {
      const stockInfo = getSizeStockInfo(selectedTabName);
      if (stockInfo.isOutOfStock) {
        context?.alertBox("error", `Size ${selectedTabName} is out of stock`);
        setIsLoading(false);
        return;
      }
      if (stockInfo.available < quantity) {
        context?.alertBox(
          "error",
          `Only ${stockInfo.available} units available for size ${selectedTabName}`
        );
        setIsLoading(false);
        return;
      }
    }

    // If product has single option, auto-select it and check stock
    if (hasAnyOptions() && !hasMultipleOptions() && activeTab === null) {
      if (props?.item?.size?.length === 1) {
        const size = props?.item?.size[0];
        const stockInfo = getSizeStockInfo(size);
        if (stockInfo.isOutOfStock) {
          context?.alertBox("error", `Size ${size} is out of stock`);
          setIsLoading(false);
          return;
        }
        setSelectedTabName(size);
      } else if (props?.item?.productWeight?.length === 1) {
        setSelectedTabName(props?.item?.productWeight[0]);
      } else if (props?.item?.productRam?.length === 1) {
        setSelectedTabName(props?.item?.productRam[0]);
      }
    }

    // Add to cart
    setIsAdded(true);
    setIsShowTabs(false);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
    context?.addToCart(productItem, userId, quantity);
  };

  const handleClickActiveTab = (index, name) => {
    setActiveTab(index);
    setSelectedTabName(name);
    // Close the overlay after selecting size
    setIsShowTabs(false);
  };

  useEffect(() => {
    const item = context?.cartData?.filter((cartItem) =>
      cartItem.productId.includes(props?.item?._id)
    );

    const myListItem = context?.myListData?.filter((item) =>
      item.productId.includes(props?.item?._id)
    );

    if (item?.length !== 0) {
      setCartItem(item);
      setIsAdded(true);
      setQuantity(item[0]?.quantity);
    } else {
      setCartItem([]);
      setIsAdded(false);
      setQuantity(1);
      // Reset size selection when item is removed from cart
      setActiveTab(null);
      setSelectedTabName(null);
    }

    if (myListItem?.length !== 0) {
      setIsAddedInMyList(true);
    } else {
      setIsAddedInMyList(false);
    }
  }, [context?.cartData, context?.myListData]);

  useEffect(() => {
    // Fetch size stock data when product changes
    fetchSizeStockAvailability();
  }, [props?.item?._id]);

  const minusQty = () => {
    if (quantity !== 1 && quantity > 1) {
      setQuantity(quantity - 1);
    } else {
      setQuantity(1);
    }

    if (quantity === 1) {
      deleteData(`/api/cart/delete-cart-item/${cartItem[0]?._id}`).then(
        (res) => {
          setIsAdded(false);
          context.alertBox("success", "Item Removed ");
          context?.getCartItems();
          setIsShowTabs(false);
          setActiveTab(null);
        }
      );
    } else {
      const obj = {
        _id: cartItem[0]?._id,
        qty: quantity - 1,
        subTotal: props?.item?.price * (quantity - 1),
      };

      editData(`/api/cart/update-qty`, obj).then((res) => {
        context.alertBox("success", res?.data?.message);
        context?.getCartItems();
      });
    }
  };

  const addQty = () => {
    setQuantity(quantity + 1);

    const obj = {
      _id: cartItem[0]?._id,
      qty: quantity + 1,
      subTotal: props?.item?.price * (quantity + 1),
    };

    editData(`/api/cart/update-qty`, obj).then((res) => {
      context.alertBox("success", res?.data?.message);
      context?.getCartItems();
    });
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
        brand: getBrandName(item?.brand),
        discount: item?.discount,
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
    <div className="productItem border border-gray-200  transition-all duration-300 overflow-hidden group">
      <div className="imgWrapper w-[100%] overflow-hidden relative">
        <Link to={`/product/${props?.item?._id}`}>
          <div className="img h-[250px] sm:h-[280px] md:h-[280px] xl:h-[380px] 2xl:h-[480px] overflow-hidden relative">
            <img
              src={props?.item?.images[0]}
              className="w-full h-full object-cover"
            />

            {/* Second image that appears on hover */}
            {props?.item?.images?.length > 1 && (
              <img
                src={props?.item?.images[1]}
                className="w-full h-full object-cover transition-all duration-700 absolute top-0 left-0 opacity-0 group-hover:opacity-100 group-hover:scale-105"
              />
            )}
          </div>
        </Link>

        {isShowTabs === true && (
          <div
            className="flex items-center justify-center absolute top-0 left-0 w-full h-full 
      bg-[rgba(0,0,0,0.7)] z-[60] p-3 gap-2 flex-col"
          >
            <Button
              className="!absolute top-[10px] right-[10px] !min-w-[30px] !min-h-[30px] !w-[30px] !h-[30px] !rounded-full !bg-[rgba(255,255,255,1)] text-black"
              onClick={handleCloseTabs}
            >
              {" "}
              <MdClose className=" text-black z-[90] text-[25px]" />
            </Button>

            {/* Helper text */}
            <p className="text-white text-[14px] mb-3 text-center">
              Select your preferred option:
            </p>

            <div className="flex items-center justify-center gap-2">
              {props?.item?.size?.length !== 0 &&
                props?.item?.size?.map((item, index) => {
                  const stockInfo = getSizeStockInfo(item);
                  const isSelected = activeTab === index;
                  const isOutOfStock = stockInfo.isOutOfStock;

                  return (
                    <div
                      key={index}
                      className="flex flex-col items-center gap-1"
                    >
                      <span
                        className={`flex items-center justify-center p-1 px-2 max-w-[35px] h-[25px] rounded-sm cursor-pointer transition-all
                          ${
                            isOutOfStock
                              ? "bg-gray-400 !cursor-not-allowed opacity-50"
                              : "bg-[rgba(255,555,255,0.8)] hover:bg-white"
                          }
                          ${
                            isSelected &&
                            !isOutOfStock &&
                            "!bg-primary text-white"
                          }`}
                        onClick={() =>
                          !isOutOfStock && handleClickActiveTab(index, item)
                        }
                      >
                        {item}
                      </span>
                    </div>
                  );
                })}

              {props?.item?.productRam?.length !== 0 &&
                props?.item?.productRam?.map((item, index) => {
                  return (
                    <span
                      key={index}
                      className={`flex items-center justify-center p-1 px-2 bg-[rgba(255,555,255,0.8)] max-w-[45px] h-[25px]  
            rounded-sm cursor-pointer hover:bg-white 
            ${activeTab === index && "!bg-primary text-white"}`}
                      onClick={() => handleClickActiveTab(index, item)}
                    >
                      {item}
                    </span>
                  );
                })}

              {props?.item?.productWeight?.length !== 0 &&
                props?.item?.productWeight?.map((item, index) => {
                  return (
                    <span
                      key={index}
                      className={`flex items-center justify-center p-1 px-2 bg-[rgba(255,555,255,0.8)] max-w-[35px] h-[25px]  
            rounded-sm cursor-pointer hover:bg-white 
            ${activeTab === index && "!bg-primary text-white"}`}
                      onClick={() => handleClickActiveTab(index, item)}
                    >
                      {item}
                    </span>
                  );
                })}
            </div>
          </div>
        )}

        <div className="actions absolute top-[-20px] right-[5px] z-50 flex items-center gap-2 flex-col w-[50px] transition-all duration-300 group-hover:top-[15px] opacity-0 group-hover:opacity-100">
          <Button
            className={`!w-[30px] !h-[30px] sm:!w-[35px] sm:!h-[35px] !min-w-[30px] sm:!min-w-[35px] !rounded-full !bg-white text-black hover:!bg-primary hover:text-white group`}
            onClick={() => handleAddToMyList(props?.item)}
          >
            {isAddedInMyList === true ? (
              <IoMdHeart className="text-[14px] sm:text-[18px] !text-primary group-hover:text-white hover:!text-white" />
            ) : (
              <FaRegHeart className="text-[14px] sm:text-[18px] !text-black group-hover:text-white hover:!text-white" />
            )}
          </Button>
        </div>
      </div>

      <div className="info p-1.5 sm:p-2 h-auto">
        {/* Brand Name - Bold and bigger */}
        <h6 className="text-[13px] sm:text-[16px] font-bold text-black mb-1 h-[16px] sm:h-[20px]">
          {props?.item?.brand && (
            <Link
              to={`/brand/${getBrandSlug(props?.item?.brand)}`}
              className="link transition-all hover:text-primary"
              onClick={() => {
                const brandSlug = getBrandSlug(props?.item?.brand);
                const fullUrl = `/brand/${brandSlug}`;
              }}
            >
              {getBrandName(props?.item?.brand)}
            </Link>
          )}
        </h6>

        {/* Product Title - Light color and single line with clamp */}
        <h3 className="text-[12px] sm:text-[14px] font-normal text-gray-600 mb-1.5 sm:mb-2 line-clamp-1 h-[16px] sm:h-[20px]">
          <Link
            to={`/product/${props?.item?._id}`}
            className="link transition-all hover:text-primary"
          >
            {props?.item?.name}
          </Link>
        </h3>

        {/* Pricing Section - All in same line */}
        <div className="flex items-center gap-1.5 sm:gap-3 mb-2 sm:mb-4 h-[16px] sm:h-[20px]">
          <span className="price text-black text-[13px] sm:text-[16px] font-bold">
            {formatCurrencyBD(props?.item?.price)}
          </span>
          <span className="oldPrice line-through text-gray-400 text-[11px] sm:text-[14px]">
            {formatCurrencyBD(props?.item?.oldPrice)}
          </span>
          <span className="discount-text text-red-700 text-[11px] sm:text-[14px]">
            ({props?.item?.discount}% off)
          </span>
        </div>

        {/* Available Sizes or Add to Bag Button */}
        <div className="sizes-container h-[32px] sm:h-[40px]">
          {/* Default state: Show available sizes */}
          <div className="sizes-display group-hover:hidden h-[32px] sm:h-[40px] flex items-center">
            {/* Show sizes if available */}
            {props?.item?.size?.length > 0 ||
            props?.item?.productWeight?.length > 0 ||
            props?.item?.productRam?.length > 0 ? (
              <div className="flex flex-wrap gap-1 sm:gap-2 w-full">
                {props?.item?.size?.length > 0 &&
                  props?.item?.size?.slice(0, 4).map((size, index) => (
                    <span
                      key={`size-${index}`}
                      className={`bg-gray-100 text-gray-700 px-3 sm:px-4 py-0.5 rounded-xl text-[10px] sm:text-[12px] border flex-shrink-0
                    ${
                      selectedTabName === size
                        ? "!bg-black !text-white !border-black"
                        : ""
                    }`}
                    >
                      {size}
                    </span>
                  ))}
                {props?.item?.size?.length > 4 && (
                  <span className="text-[10px] sm:text-[12px] text-gray-500 flex items-center">
                    +{props?.item?.size?.length - 4}
                  </span>
                )}
                {props?.item?.productWeight?.length > 0 &&
                  props?.item?.productWeight?.slice(0, 3).map((weight, index) => (
                    <span
                      key={`weight-${index}`}
                      className={`bg-gray-100 text-gray-700 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-[12px] border flex-shrink-0
                    ${
                      selectedTabName === weight
                        ? "!bg-black !text-white !border-black"
                        : ""
                    }`}
                    >
                      {weight}
                    </span>
                  ))}
                {props?.item?.productWeight?.length > 3 && (
                  <span className="text-[10px] sm:text-[12px] text-gray-500 flex items-center">
                    +{props?.item?.productWeight?.length - 3}
                  </span>
                )}
                {props?.item?.productRam?.length > 0 &&
                  props?.item?.productRam?.slice(0, 3).map((ram, index) => (
                    <span
                      key={`ram-${index}`}
                      className={`bg-gray-100 text-gray-700 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-[12px] border flex-shrink-0
                    ${
                      selectedTabName === ram
                        ? "!bg-black !text-white !border-black"
                        : ""
                    }`}
                    >
                      {ram}
                    </span>
                  ))}
                {props?.item?.productRam?.length > 3 && (
                  <span className="text-[10px] sm:text-[12px] text-gray-500 flex items-center">
                    +{props?.item?.productRam?.length - 3}
                  </span>
                )}
              </div>
            ) : (
              <div></div>
            )}
          </div>

          {/* Hover state: Show Add to Bag or Select Size button */}
          <div className="add-to-bag-container hidden group-hover:flex h-[32px] sm:h-[40px] items-center">
            {isAdded === false ? (
              hasAnyOptions() && hasMultipleOptions() ? (
                activeTab !== null ? (
                  <Button
                    className="w-full !bg-black !text-white !py-2 !rounded-none !font-medium !text-[12px] sm:!text-[14px] hover:!bg-gray-800 !transition-all !h-[32px] sm:!h-[40px]"
                    onClick={() =>
                      addToCart(props?.item, context?.userData?._id, quantity)
                    }
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      "Add to Bag"
                    )}
                  </Button>
                ) : (
                  <Button
                    className="w-full !bg-black !text-white !py-2 !rounded-none !font-medium !text-[12px] sm:!text-[14px] hover:!bg-gray-800 !transition-all !h-[32px] sm:!h-[40px]"
                    onClick={handleSelectSize}
                    disabled={isLoading}
                  >
                    Select Size
                  </Button>
                )
              ) : (
                <Button
                  className="w-full !bg-black !text-white !py-2 !rounded-none !font-medium !text-[12px] sm:!text-[14px] hover:!bg-gray-800 !transition-all !h-[32px] sm:!h-[40px]"
                  onClick={() =>
                    addToCart(props?.item, context?.userData?._id, quantity)
                  }
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    "Add to Bag"
                  )}
                </Button>
              )
            ) : (
              <div className="flex items-center justify-between overflow-hidden border border-gray-300 h-[32px] sm:h-[40px] w-full">
                <Button
                  className="!min-w-[32px] sm:!min-w-[40px] !w-[32px] sm:!w-[40px] !h-[32px] sm:!h-[40px] !bg-gray-100 !rounded-none"
                  onClick={minusQty}
                >
                  <FaMinus className="text-gray-700 text-[10px] sm:text-[12px]" />
                </Button>
                <span className="flex-1 text-center font-medium text-[12px] sm:text-[14px]">
                  {quantity}
                </span>
                <Button
                  className="!min-w-[32px] sm:!min-w-[40px] !w-[32px] sm:!w-[40px] !h-[32px] sm:!h-[40px] !bg-black !rounded-none"
                  onClick={addQty}
                >
                  <FaPlus className="text-white text-[10px] sm:text-[12px]" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
