import React, { useState, useEffect, useContext } from 'react';
import { Button } from "@mui/material";
import { FaAngleDown, FaAngleUp, FaCopy } from "react-icons/fa6";
import Badge from "../../Components/Badge";
import SearchBox from '../../Components/SearchBox';
import OrderStatusDropdown from '../../Components/OrderStatusDropdown';
import { deleteData, editData, fetchDataFromApi } from '../../utils/api';
import Pagination from "@mui/material/Pagination";
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { MyContext } from "../../App.jsx";

// Import currency utility for Bangladesh Taka
const formatCurrencyBD = (amount) => {
  if (!amount && amount !== 0) return 'Tk 0';
  return `Tk ${amount?.toLocaleString('en-BD')}`;
};

export const Orders = () => {

  const [isOpenOrderdProduct, setIsOpenOrderdProduct] = useState(null);
  const [orderStatus, setOrderStatus] = useState('');

  const [ordersData, setOrdersData] = useState([]);
  const [orders, setOrders] = useState([]);
  const [pageOrder, setPageOrder] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalOrdersData, setTotalOrdersData] = useState([]);

  const context = useContext(MyContext);


  /**
   * Toggle the visibility of ordered products for a specific order
   * @param {number} index - The index of the order to toggle
   */
  const isShowOrderdProduct = (index) => {
    if (isOpenOrderdProduct === index) {
      setIsOpenOrderdProduct(null);
    } else {
      setIsOpenOrderdProduct(index);
    }
  };

  /**
   * Copy order ID to clipboard for easy sharing/reference
   * @param {string} orderId - The order ID to copy
   */
  const copyOrderId = async (orderId) => {
    try {
      await navigator.clipboard.writeText(orderId);
      context.alertBox("success", "Order ID copied to clipboard");
    } catch (err) {
      console.error('Failed to copy order ID:', err);
      context.alertBox("error", "Failed to copy Order ID");
    }
  };

  /**
   * Handle order status update callback
   * @param {string} newStatus - The new status that was set
   * @param {Object} response - The API response
   */
  const handleOrderStatusUpdate = async (newStatus, response) => {
    console.log('Order status updated:', { newStatus, response });
    // Additional logic can be added here if needed
  };

  /**
   * Refresh orders data after status update
   */
  const refreshOrdersData = async () => {
    try {
      const isBrandOwner = context?.userData?.role === 'BRAND_OWNER';
      const listUrl = isBrandOwner ? `/api/order/brand-orders?page=${pageOrder}&limit=5` : `/api/order/order-list?page=${pageOrder}&limit=5`;
      
      const refreshRes = await fetchDataFromApi(listUrl);
      if (refreshRes?.error === false) {
        setOrdersData(refreshRes?.data);
        // Keep the latest order expanded after refresh
        if (refreshRes?.data && refreshRes?.data.length > 0) {
          setIsOpenOrderdProduct(0);
        }
      }
    } catch (error) {
      console.error('Error refreshing orders:', error);
    }
  };






  useEffect(() => {
    // Only proceed if user data is loaded
    if (!context?.userData?.role) {
      return;
    }

    context?.setProgress(50);
    const isBrandOwner = context?.userData?.role === 'BRAND_OWNER';
    const listUrl = isBrandOwner ? `/api/order/brand-orders?page=${pageOrder}&limit=5` : `/api/order/order-list?page=${pageOrder}&limit=5`;
    
    console.log('🔍 Fetching orders with role:', context?.userData?.role, 'URL:', listUrl);
    
    fetchDataFromApi(listUrl).then((res) => {
      if (res?.error === false) {
        setOrdersData(res?.data)
        
        // Auto-expand the latest order (first order in the list)
        if (res?.data && res?.data.length > 0) {
          setIsOpenOrderdProduct(0); // Set the first order (latest) as expanded
        }
        
        context?.setProgress(100);
      } else {
        console.error('Failed to fetch orders:', res?.message);
        context.alertBox('error', res?.message || 'Failed to fetch orders');
        context?.setProgress(100);
      }
    }).catch((error) => {
      console.error('Order fetch error:', error);
      context.alertBox('error', 'Failed to load orders');
      context?.setProgress(100);
    });
    
    const totalUrl = isBrandOwner ? `/api/order/brand-orders` : `/api/order/order-list`;
    fetchDataFromApi(totalUrl).then((res) => {
      if (res?.error === false) {
        setTotalOrdersData(res)
      } else {
        console.error('Failed to fetch total orders:', res?.message);
      }
    }).catch((error) => {
      console.error('Total orders fetch error:', error);
    });
  }, [orderStatus, pageOrder, context?.userData?.role])


  useEffect(() => {

    // Filter orders based on search query
    if (searchQuery !== "") {
      const filteredOrders = totalOrdersData?.data?.filter((order) =>
        order._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order?.userId?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order?.userId?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order?.createdAt.includes(searchQuery)
      );
      setOrdersData(filteredOrders)
    } else {
      // Only make API call if user data is loaded and we have existing orders data
      // The main useEffect will handle initial loading
      if (context?.userData?.role && totalOrdersData?.data) {
        setOrdersData(totalOrdersData.data)
      }
    }

  }, [searchQuery, totalOrdersData])


    const deleteOrder = (id) => {
          if (context?.userData?.role === "ADMIN") {
              deleteData(`/api/order/deleteOrder/${id}`).then((res) => {
                // Refresh orders list after deletion
                const isBrandOwner = context?.userData?.role === 'BRAND_OWNER';
                const listUrl = isBrandOwner ? `/api/order/brand-orders?page=${pageOrder}&limit=5` : `/api/order/order-list?page=${pageOrder}&limit=5`;
                fetchDataFromApi(listUrl).then((res) => {
                  if (res?.error === false) {
                    setOrdersData(res?.data)
                    context?.setProgress(100);
                    context.alertBox("success", "Order Delete successfully!");
                  }
                })

                const totalUrl = isBrandOwner ? `/api/order/brand-orders` : `/api/order/order-list`;
                fetchDataFromApi(totalUrl).then((res) => {
                  if (res?.error === false) {
                    setTotalOrdersData(res)
                  }
                })
                
              })
          } else {
              context.alertBox("error", "Only admin can delete data");
          }
      }
  

  return (
    <div className="bg-white border border-gray-200">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-[20px] font-[600] text-gray-900 mb-2">Orders Management</h2>
            <p className="text-[14px] text-gray-600">
              There are <span className="font-bold text-[#FF2E4D]">{ordersData?.length}</span>{" "}
              orders
            </p>
          </div>
          <div className="w-full lg:w-auto lg:min-w-[300px]">
          <SearchBox
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setPageOrder={setPageOrder}
          />
        </div>
      </div>
      </div>

      <div className="p-6">
        {/* Mobile/Tablet View - Card Layout */}
        <div className="lg:hidden space-y-4">
          {ordersData?.length !== 0 && ordersData?.map((order, index) => (
            <div key={index} className="border border-gray-200 p-4 bg-gray-50 rounded-lg">
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
                        status={product?.status || product?.brandStatus || order?.order_status || 'pending'} 
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
                  <span className="font-bold">
                    {context?.userData?.role === 'BRAND_OWNER' 
                      ? formatCurrencyBD(
                          order?.products?.reduce((total, product) => {
                            return total + (product?.subTotal || (product?.price * product?.quantity));
                          }, 0) + (order?.delivery_address?.city?.toLowerCase().includes('dhaka') ? 80 : 120)
                        )
                      : formatCurrencyBD(order?.totalWithShipping || order?.totalAmt)
                    }
                  </span>
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
                    <p className="text-[12px] text-gray-500">Postcode: {order?.delivery_address?.postcode}</p>
                  </div>
                </div>
                
                {/* Role-specific controls */}
                <div className="flex flex-col gap-2 pt-2 border-t">
                  {context?.userData?.role === 'BRAND_OWNER' && (
                    <div className="flex justify-between items-center">
                      <span className="font-[600] text-gray-700">Order Status:</span>
                      <div className="max-w-[120px]">
                        <OrderStatusDropdown
                          orderId={order?._id}
                          currentStatus={order?.order_status || 'pending'}
                          onStatusUpdate={handleOrderStatusUpdate}
                          onRefresh={refreshOrdersData}
                          size="small"
                          pageOrder={pageOrder}
                        />
                      </div>
                    </div>
                  )}
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
                          <p className="text-[11px] text-gray-500 font-mono">
                            ID: {item?._id}
                          </p>
                          <div className="mt-1">
                            <Badge status={item?.status || item?.brandStatus || order?.order_status || 'pending'} size="small" />
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
                        <div><span className="font-[600] text-gray-900">User ID:</span> <span className="font-mono text-[#FF2E4D]">{order?.userId?._id}</span></div>
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

                    {/* Admin Actions */}
                    {context?.userData?.role === 'ADMIN' && (
                      <div className="bg-white p-3 rounded border">
                        <h5 className="font-[600] text-gray-900 mb-2">Actions</h5>
                        <Button 
                          onClick={() => deleteOrder(order?._id)} 
                          variant="outlined" 
                          color="error" 
                          size="small"
                          className="!text-[12px] !py-1 !px-3"
                        >
                          Delete Order
                        </Button>
                      </div>
                    )}
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
                  {context?.userData?.role === 'BRAND_OWNER' && (
                    <th scope="col" className="px-4 py-3">
                      Order Status
                    </th>
                  )}
                  {context?.userData?.role === 'ADMIN' && (
                    <th scope="col" className="px-4 py-3">
                      Actions
              </th>
                  )}
            </tr>
          </thead>
          <tbody>
                {ordersData?.length !== 0 && ordersData?.map((order, index) => (
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
                              {order?._id?.substring(0, 24)}
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
                        {context?.userData?.role === 'BRAND_OWNER' 
                          ? formatCurrencyBD(
                              order?.products?.reduce((total, product) => {
                                return total + (product?.subTotal || (product?.price * product?.quantity));
                              }, 0) + (order?.delivery_address?.city?.toLowerCase().includes('dhaka') ? 80 : 120)
                            )
                          : formatCurrencyBD(order?.totalWithShipping || order?.totalAmt)
                        }
                      </td>
                      <td className="px-4 py-4 text-[13px]">
                        {order?.createdAt?.split("T")[0]}
                      </td>
                      {context?.userData?.role === 'BRAND_OWNER' && (
                        <td className="px-4 py-4">
                          <OrderStatusDropdown
                            orderId={order?._id}
                            currentStatus={order?.order_status || 'pending'}
                            onStatusUpdate={handleOrderStatusUpdate}
                            onRefresh={refreshOrdersData}
                            size="medium"
                            pageOrder={pageOrder}
                          />
                        </td>
                      )}
                      {context?.userData?.role === 'ADMIN' && (
                        <td className="px-4 py-4">
                          <Button 
                            onClick={() => deleteOrder(order?._id)} 
                            variant="outlined" 
                            color="error" 
                            size="small"
                            className="!text-[12px] !py-1 !px-2"
                          >
                            Delete
                          </Button>
                      </td>
                        )}
                    </tr>

                    {isOpenOrderdProduct === index && (
                      <tr>
                        <td colSpan={context?.userData?.role === 'ADMIN' ? "6" : "7"} className="px-4 py-4 bg-gray-50">
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
                                    <p className="text-[11px] text-gray-500 font-mono">
                                      ID: {item?._id}
                                    </p>
                                    <div className="mt-1">
                                      <Badge status={item?.status || item?.brandStatus || order?.order_status || 'pending'} size="small" />
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
                              <div className="flex justify-end p-2 text-[14px] mb-2">
                                <span className='pr-2 font-[600]'>Subtotal :</span>
                                <span>
                                  {context?.userData?.role === 'BRAND_OWNER' 
                                    ? formatCurrencyBD(
                                        order?.products?.reduce((total, product) => {
                                          return total + (product?.subTotal || (product?.price * product?.quantity));
                                        }, 0)
                                      )
                                    : formatCurrencyBD(order?.totalAmt)
                                  }
                                </span>
                              </div>
                              <div className="flex justify-end p-2 text-[14px] mb-3">
                                <span className='pr-2 font-[600]'>Shipping :</span>
                                <span>
                                  {context?.userData?.role === 'BRAND_OWNER' 
                                    ? formatCurrencyBD(
                                        // Calculate individual brand shipping (80 for Dhaka, 120 for outside)
                                        order?.delivery_address?.city?.toLowerCase().includes('dhaka') ? 80 : 120
                                      )
                                    : formatCurrencyBD(order?.shippingCharge || 0)
                                  }
                                </span>
                              </div>
                              <div className="flex justify-end p-2 font-[700] text-[16px] border-t pt-2">
                                <span className='pr-2 font-[600]'>Total :</span>
                                <span className="text-[#FF2E4D]">
                                  {context?.userData?.role === 'BRAND_OWNER' 
                                    ? formatCurrencyBD(
                                        order?.products?.reduce((total, product) => {
                                          return total + (product?.subTotal || (product?.price * product?.quantity));
                                        }, 0) + (order?.delivery_address?.city?.toLowerCase().includes('dhaka') ? 80 : 120)
                                      )
                                    : formatCurrencyBD(order?.totalWithShipping || order?.totalAmt)
                                  }
                                </span>
                              </div>
                            </div>

                            {/* Customer Information */}
                            <div className="bg-white p-4 rounded border">
                              <h5 className="font-[600] text-gray-900 mb-2">Customer Information</h5>
                              <div className="text-[13px] text-gray-600 space-y-1">
                                <div><span className="font-[600] text-gray-900">Name:</span> {order?.userId?.name}</div>
                                <div><span className="font-[600] text-gray-900">Phone:</span> {order?.delivery_address?.mobile}</div>
                                <div><span className="font-[600] text-gray-900">Email:</span> {order?.userId?.email}</div>
                                <div><span className="font-[600] text-gray-900">User ID:</span> <span className="font-mono text-[#FF2E4D]">{order?.userId?._id}</span></div>
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
        <div className="flex items-center justify-center mt-10 pb-6 px-6">
          <Pagination
            showFirstButton 
            showLastButton
            count={orders?.totalPages}
            page={pageOrder}
            onChange={(e, value) => setPageOrder(value)}
          />
        </div>
      )}
    </div>
  )
}


export default Orders;
