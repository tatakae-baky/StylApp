import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { IoChatboxOutline, IoCloseSharp } from "react-icons/io5";

import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import { FaFacebookF } from "react-icons/fa";
import { AiOutlineYoutube } from "react-icons/ai";
import { FaPinterestP } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";

import Drawer from "@mui/material/Drawer";
import CartPanel from "../CartPanel";
import { MyContext } from "../../App";
import AddAddress from "../../Pages/MyAccount/addAddress";

const Footer = () => {
  const context = useContext(MyContext);

  return (
    <>
      <footer className="py-6 ">
        <div className="container">
          <hr />

          <div className="footer flex px-3 lg:px-0 flex-col lg:flex-row py-8">
            <div className="part1 w-full lg:w-[25%] border-r border-[rgba(0,0,0,0.1)]">
              <h2 className="text-[22px] font-[600] mb-2 text-[#FF2E4D]">Styl'</h2>
              <p className="text-[16px] font-[600] pb-2 text-black">
                You know it, You see it, You styl it
              </p>

              <Link
                className="link text-[13px] font-[400] text-black"
                to="mailto:someone@example.com"
              >
                sales@styl.bd.com
              </Link>

              <span className="text-[13px] font-[400] block w-full mt-1 mb-5 text-black">
                (+880) 1857340719
              </span>
            </div>

            <div className="part2  w-full lg:w-[40%] flex pl-0 lg:pl-8 mt-5 lg:mt-0">
              <div className="part2_col1 w-[50%]">
                <h2 className="text-[18px] font-[600] mb-4">Products</h2>

                <ul className="list">
                  <li className="list-none text-[14px] w-full mb-2">
                    <Link to="/products?sort=price" className="link">
                      Prices drop
                    </Link>
                  </li>
                  <li className="list-none text-[14px] w-full mb-2">
                    <Link to="/products?new=true" className="link">
                      New products
                    </Link>
                  </li>
                  <li className="list-none text-[14px] w-full mb-2">
                    <Link to="/products?sort=popular" className="link">
                      Best sales
                    </Link>
                  </li>
                  <li className="list-none text-[14px] w-full mb-2">
                    <Link to="/brands" className="link">
                      All Brands
                    </Link>
                  </li>
                  <li className="list-none text-[14px] w-full mb-2">
                    <Link to="/products" className="link">
                      All Products
                    </Link>
                  </li>
                  <li className="list-none text-[14px] w-full mb-2">
                    <Link to="/my-list" className="link">
                      My Wishlist
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="part2_col2 w-[50%]">
                <h2 className="text-[18px] font-[600] mb-4">My Account</h2>

                <ul className="list">
                  <li className="list-none text-[14px] w-full mb-2">
                    <Link to="/my-account" className="link">
                      My Account
                    </Link>
                  </li>
                  <li className="list-none text-[14px] w-full mb-2">
                    <Link to="/my-orders" className="link">
                      Track Orders
                    </Link>
                  </li>
                  <li className="list-none text-[14px] w-full mb-2">
                    <Link to="/address" className="link">
                      Manage Addresses
                    </Link>
                  </li>
                  <li className="list-none text-[14px] w-full mb-2">
                    <Link to="/cart" className="link">
                      Shopping Cart
                    </Link>
                  </li>
                  <li className="list-none text-[14px] w-full mb-2">
                    <Link to="/forgot-password" className="link">
                      Reset Password
                    </Link>
                  </li>
                  <li className="list-none text-[14px] w-full mb-2">
                    <Link to="/login" className="link">
                      Login / Register
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="part2  w-full lg:w-[35%] flex pl-0 lg:pl-8 flex-col pr-8 mt-5 lg:mt-0">
              <h2 className="text-[18px] font-[600] mb-2 lg:mb-4">
                Subscribe to newsletter
              </h2>
              <p className="text-[13px]">
                Subscribe to our latest newsletter to get news about special
                discounts.
              </p>

              <form className="mt-5">
                <input
                  type="text"
                  className="w-full h-[45px] border outline-none pl-4 pr-4 rounded-sm mb-4 focus:border-[rgba(0,0,0,0.3)]"
                  placeholder="Your Email Address"
                />

                <Button className="w-full !bg-black !text-white !py-2 !rounded-none !font-medium !text-[14px] hover:!bg-gray-800 !transition-all !h-[40px]">
                  SUBSCRIBE
                </Button>

                <FormControlLabel
                  className="mt-3 lg:mt-0 block w-full"
                  control={<Checkbox />}
                  label=" I agree to the terms and conditions and the privacy policy"
                />
              </form>
            </div>
          </div>
        </div>
      </footer>

      <div className="bottomStrip border-t border-[rgba(0,0,0,0.1)] pt-3 pb-[30px] lg:pb-3 bg-white">
        <div className="container flex items-center justify-between flex-col lg:flex-row gap-4 lg:gap-0">
          <p className="text-[13px] text-center mb-0">
            © 2025 Styl'. All Rights Reserved.
          </p>
          <ul className="flex items-center gap-2">
            <li className="list-none">
              <Link
                to="https://facebook.com"
                target="_blank"
                className="w-[35px] h-[35px] rounded-full border border-[rgba(0,0,0,0.1)] flex items-center justify-center group hover:bg-primary transition-all"
              >
                <FaFacebookF className="text-[17px] group-hover:text-white" />
              </Link>
            </li>

            <li className="list-none">
              <Link
                to="https://youtube.com"
                target="_blank"
                className="w-[35px] h-[35px] rounded-full border border-[rgba(0,0,0,0.1)] flex items-center justify-center group hover:bg-primary transition-all"
              >
                <AiOutlineYoutube className="text-[21px] group-hover:text-white" />
              </Link>
            </li>

            <li className="list-none">
              <Link
                to="https://pinterest.com"
                target="_blank"
                className="w-[35px] h-[35px] rounded-full border border-[rgba(0,0,0,0.1)] flex items-center justify-center group hover:bg-primary transition-all"
              >
                <FaPinterestP className="text-[17px] group-hover:text-white" />
              </Link>
            </li>

            <li className="list-none">
              <Link
                to="https://instagram.com"
                target="_blank"
                className="w-[35px] h-[35px] rounded-full border border-[rgba(0,0,0,0.1)] flex items-center justify-center group hover:bg-primary transition-all"
              >
                <FaInstagram className="text-[17px] group-hover:text-white" />
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Cart Panel */}
      <Drawer
        open={context.openCartPanel}
        onClose={context.toggleCartPanel(false)}
        anchor={"right"}
        className="cartPanel"
      >
        <div className="flex items-center justify-between py-3 px-4 gap-3 border-b border-[rgba(0,0,0,0.1)] overflow-hidden">
          <h4 className="text-[24px] font-[600]">Bag ({context?.cartData?.length})</h4>
          <IoCloseSharp
            className="text-[28px]  cursor-pointer"
            onClick={context.toggleCartPanel(false)}
          />
        </div>

        {context?.cartData?.length !== 0 ? (
          <CartPanel data={context?.cartData} />
        ) : (
          <>
            <div className="flex items-center justify-center flex-col pt-[100px] gap-5">
              <img src="/empty-cart.png" className="w-[150px]" />
              <h4>Your Cart is currently empty</h4>
              <button
                onClick={context.toggleCartPanel(false)}
                className="bg-[#FF2E4D] text-white py-2 px-6 text-[16px] font-[600] hover:bg-[#e63852] transition-all duration-200 flex items-center justify-center gap-2"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </Drawer>

      {/* Address Panel */}
      <Drawer
        open={context.openAddressPanel}
        onClose={context.toggleAddressPanel(false)}
        anchor={"right"}
        className="addressPanel"
      >
        <div className="flex items-center justify-between py-3 px-4 gap-3 border-b border-[rgba(0,0,0,0.1)] overflow-hidden">
          <h4 className="text-[22px] font-[600]">
            {context?.addressMode === "add" ? "Add" : "Edit"} Delivery Address{" "}
          </h4>
          <IoCloseSharp
            className="text-[28px] cursor-pointer"
            onClick={context.toggleAddressPanel(false)}
          />
        </div>

        <div className="w-full max-h-[100vh] overflow-auto">
          <AddAddress />
        </div>
      </Drawer>
    </>
  );
};

export default Footer;
