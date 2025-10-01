import React, { useState, PureComponent, useContext, useEffect } from "react";
import DashboardBoxes from "../../Components/DashboardBoxes";
import { FaPlus } from "react-icons/fa6";
import { Button, Pagination } from "@mui/material";
import { FaAngleDown, FaCopy } from "react-icons/fa6";
import Badge from "../../Components/Badge";
import { FaAngleUp } from "react-icons/fa6";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { MyContext } from '../../App';
import SearchBox from "../../Components/SearchBox";
import { fetchDataFromApi } from "../../utils/api";
import Products from "../Products";

// Import currency utility for Bangladesh Taka
const formatCurrencyBD = (amount) => {
  if (!amount && amount !== 0) return 'Tk 0';
  return `Tk ${amount?.toLocaleString('en-BD')}`;
};


const Dashboard = () => {
  const [isOpenOrderdProduct, setIsOpenOrderdProduct] = useState(null);

  const [productCat, setProductCat] = React.useState('');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(50);

  const [chartData, setChartData] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());

  const [productData, setProductData] = useState([]);
  const [productTotalData, setProductTotalData] = useState([]);

  const [ordersData, setOrdersData] = useState([]);
  const [orders, setOrders] = useState([]);
  const [pageOrder, setPageOrder] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [orderSearchQuery, setOrderSearchQuery] = useState("");

  const [totalOrdersData, setTotalOrdersData] = useState([]);

  const [users, setUsers] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [ordersCount, setOrdersCount] = useState(null);

  const context = useContext(MyContext);


  useEffect(() => {
      context?.setProgress(30);
      // Wait for userData so BRAND_OWNER doesn't flash global data
      const role = context?.userData?.role;
      const brandId = context?.userData?.brandId;
      
      console.log('Dashboard useEffect triggered:', { role, brandId });
      
      // Don't run until we have user data
      if (!role) {
        console.log('Skipping: No role available yet');
        return;
      }
      
      if (role === 'BRAND_OWNER' && !brandId) {
        console.log('Skipping: Brand owner without brandId');
        return;
      }
      
      console.log('Calling getProducts with:', { page, rowsPerPage, role, brandId });
      getProducts(page, rowsPerPage, role, brandId);
    }, [context?.userData?.role, context?.userData?.brandId, page, rowsPerPage])


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


  useEffect(() => {
    const role = context?.userData?.role;
    const brandId = context?.userData?.brandId;
    if (!role) return;

    if (role === 'BRAND_OWNER') {
      // Brand owner: use scoped brand orders
      fetchDataFromApi(`/api/order/brand-orders?page=${pageOrder}&limit=5`).then((res) => {
        if (res?.error === false) {
          setOrdersData(res?.data || [])
        }
      })
      // For totals and search, keep a larger cached list
      fetchDataFromApi(`/api/order/brand-orders?page=1&limit=200`).then((res) => {
        if (res?.error === false) {
          setTotalOrdersData({ data: res?.data || [] })
          setOrdersCount(res?.total || 0)
        }
      })
    } else {
      // Admin
      fetchDataFromApi(`/api/order/order-list?page=${pageOrder}&limit=5`).then((res) => {
        if (res?.error === false) {
          setOrdersData(res?.data)
        }
      })
      fetchDataFromApi(`/api/order/order-list`).then((res) => {
        if (res?.error === false) {
          setTotalOrdersData(res)
        }
      })
      fetchDataFromApi(`/api/order/count`).then((res) => {
        if (res?.error === false) {
          setOrdersCount(res?.count)
        }
      })
    }
  }, [pageOrder, context?.userData?.role])


  useEffect(() => {
    const role = context?.userData?.role;
    // Filter orders based on search query
    if (orderSearchQuery !== "") {
      const filteredOrders = totalOrdersData?.data?.filter((order) =>
        order._id?.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
        order?.userId?.name?.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
        order?.userId?.email?.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
        order?.createdAt?.includes(orderSearchQuery)
      );
      setOrdersData(filteredOrders)
    } else {
      if (role === 'BRAND_OWNER') {
        fetchDataFromApi(`/api/order/brand-orders?page=${pageOrder}&limit=5`).then((res) => {
          if (res?.error === false) {
            setOrders(res)
            setOrdersData(res?.data)
          }
        })
      } else {
        fetchDataFromApi(`/api/order/order-list?page=${pageOrder}&limit=5`).then((res) => {
          if (res?.error === false) {
            setOrders(res)
            setOrdersData(res?.data)
          }
        })
      }
    }
  }, [orderSearchQuery, context?.userData])



  useEffect(() => {
    const role = context?.userData?.role;
    if (!role) return;

    // Sales chart only for admin currently
    if (role === 'ADMIN') {
      getTotalSalesByYear();
    }

    // Users/reviews boxes are admin-wide metrics; skip for brand owners
    if (role === 'ADMIN') {
      fetchDataFromApi("/api/user/getAllUsers").then((res) => {
        if (res?.error === false) {
          setUsers(res?.users)
        }
      })

      fetchDataFromApi("/api/user/getAllReviews").then((res) => {
        if (res?.error === false) {
          setAllReviews(res?.reviews)
        }
      })
    }

  }, [context?.userData?.role])



  const getProducts = async (page, limit, role, brandId) => {
         console.log('getProducts called with:', { page, limit, role, brandId });
         
         // Don't fetch anything if role is not available yet
         if (!role) {
           console.log('getProducts: No role, returning');
           return;
         }
         
         const isBrandOwner = role === 'BRAND_OWNER';
         
         if (isBrandOwner && !brandId) {
           console.log('getProducts: Brand owner without brandId, returning');
           return;
         }
         
         const url = isBrandOwner
            ? `/api/brand/${brandId}/products?page=${page + 1}&perPage=${limit}`
            : `/api/product/getAllProducts?page=${page + 1}&limit=${limit}`;
         
         console.log('getProducts: Fetching from URL:', url);
         
         fetchDataFromApi(url).then((res) => {
             console.log('getProducts: Response received:', res);
             setProductData(res)
             setProductTotalData(res)
             context?.setProgress(100);
         }).catch((error) => {
             console.error('Error fetching products:', error);
             context?.setProgress(100);
         })
     }


  const getTotalUsersByYear = () => {
    fetchDataFromApi(`/api/order/users`).then((res) => {
      const users = [];
      res?.TotalUsers?.length !== 0 &&
        res?.TotalUsers?.map((item) => {
          users.push({
            name: item?.name,
            TotalUsers: parseInt(item?.TotalUsers),
          });
        });

      const uniqueArr = users.filter(
        (obj, index, self) =>
          index === self.findIndex((t) => t.name === obj.name)
      );
      setChartData(uniqueArr);
    })
  }

  const getTotalSalesByYear = () => {
    fetchDataFromApi(`/api/order/sales`).then((res) => {
      const sales = [];
      res?.monthlySales?.length !== 0 &&
        res?.monthlySales?.map((item) => {
          sales.push({
            name: item?.name,
            TotalSales: parseInt(item?.TotalSales),
          });
        });

      const uniqueArr = sales.filter(
        (obj, index, self) =>
          index === self.findIndex((t) => t.name === obj.name)
      );
      setChartData(uniqueArr);
    });
  }



  return (
    <>
      <div className="w-full py-4 lg:py-1 px-5 border bg-[#f1faff] border-[rgba(0,0,0,0.1)] flex items-center gap-8 mb-5 justify-between rounded-md">
        <div className="info">
          <h1 className="text-[26px] lg:text-[35px] font-bold leading-8 lg:leading-10 mb-3">
            Welcome,
            <br />
            <span className="text-primary">{context?.userData?.name}</span>
          </h1>
          <p>
            Here’s What happening on your store today. See the statistics at
            once.
          </p>
          <br />
          <Button className="btn-blue btn !capitalize" onClick={() => context.setIsOpenFullScreenPanel({
            open: true,
            model: "Add Product"
          })}>
            <FaPlus /> Add Product
          </Button>
        </div>

        <img src="/shop-illustration.webp" className="w-[250px] hidden lg:block" />
      </div>

      {
        productData?.products?.length !== 0 && users?.length !== 0 && allReviews?.length !== 0 && <DashboardBoxes orders={ordersCount} products={productData?.products?.length} users={users?.length} reviews={allReviews?.length} category={context?.catData?.length} />
      }

      <Products/>

      <div className="bg-white border border-gray-200 my-4">
        {/* Header Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-[20px] font-[600] text-gray-900 mb-2">Recent Orders</h2>
              <p className="text-[14px] text-gray-600">
                Latest <span className="font-bold text-[#FF2E4D]">{ordersData?.length}</span>{" "}
                orders from your store
              </p>
            </div>
            <div className="w-full lg:w-auto lg:min-w-[300px]">
            <SearchBox
              searchQuery={orderSearchQuery}
              setSearchQuery={setOrderSearchQuery}
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
                      <p className="text-[12px] text-gray-500">Postcode: {order?.delivery_address?.pincode}</p>
                    </div>
                  </div>
                  
                  {/* Customer Information */}
                  <div className="flex flex-col gap-2 pt-2 border-t">
                    <div className="flex justify-between">
                      <span className="font-[600] text-gray-700">Customer:</span>
                      <span className="text-[13px]">{order?.userId?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-[600] text-gray-700">Phone:</span>
                      <span className="text-[13px]">{order?.delivery_address?.mobile}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-[600] text-gray-700">Status:</span>
                      <Badge status={order?.order_status} size="small" />
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
                          <p className="mt-1">Postcode: {order?.delivery_address?.pincode}</p>
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
                      Customer
                </th>
                    <th scope="col" className="px-4 py-3">
                      Total
                </th>
                    <th scope="col" className="px-4 py-3">
                      Status
                </th>
                    <th scope="col" className="px-4 py-3">
                  Date
                </th>
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
                        <td className="px-4 py-4">
                          <div>
                            <div className="font-[600] text-[13px]">{order?.userId?.name}</div>
                            <div className="text-[12px] text-gray-500">{order?.delivery_address?.mobile}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-[600]">
                          {formatCurrencyBD(order?.totalWithShipping || order?.totalAmt)}
                        </td>
                        <td className="px-4 py-4">
                          <Badge status={order?.order_status} size="small" />
                        </td>
                        <td className="px-4 py-4 text-[13px]">
                          {order?.createdAt?.split("T")[0]}
                        </td>
                      </tr>

                      {isOpenOrderdProduct === index && (
                        <tr>
                          <td colSpan="7" className="px-4 py-4 bg-gray-50">
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
                                  <span>{formatCurrencyBD(order?.totalAmt)}</span>
                                </div>
                                <div className="flex justify-end p-2 text-[14px] mb-3">
                                  <span className='pr-2 font-[600]'>Shipping :</span>
                                  <span>{formatCurrencyBD(order?.shippingCharge || 0)}</span>
                                </div>
                                <div className="flex justify-end p-2 font-[700] text-[16px] border-t pt-2">
                                  <span className='pr-2 font-[600]'>Total :</span>
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
                                  <p className="mt-1">Postcode: {order?.delivery_address?.pincode}</p>
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


       <div className="card my-4 bg-white">
            <div className="flex items-center justify-between px-5 py-5 pb-0">
              <h2 class="text-[18px] font-[600]">Total Users & Total Sales</h2>
            </div>
    
            <div className="flex items-center gap-5 px-5 py-5 pt-1">
              <span className="flex items-center gap-1 text-[15px] cursor-pointer" onClick={getTotalUsersByYear}>
                <span className="block w-[8px] h-[8px] rounded-full bg-primary "
                ></span>
                Total Users
              </span>
    
              <span className="flex items-center gap-1 text-[15px] cursor-pointer" onClick={getTotalSalesByYear}>
                <span className="block w-[8px] h-[8px] rounded-full bg-green-600  "
                ></span>
                Total Sales
              </span>
            </div>
    
    
            <div className="px-5 overflow-x-scroll">
    
              {chartData?.length !== 0 &&
                <BarChart
                  width={context?.windowWidth > 920 ? (context?.windowWidth - 350) : 800}
                  height={500}
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 5,
                    left: 5,
                    bottom: 5,
                  }}
                >
                  <XAxis
                    dataKey="name"
                    scale="point"
                    padding={{ left: 10, right: 10 }}
                    tick={{ fontSize: 12 }}
                    label={{ position: "insideBottom", fontSize: 14 }}
                    style={{ fill: context?.theme === "dark" ? "white" : "#000" }}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    label={{ position: "insideBottom", fontSize: 14 }}
                    style={{ fill: context?.theme === "dark" ? "white" : "#000" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#071739  ",
                      color: "white",
                    }} // Set tooltip background and text color
                    labelStyle={{ color: "yellow" }} // Label text color
                    itemStyle={{ color: "cyan" }} // Set color for individual items in the tooltip
                    cursor={{ fill: "white" }} // Customize the tooltip cursor background on hover
                  />
                  <Legend />
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    vertical={false}
                  />
                  <Bar dataKey="TotalSales" stackId="a" fill="#16a34a" />
                  <Bar dataKey="TotalUsers" stackId="b" fill="#0858f7" />
    
                </BarChart>
              }
            </div>
          </div>
    </>
  );
};

export default Dashboard;
