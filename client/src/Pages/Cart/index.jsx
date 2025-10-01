import React, { useContext, useEffect, useState } from "react";

import Button from "@mui/material/Button";
import { BsFillBagCheckFill } from "react-icons/bs";
import CartItems from "./cartItems";
import { MyContext } from "../../App";
import { fetchDataFromApi } from "../../utils/api";
import { Link } from "react-router-dom";
import { formatCurrencyBD } from "../../utils/currency";

const CartPage = () => {

  const [productSizeData, setProductSizeData] = useState([]);
  const [productRamsData, setProductRamsData] = useState([]);
  const [productWeightData, setProductWeightData] = useState([]);
  const context = useContext(MyContext);

  useEffect(() => {

    window.scrollTo(0, 0)

    fetchDataFromApi("/api/product/productSize/get").then((res) => {
      if (res?.error === false) {
        setProductSizeData(res?.data)
      }
    })

    fetchDataFromApi("/api/product/productRAMS/get").then((res) => {
      if (res?.error === false) {
        setProductRamsData(res?.data)
      }
    })

    fetchDataFromApi("/api/product/productWeight/get").then((res) => {
      if (res?.error === false) {
        setProductWeightData(res?.data)
      }
    })
  }, []);




  const selectedSize = (item) => {
    if (item?.size !== "") {
      return item?.size;
    }

    if (item?.weight !== "") {
      return item?.weight;
    }

    if (item?.ram !== "") {
      return item?.ram;
    }

  }


  return (
    <section className="section py-4 lg:py-8 pb-10">
      <div className="container flex gap-5 flex-col lg:flex-row">
        <div className="leftPart w-full lg:w-[70%]">
          <div className="bg-white border border-[rgba(0,0,0,0.1)] ">
            <div className="py-5 px-3 border-b border-[rgba(0,0,0,0.1)]">
              <h2 className="text-[24px] font-[600]">My Bag</h2>
              <p className="mt-0 mb-0">
                There are <span className="font-bold text-[#FF2E4D]">{context?.cartData?.length}</span>{" "}
                products in your bag
              </p>
            </div>

            {

              context?.cartData?.length !== 0 ? context?.cartData?.map((item, index) => {
                return (
                  <CartItems selected={() => selectedSize(item)} qty={item?.quantity} item={item} key={index} productSizeData={productSizeData} productRamsData={productRamsData} productWeightData={productWeightData} />
                )
              })

                :



                <>
                  <>
                    <div className="flex items-center justify-center flex-col py-10 gap-5">
                      <img src="/empty-cart.png" className="w-[150px]" />
                      <h4>Your Bag is currently empty</h4>
                      <Link to="/"><Button className="btn-org">Continue Shopping</Button></Link>
                    </div>
                  </>

                </>
            }

          </div>
        </div>

        <div className="rightPart w-full lg:w-[30%]">
          <div className="bg-white border border-[rgba(0,0,0,0.1)] p-5 sticky top-[155px] z-[90]">
            <h3 className="pb-3 text-[20px] font-[600]">Cart Totals</h3>
            <hr />

            <p className="flex items-center justify-between">
              <span className="text-[14px] font-[500]">Subtotal</span>
              <span className="text-[#FF2E4D] font-bold">
                {
                  formatCurrencyBD(
                    context.cartData?.length !== 0 ?
                      context.cartData?.map(item => parseInt(item.price) * item.quantity)
                        .reduce((total, value) => total + value, 0) : 0
                  )
                }
              </span>
            </p>

            <p className="flex items-center justify-between">
              <span className="text-[14px] font-[500]">Shipping</span>
              <span className="font-bold">Calculated at checkout</span>
            </p>

            <p className="flex items-center justify-between">
              <span className="text-[14px] font-[500]">Estimate for</span>
              <span className="font-bold">
                {context?.userData?.address_details?.length > 0 
                  ? context.userData.address_details[0]?.city || "Not specified"
                  : "Not specified"
                }
              </span>
            </p>

            <p className="flex items-center justify-between">
              <span className="text-[14px] font-[500]">Total</span>
              <span className="text-[#FF2E4D] font-bold">
                {
                  formatCurrencyBD(
                    context.cartData?.length !== 0 ?
                      context.cartData?.map(item => parseInt(item.price) * item.quantity)
                        .reduce((total, value) => total + value, 0) : 0
                  )
                }
              </span>
            </p>

            <br />

            <Link to="/checkout">
              <button className="w-full bg-[#FF2E4D] border border-gray-300 text-white py-3 text-[16px] font-[600] hover:bg-[#e63852] transition-all duration-200 flex items-center justify-center gap-2">
                <BsFillBagCheckFill className="text-[20px]" /> Checkout
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartPage;
