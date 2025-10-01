import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import Rating from "@mui/material/Rating";
import { IoCloseSharp } from "react-icons/io5";
import { MyContext } from "../../App";
import { deleteData } from "../../utils/api";
import { formatCurrencyBD } from "../../utils/currency";

const MyListItems = (props) => {
  const context = useContext(MyContext);

  const removeItem = (id) => {
    deleteData(`/api/myList/${id}`).then((res) => {
      context?.alertBox("success", "Product remove from My List");
      context?.getMyListData();
    });
  };

  return (
    <div className="cartItem w-full p-3 flex items-center gap-4 pb-5 border-b border-[rgba(0,0,0,0.1)]">
      <div className="img w-[30%] sm:w-[15%] h-[150px] overflow-hidden">
        <Link to={`/product/${props?.item?.productId}`} className="group">
          <img
            src={props?.item?.image}
            className="w-full group-hover:scale-105 transition-all"
          />
        </Link>
      </div>

      <div className="info w-full md:w-[85%] relative">
        <IoCloseSharp
          className="cursor-pointer absolute top-[0px] right-[0px] text-[22px] link transition-all"
          onClick={() => removeItem(props?.item?._id)}
        />
        <span className="text-[18px] font-bold">{props?.item?.brand}</span>
        <h3 className="text-[14px] sm:text-[15px] w-[80%] font-[400]">
          <Link to={`/product/${props?.item?.productId}`} className="link">
            {props?.item?.productTitle?.substr(0, 80) + "..."}
          </Link>
        </h3>

        <Rating
          name="size-small"
          value={props?.item?.rating}
          size="small"
          readOnly
        />

        <div className="flex items-center gap-4 mt-2 mb-2">
          <span className="price text-[14px]  font-bold">
            {formatCurrencyBD(props?.item?.price)}
          </span>

          <span className="oldPrice line-through text-gray-500 text-[14px] font-[500]">
            {formatCurrencyBD(props?.item?.oldPrice)}
          </span>

          <span className="price text-red-700 text-[14px]  font-[600]">
            {props?.item?.discount}% OFF
          </span>
        </div>
      </div>
    </div>
  );
};

export default MyListItems;
