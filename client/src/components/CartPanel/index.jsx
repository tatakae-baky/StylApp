import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { RxCross2 } from "react-icons/rx";
import Button from "@mui/material/Button";
import { MyContext } from "../../App";
import { deleteData } from "../../utils/api";
import { formatCurrencyBD } from "../../utils/currency";

const CartPanel = (props) => {
  const context = useContext(MyContext);

  const removeItem = (id) => {
    deleteData(`/api/cart/delete-cart-item/${id}`).then((res) => {
      context.alertBox("success", "Item Removed ");
      context?.getCartItems();
    });
  };

  return (
    <>
      <div className="scroll w-full max-h-[70vh] overflow-y-scroll overflow-x-hidden py-3 px-4">
        {props?.data?.map((item, index) => {
          return (
            <div className="cartItem w-full flex items-start gap-2 lg:gap-4 border-b border-[rgba(0,0,0,0.1)] pb-6 pt-4">
              {/* Product Image */}
              <div
                className="img w-[30%] overflow-hidden h-[150px] flex-shrink-0"
                onClick={context.toggleCartPanel(false)}
              >
                <Link
                  to={`/product/${item?.productId}`}
                  className="block group"
                >
                  <img
                    src={item?.image}
                    className="w-full h-full object-cover"
                  />
                </Link>
              </div>

              {/* Product Details */}
              <div className="info w-[70%] relative">
                {/* Remove Button */}
                <RxCross2
                  className="absolute bg-gray-100 rounded-full p-1 top-0 right-0 cursor-pointer text-[24px]  text-gray-500 hover:text-red-500 transition-colors"
                  onClick={() => removeItem(item?._id)}
                />

                {/* Brand Name */}
                <div className="mb-1">
                  <h3 className="text-[14px] font-bold text-gray-900">
                    {typeof item?.brand === "object"
                      ? item?.brand?.name
                      : item?.brand}
                  </h3>
                </div>

                {/* Product Name */}
                <div className="mb-3">
                  <Link
                    to={`/product/${item?.productId}`}
                    className="link transition-all"
                    onClick={context.toggleCartPanel(false)}
                  >
                    <h4 className="text-[13px] text-gray-700 leading-tight truncate whitespace-nowrap">
                      {item?.productTitle?.length > 35
                        ? item?.productTitle?.substr(0, 35) + "..."
                        : item?.productTitle}
                    </h4>
                  </Link>
                </div>

                {/* Size and Quantity Selection */}
                <div className="flex items-center gap-2 mb-3">
                  {item?.size && (
                    <div className="bg-gray-100 px-3 py-1 rounded text-[12px] text-gray-700">
                      Size {item.size}
                    </div>
                  )}
                  <div className="bg-gray-100 px-3 py-1 rounded text-[12px] text-gray-700">
                    Qty {item?.quantity}
                  </div>
                </div>

                <div className="border-b border-[rgba(0,0,0,0.1)]"></div>

                {/* Pricing Section */}
                <div className="space-y-1 text-right pr-1">
                  {/* Current Price */}
                  <div className="text-[14px] font-[400] text-gray-900">
                    <span className="text-[12px] sm:text-[14px]">You Pay </span>
                    <span className="font-bold text-[13px] sm:text-[14px]">
                      {formatCurrencyBD(item?.price)}
                    </span>
                  </div>

                  {/* Discount and Original Price */}
                  {item?.oldPrice && item?.oldPrice > item?.price && (
                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                      <span className="text-[11px] sm:text-[13px] text-red-700 font-medium">
                        {Math.round(
                          ((item.oldPrice - item.price) / item.oldPrice) * 100
                        )}
                        % off
                      </span>
                      <span className="text-[11px] sm:text-[13px] text-gray-500 line-through">
                        {formatCurrencyBD(item?.oldPrice)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <br />

      <div className="bottomSec absolute bottom-[5px] left-[10px] w-full overflow-hidden pr-3">
        <div className="bottomInfo py-3 px-3 sm:py-3 sm:px-3 w-full border-t border-[rgba(0,0,0,0.1)] flex items-center justify-between flex-col">
          <div className="flex items-center justify-between w-full">
            <span className="text-[13px] sm:text-[14px] font-[600]">
              {context?.cartData?.length} item
            </span>
            <span className="text-primary font-bold text-[13px] sm:text-[14px]">
              {formatCurrencyBD(
                context.cartData?.length !== 0
                  ? context.cartData
                      ?.map((item) => parseInt(item.price) * item.quantity)
                      .reduce((total, value) => total + value, 0)
                  : 0
              )}
            </span>
          </div>
        </div>

        <div className="bottomInfo py-3 px-3 w-full border-t border-[rgba(0,0,0,0.1)] flex items-center justify-between flex-col">
          <div className="flex items-center justify-between w-full">
            <span className="text-[13px] sm:text-[14px] font-[600]">Total (tax excl.)</span>
            <span className="text-primary font-bold text-[13px] sm:text-[14px]">
              {formatCurrencyBD(
                context.cartData?.length !== 0
                  ? context.cartData
                      ?.map((item) => parseInt(item.price) * item.quantity)
                      .reduce((total, value) => total + value, 0)
                  : 0
              )}
            </span>
          </div>

          <br />

          <div className="flex items-center justify-between w-full gap-2 sm:gap-3">
            <Link
              to="/cart"
              className="w-[48%]"
              onClick={context.toggleCartPanel(false)}
            >
              <button className="w-full bg-black text-white py-3 text-[14px] sm:text-[16px] font-[600] hover:bg-gray-800 transition-all duration-200 flex items-center justify-center">
                View Cart
              </button>
            </Link>
            <Link
              to="/checkout"
              className="w-[48%]"
              onClick={context.toggleCartPanel(false)}
            >
              <button className="w-full bg-[#FF2E4D] border border-gray-300 text-white py-3 text-[14px] sm:text-[16px] font-[600] hover:bg-[#e63852] transition-all duration-200 flex items-center justify-center">
                Checkout
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartPanel;
