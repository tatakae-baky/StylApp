import React, { useContext, useEffect, useState } from "react";
import AccountSidebar from "../../components/AccountSidebar";
import { FaAngleDown } from "react-icons/fa6";
import Badge from "../../components/Badge";
import { FaAngleUp } from "react-icons/fa6";
import { FaCopy } from "react-icons/fa";
import { fetchDataFromApi } from "../../utils/api";
import Pagination from "@mui/material/Pagination";
import { formatCurrencyBD } from "../../utils/currency";
import { MyContext } from "../../App";
import { useNavigate } from "react-router-dom";

const Orders = () => {
  const [isOpenOrderdProduct, setIsOpenOrderdProduct] = useState(null);
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  
  const context = useContext(MyContext);
  const history = useNavigate();

  // Add authentication guard
  useEffect(() => {
    if (!context.isLogin) {
      history('/login');
    }
  }, [context.isLogin, history]);

  const isShowOrderdProduct = (index) => {
    if (isOpenOrderdProduct === index) {
      setIsOpenOrderdProduct(null);
    } else {
      setIsOpenOrderdProduct(index);
    }
  };

  // Function to copy order ID to clipboard
  const copyOrderId = async (orderId) => {
    try {
      await navigator.clipboard.writeText(orderId);
      // You could add a toast notification here if you have a toast system
      console.log('Order ID copied to clipboard');
    } catch (err) {
      console.error('Failed to copy order ID:', err);
    }
  };

  useEffect(() => {
    fetchDataFromApi(`/api/order/order-list/orders?page=${page}&limit=5`).then((res) => {
      if (res?.error === false) {
        setOrders(res)
      }
    })
  }, [page])

  return (
    <section className="py-5 lg:py-10 w-full">
      <div className="container flex flex-col lg:flex-row gap-5">
        <div className="col1 w-[20%] hidden lg:block">
          <AccountSidebar />
        </div>

        <div className="col2 w-full lg:w-[80%]">
          <div className="bg-white border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-[20px] font-[600] text-gray-900 mb-2">My Orders</h2>
              <p className="text-[14px] text-gray-600">
                There are <span className="font-bold text-[#FF2E4D]">{orders?.data?.length}</span>{" "}
                orders
              </p>
            </div>

            <div className="p-6">
              {/* Mobile/Tablet View - Card Layout */}
              <div className="lg:hidden space-y-4">
                {orders?.data?.length !== 0 && orders?.data?.map((order, index) => (
                  <div key={index} className="border border-gray-200 p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <button
                          className="w-8 h-8 rounded-full bg-[#f1f1f1] flex items-center justify-center hover:bg-gray-200 transition-colors"
                          onClick={() => isShowOrderdProduct(index)}
                        >
                          {isOpenOrderdProduct === index ? 
                            <FaAngleUp className="text-[14px] text-gray-600" /> : 
                            <FaAngleDown className="text-[14px] text-gray-600" />
                          }
                        </button>
                        {/* Show product status summary */}
                        <div className="flex flex-wrap gap-1">
                          {order?.products?.map((product, productIndex) => (
                            <Badge 
                              key={productIndex} 
                              status={product?.status || product?.brandStatus || 'pending'} 
                              size="small"
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-[12px] text-gray-500">
                        {order?.createdAt?.split("T")[0]}
                      </span>
                    </div>

                    <div className="space-y-2 text-[14px]">
                      <div className="flex justify-between items-start">
                        <span className="font-[600] text-gray-700">Order ID:</span>
                        <div className="text-right">
                          <div className="text-[#FF2E4D] font-mono text-[11px] break-all max-w-[150px]">
                            {order?._id}
                          </div>
                          <button
                            onClick={() => copyOrderId(order?._id)}
                            className="text-[10px] text-gray-500 hover:text-[#FF2E4D] transition-colors mt-1 flex items-center gap-1"
                            title="Copy Order ID"
                          >
                            <FaCopy className="text-[8px]" />
                            Copy ID
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-[600] text-gray-700">Payment:</span>
                        <span className="text-[13px]">{order?.paymentId ? order?.paymentId : 'CASH ON DELIVERY'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-[600] text-gray-700">Total:</span>
                        <span className="font-bold">{formatCurrencyBD(order?.totalWithShipping || order?.totalAmt)}</span>
                      </div>
                      <div>
                        <span className="font-[600] text-gray-700">Address:</span>
                        <div className="mt-1">
                          <span className="inline-block text-[12px] font-[500] px-2 py-1 bg-[#f1f1f1] rounded-md mb-1">
                            {order?.delivery_address?.addressType}
                          </span>
                          <p className="text-[13px] text-gray-600 leading-relaxed">
                            {order?.delivery_address?.address_line1 + " " +
                              order?.delivery_address?.city + " " +
                              order?.delivery_address?.landmark + " " +
                              order?.delivery_address?.state + " " +
                              order?.delivery_address?.country}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Product Details */}
                    {isOpenOrderdProduct === index && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="font-[600] text-gray-900 mb-3">Order Details</h4>
                        <div className="space-y-3">
                          {order?.products?.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex items-center gap-3 p-3 bg-white rounded border">
                              <img
                                src={item?.image}
                                className="w-12 h-12 object-cover rounded-md"
                                alt={item?.productTitle}
                              />
                              <div className="flex-1 min-w-0">
                                <h5 className="font-[600] text-[13px] text-gray-900 truncate">
                                  {item?.productTitle}
                                </h5>
                                <p className="text-[12px] text-gray-600">
                                  Qty: {item?.quantity} × {formatCurrencyBD(item?.price)}
                                </p>
                                <div className="mt-1">
                                  <Badge status={item?.status || item?.brandStatus || 'pending'} size="small" />
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-[600] text-[14px]">
                                  {formatCurrencyBD(item?.price * item?.quantity)}
                                </p>
                              </div>
                            </div>
                          ))}
                          
                          {/* Order Summary */}
                          <div className="bg-gray-50 p-3 rounded border-t">
                            <div className="flex justify-between text-[14px] mb-1">
                              <span>Subtotal:</span>
                              <span>{formatCurrencyBD(order?.totalAmt)}</span>
                            </div>
                            <div className="flex justify-between text-[14px] mb-2">
                              <span>Shipping:</span>
                              <span>{formatCurrencyBD(order?.shippingCharge || 0)}</span>
                            </div>
                            <div className="flex justify-between font-[700] text-[16px] border-t pt-2">
                              <span>Total:</span>
                              <span className="text-[#FF2E4D]">{formatCurrencyBD(order?.totalWithShipping || order?.totalAmt)}</span>
                            </div>
                          </div>

                          {/* Customer Information */}
                          <div className="bg-white p-3 rounded border">
                            <h5 className="font-[600] text-gray-900 mb-2">Customer Information</h5>
                            <div className="text-[13px] text-gray-600 space-y-1">
                              <div><span className="font-[600] text-gray-900">Name:</span> {order?.userId?.name}</div>
                              <div><span className="font-[600] text-gray-900">Phone:</span> {order?.delivery_address?.mobile}</div>
                              <div><span className="font-[600] text-gray-900">Email:</span> {order?.userId?.email}</div>
                            </div>
                          </div>

                          {/* Address Information */}
                          <div className="bg-white p-3 rounded border">
                            <h5 className="font-[600] text-gray-900 mb-2">Delivery Address</h5>
                            <div className="text-[13px] text-gray-600">
                              <div className="mb-1">
                                <span className="inline-block text-[12px] font-[500] px-2 py-1 bg-[#f1f1f1] rounded-md">
                                  {order?.delivery_address?.addressType}
                                </span>
                              </div>
                              <p className="leading-relaxed">
                                {order?.delivery_address?.address_line1 + " " +
                                  order?.delivery_address?.city + " " +
                                  order?.delivery_address?.landmark + " " +
                                  order?.delivery_address?.state + " " +
                                  order?.delivery_address?.country}
                              </p>
                              <p className="mt-1">Postcode: {order?.delivery_address?.postcode}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop View - Compact Table */}
              <div className="hidden lg:block">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 w-12">
                        &nbsp;
                      </th>
                        <th scope="col" className="px-4 py-3">
                          Order ID
                      </th>
                        <th scope="col" className="px-4 py-3">
                          Payment
                      </th>
                        <th scope="col" className="px-4 py-3">
                          Total
                      </th>
                        <th scope="col" className="px-4 py-3">
                        Date
                      </th>
                        <th scope="col" className="px-4 py-3">
                          Details
                        </th>
                    </tr>
                  </thead>
                  <tbody>
                      {orders?.data?.length !== 0 && orders?.data?.map((order, index) => (
                        <React.Fragment key={index}>
                          <tr className="bg-white border-b hover:bg-gray-50">
                            <td className="px-4 py-4">
                              <button
                                className="w-8 h-8 rounded-full bg-[#f1f1f1] flex items-center justify-center hover:bg-gray-200 transition-colors"
                                  onClick={() => isShowOrderdProduct(index)}
                                >
                                {isOpenOrderdProduct === index ? 
                                  <FaAngleUp className="text-[14px] text-gray-600" /> : 
                                  <FaAngleDown className="text-[14px] text-gray-600" />
                                  }
                              </button>
                              </td>
                            <td className="px-4 py-4">
                              <div className="group relative">
                                <div className="flex items-center gap-2">
                                  <span className="text-[#FF2E4D] font-mono text-[12px] cursor-pointer hover:text-[#e63852] transition-colors">
                                    {order?._id?.substring(0, 12)}...
                                  </span>
                                  <button
                                    onClick={() => copyOrderId(order?._id)}
                                    className="text-gray-400 hover:text-[#FF2E4D] transition-colors p-1"
                                    title="Copy Order ID"
                                  >
                                    <FaCopy className="text-[10px]" />
                                  </button>
                                </div>
                                {/* Full Order ID Tooltip */}
                                <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-[11px] font-mono rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                  {order?._id}
                                  <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                </div>
                              </div>
                              </td>
                            <td className="px-4 py-4">
                              <span className="text-[13px]">{order?.paymentId ? order?.paymentId : 'CASH ON DELIVERY'}</span>
                              </td>
                            <td className="px-4 py-4 font-[600]">
                              {formatCurrencyBD(order?.totalWithShipping || order?.totalAmt)}
                            </td>
                            <td className="px-4 py-4 text-[13px]">
                                {order?.createdAt?.split("T")[0]}
                              </td>
                            <td className="px-4 py-4">
                              <div className="text-[12px] text-gray-600">
                                <div>View Details</div>
                              </div>
                            </td>
                            </tr>

                            {isOpenOrderdProduct === index && (
                              <tr>
                              <td colSpan="6" className="px-4 py-4 bg-gray-50">
                                <div className="space-y-4">
                                  <h4 className="font-[600] text-gray-900 mb-3">Order Details</h4>
                                  
                                  {/* Products List */}
                                  <div className="space-y-3">
                                    {order?.products?.map((item, itemIndex) => (
                                      <div key={itemIndex} className="flex items-center gap-3 p-3 bg-white rounded border">
                                                  <img
                                                    src={item?.image}
                                          className="w-12 h-12 object-cover rounded-md"
                                          alt={item?.productTitle}
                                        />
                                        <div className="flex-1 min-w-0">
                                          <h5 className="font-[600] text-[13px] text-gray-900 truncate">
                                            {item?.productTitle}
                                          </h5>
                                          <p className="text-[12px] text-gray-600">
                                            Qty: {item?.quantity} × {formatCurrencyBD(item?.price)}
                                          </p>
                                          <div className="mt-1">
                                            <Badge status={item?.status || item?.brandStatus || 'pending'} size="small" />
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <p className="font-[600] text-[14px]">
                                            {formatCurrencyBD(item?.price * item?.quantity)}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                        {/* Order Summary */}
                                  <div className="bg-white p-4 rounded border">
                                    <div className="flex justify-between text-[14px] mb-2">
                                      <span>Subtotal:</span>
                                      <span>{formatCurrencyBD(order?.totalAmt)}</span>
                                    </div>
                                    <div className="flex justify-between text-[14px] mb-3">
                                      <span>Shipping:</span>
                                      <span>{formatCurrencyBD(order?.shippingCharge || 0)}</span>
                                    </div>
                                    <div className="flex justify-between font-[700] text-[16px] border-t pt-2">
                                      <span>Total:</span>
                                      <span className="text-[#FF2E4D]">{formatCurrencyBD(order?.totalWithShipping || order?.totalAmt)}</span>
                                    </div>
                                  </div>

                                  {/* Customer Information */}
                                  <div className="bg-white p-4 rounded border">
                                    <h5 className="font-[600] text-gray-900 mb-2">Customer Information</h5>
                                    <div className="text-[13px] text-gray-600 space-y-1">
                                      <div><span className="font-[600] text-gray-900">Name:</span> {order?.userId?.name}</div>
                                      <div><span className="font-[600] text-gray-900">Phone:</span> {order?.delivery_address?.mobile}</div>
                                      <div><span className="font-[600] text-gray-900">Email:</span> {order?.userId?.email}</div>
                                    </div>
                                  </div>

                                  {/* Address Information */}
                                  <div className="bg-white p-4 rounded border">
                                    <h5 className="font-[600] text-gray-900 mb-2">Delivery Address</h5>
                                    <div className="text-[13px] text-gray-600">
                                      <div className="mb-1">
                                        <span className="inline-block text-[12px] font-[500] px-2 py-1 bg-[#f1f1f1] rounded-md">
                                          {order?.delivery_address?.addressType}
                                        </span>
                                      </div>
                                      <p className="leading-relaxed">
                                        {order?.delivery_address?.address_line1 + " " +
                                          order?.delivery_address?.city + " " +
                                          order?.delivery_address?.landmark + " " +
                                          order?.delivery_address?.state + " " +
                                          order?.delivery_address?.country}
                                      </p>
                                      <p className="mt-1">Postcode: {order?.delivery_address?.postcode}</p>
                                    </div>
                                  </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                        </React.Fragment>
                      ))}
                  </tbody>
                </table>
                </div>
              </div>
              </div>

            {/* Pagination */}
            {orders?.totalPages > 1 && (
              <div className="flex items-center justify-center mt-10 pb-6">
                  <Pagination
                  showFirstButton 
                  showLastButton
                    count={orders?.totalPages}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                  />
                </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Orders;
