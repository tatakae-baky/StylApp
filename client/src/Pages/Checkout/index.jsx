import React, { useContext, useEffect, useState } from "react";
/**
 * Checkout UI-UX refinements (non-functional):
 * - Sticky order summary on desktop
 * - Mobile sticky total bar + CTA
 * - Lightweight skeletons while shipping info loads
 * - Accessibility labels and focus-visible rings
 */
import { BsFillBagCheckFill } from "react-icons/bs";
import { MyContext } from "../../App";
import Radio from "@mui/material/Radio";
import { deleteData, postData } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import { formatCurrencyBD } from "../../utils/currency";
import {
  calculateBrandDeliveryCharges,
  formatDeliveryDisplay,
  getDeliveryDateRange,
} from "../../utils/brandDeliveryHelper";

const Checkout = () => {
  const [userData, setUserData] = useState(null);
  const [isChecked, setIsChecked] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [selectedAddressObj, setSelectedAddressObj] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [shippingCharge, setShippingCharge] = useState(0);
  const [brandDeliveryData, setBrandDeliveryData] = useState(null);
  const [isLoading, setIsloading] = useState(false);
  const context = useContext(MyContext);

  const history = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    setUserData(context?.userData);
    setSelectedAddress(context?.userData?.address_details[0]?._id);
    setSelectedAddressObj(context?.userData?.address_details[0]);
  }, [context?.userData, userData]);

  useEffect(() => {
    const cartTotal =
      context.cartData?.length !== 0
        ? context.cartData
            ?.map((item) => parseInt(item.price) * item.quantity)
            .reduce((total, value) => total + value, 0)
        : 0;

    setTotalAmount(cartTotal);
  }, [context.cartData]);

  // Calculate shipping charge when selected address changes
  useEffect(() => {
    if (
      selectedAddressObj &&
      selectedAddressObj.city &&
      context.cartData?.length
    ) {
      // Calculate brand-based delivery charges
      calculateBrandDeliveryCharges(
        context.cartData,
        selectedAddressObj.city
      ).then((deliveryData) => {
        setBrandDeliveryData(deliveryData);
        setShippingCharge(deliveryData.totalDeliveryCharges);
      });
    } else if (context.cartData?.length) {
      // Default calculation for outside Dhaka
      calculateBrandDeliveryCharges(context.cartData, "Outside Dhaka").then(
        (deliveryData) => {
          setBrandDeliveryData(deliveryData);
          setShippingCharge(deliveryData.totalDeliveryCharges);
        }
      );
    }
  }, [selectedAddressObj, context.cartData]);

  const editAddress = (id) => {
    context?.setOpenAddressPanel(true);
    context?.setAddressMode("edit");
    context?.setAddressId(id);
  };

  const handleChange = (e, index) => {
    if (e.target.checked) {
      setIsChecked(index);
      setSelectedAddress(e.target.value);
      // Find the selected address object to get city for shipping calculation
      const addressObj = userData?.address_details?.find(
        (addr) => addr._id === e.target.value
      );
      setSelectedAddressObj(addressObj);
    }
  };

  const cashOnDelivery = () => {
    const user = context?.userData;
    setIsloading(true);

    if (userData?.address_details?.length !== 0) {
      const payLoad = {
        // SECURITY FIX: Removed userId - server will get it from auth token
        products: context?.cartData,
        paymentId: "",
        payment_status: "CASH ON DELIVERY",
        delivery_address: selectedAddress,
        totalAmt: totalAmount, // Send numeric value, shipping will be calculated in backend
        date: new Date().toLocaleString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
      };

      postData(`/api/order/create`, payLoad).then((res) => {
        context.alertBox("success", res?.message);

        if (res?.error === false) {
          deleteData(`/api/cart/emptyCart`).then((res) => {
            context?.getCartItems();
            setIsloading(false);
          });
        } else {
          context.alertBox("error", res?.message);
        }
        history("/order/success");
      });
    } else {
      context.alertBox("error", "Please add address");
      setIsloading(false);
    }
  };

  return (
    <section className="py-3 lg:py-10 px-3 pb-24 md:pb-10">
      <div
        className="container flex gap-5 flex-col lg:flex-row"
        role="main"
        aria-label="Checkout"
      >
        {/* Left Column - Select Delivery Address (Now Second) */}
        <div
          className="leftCol w-full md:w-[40%]"
          aria-labelledby="delivery-address-heading"
        >
          <div className="card bg-white border border-[rgba(0,0,0,0.1)] p-5  w-full">
            <div className="flex items-center justify-between">
              <h2 id="delivery-address-heading">Select Delivery Address</h2>
              {userData?.address_details?.length !== 0 && (
                <button
                  onClick={() => {
                    context?.setOpenAddressPanel(true);
                    context?.setAddressMode("add");
                  }}
                  className="bg-[#FF2E4D] border border-gray-300 text-white px-4 py-2 text-[14px] font-[600] hover:bg-[#e63852] transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2E4D] focus-visible:ring-offset-2"
                  aria-label="Add new delivery address"
                >
                  ADD {context?.windowWidth < 767 ? "" : "NEW ADDRESS"}
                </button>
              )}
            </div>

            <br />

            <div
              className="flex flex-col gap-4"
              role="radiogroup"
              aria-label="Saved delivery addresses"
            >
              {userData?.address_details?.length !== 0 ? (
                userData?.address_details?.map((address, index) => {
                  return (
                    <label
                      className={`flex gap-3 p-4 border border-[rgba(0,0,0,0.1)]  relative ${
                        isChecked === index && "bg-[#f1f1f1]"
                      }`}
                      key={index}
                      aria-selected={isChecked === index}
                    >
                      <div>
                        <Radio
                          size="small"
                          onChange={(e) => handleChange(e, index)}
                          checked={isChecked === index}
                          value={address?._id}
                          inputProps={{
                            "aria-label": `${
                              address?.addressType || "Address"
                            } for ${userData?.name}`,
                          }}
                        />
                      </div>
                      <div className="info">
                        <span className="inline-block text-[13px] font-[500] p-1 bg-[#f1f1f1] rounded-md">
                          {address?.addressType}
                        </span>
                        <h3>{userData?.name}</h3>
                        <p className="mt-0 mb-0">
                          {[
                            address?.address_line1,
                            address?.street,
                            address?.apartmentName,
                            address?.city,
                            address?.postcode,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>

                        <p className="mb-0 font-[500]">
                          {address?.mobile && address.mobile.startsWith("+880")
                            ? address.mobile
                            : address?.mobile
                            ? `+880${address.mobile.replace(/^\+880/, "")}`
                            : userData?.mobile
                            ? userData.mobile.startsWith("+880")
                              ? userData.mobile
                              : `+880${userData.mobile}`
                            : ""}
                        </p>
                      </div>

                      <button
                        className="absolute top-[15px] right-[15px] bg-black border border-gray-300 text-white px-3 py-1 text-[12px] font-[600] hover:bg-gray-800 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                        aria-label={`Edit address ${index + 1}`}
                        onClick={() => editAddress(address?._id)}
                      >
                        EDIT
                      </button>
                    </label>
                  );
                })
              ) : (
                <>
                  <div className="flex items-center mt-5 justify-between flex-col p-5">
                    <img src="/map.png" width="100" alt="Map placeholder" />
                    <h2 className="text-center">
                      No Addresses found in your account!
                    </h2>
                    <p className="mt-0">Add a delivery address.</p>
                    <button
                      className="bg-[#FF2E4D] border border-gray-300 text-white px-6 py-3 text-[16px] font-[600] hover:bg-[#e63852] transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2E4D] focus-visible:ring-offset-2"
                      aria-label="Add delivery address"
                      onClick={() => {
                        context?.setOpenAddressPanel(true);
                        context?.setAddressMode("add");
                      }}
                    >
                      ADD ADDRESS
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Your Order (Now First) */}

        <div className="rightCol w-full md:w-[60%]">
          <div className="card bg-white border border-[rgba(0,0,0,0.1)] p-4 md:sticky md:top-6">
            <h2 className="mb-4">Your Order</h2>
            <div
              className="mb-4 scroll max-h-[340px] overflow-y-scroll overflow-x-hidden pr-2"
              aria-live="polite"
            >
              {!brandDeliveryData && (
                <div className="space-y-4 animate-pulse" aria-hidden="true">
                  <div className="h-6 bg-gray-100 rounded" />
                  <div className="h-[88px] bg-gray-100 rounded" />
                  <div className="h-[88px] bg-gray-100 rounded" />
                </div>
              )}
              {brandDeliveryData?.brandGroups?.map((brandGroup, brandIndex) => (
                <div key={brandIndex} className="mb-6 border-b border-gray-100 pb-4 last:border-b-0">
                  {brandGroup.items.map((item, itemIndex) => (
                    <div key={itemIndex}>
                      <div className="flex items-start justify-between py-2 pl-2">
                        <div className="part1 flex items-start gap-3 pr-2">
                          <div className="img w-[48px] h-[58px] object-cover overflow-hidden group cursor-pointer flex-shrink-0">
                            <img
                              src={item?.image}
                              alt={item?.productTitle || "Product image"}
                              className="w-full h-full object-cover transition-all"
                            />
                          </div>

                          <div className="info leading-tight">
                            {/* Primary: Product title */}
                            <span className="inline-block uppercase tracking-wide text-gray-900 text-[14px] font-[700]">
                              {brandGroup.brandName}
                            </span>
                            <h4
                              className="text-[12px] font-[700] mt-1 text-gray-700"
                              title={item?.productTitle}
                            >
                              {item?.productTitle?.substr(0, 42) +
                                (item?.productTitle?.length > 42 ? "..." : "")}
                            </h4>
                            {/* Secondary: Quantity */}
                            <div className="text-[12px] mt-1 text-gray-700">
                              Qty: {item?.quantity}
                            </div>
                            {/* Brand badge kept in Row 1 for quick recognition */}
                          </div>
                        </div>

                        <span className="text-[14px] font-[700] text-gray-900 whitespace-nowrap pl-2">
                          {formatCurrencyBD(item?.quantity * item?.price)}
                        </span>
                      </div>
                      {/* Row 2: Expected + Delivery only - show only for last item of each brand */}
                      {itemIndex === brandGroup.items.length - 1 && (
                        <div className="text-[12px] text-gray-600 bg-gray-100 px-3 py-2 ml-[8px] mt-1">
                          <div className="mb-1">
                            <span className="font-[600] text-gray-700">Delivery: </span>
                              <span className="text-[12px] text-green-700 font-[600]">{formatCurrencyBD(brandGroup.deliveryCharge)}</span>
                          </div>
                          <div className="text-[12px] text-gray-700 font-[600]">
                            Expected Arrival : <span className="text-[12px] text-green-700">{getDeliveryDateRange()}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="border-t border-[rgba(0,0,0,0.1)] pt-3 mb-4">
              <div className="flex items-center justify-between py-2">
                <span className="text-[14px] font-[600]">Subtotal</span>
                <span className="text-[14px] font-[600]">
                  {formatCurrencyBD(totalAmount)}
                </span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-[14px] font-[600]">
                  Shipping (
                  {brandDeliveryData
                    ? formatDeliveryDisplay(
                        brandDeliveryData,
                        selectedAddressObj?.city || "Outside Dhaka"
                      ).deliveryDescription
                    : "Calculating..."}
                  )
                </span>
                <span className="text-[14px] font-[600]">
                  {formatCurrencyBD(shippingCharge)}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-[rgba(0,0,0,0.1)] mt-2 pt-2">
                <span className="text-[16px] font-[700]">Total</span>
                <span className="text-[16px] font-[700] text-primary">
                  {formatCurrencyBD(totalAmount + shippingCharge)}
                </span>
              </div>
            </div>

            <div className="flex items-center flex-col gap-3 mb-2">
              <button
                type="button"
                className="w-full bg-black text-white py-3 text-[16px] font-[600] hover:bg-gray-800 transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                onClick={cashOnDelivery}
                aria-label="Place order"
              >
                {isLoading === true ? (
                  <CircularProgress size={20} sx={{ color: "white" }} />
                ) : (
                  <>
                    <BsFillBagCheckFill className="text-[20px]" />
                    Place Order -{" "}
                    {formatCurrencyBD(totalAmount + shippingCharge)}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};

export default Checkout;
