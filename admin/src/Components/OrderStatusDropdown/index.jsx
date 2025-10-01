import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../../App.jsx';
import { editData, fetchDataFromApi } from '../../utils/api';

/**
 * Reusable Order Status Dropdown Component
 * 
 * Features:
 * - Custom styled dropdown with status-based colors
 * - Loading states with spinner animation
 * - Automatic data refresh after status update
 * - Click outside to close functionality
 * - Configurable size variants (small, medium, large)
 * - Flexible permission handling (role checks should be done at usage level)
 * 
 * @param {Object} props - Component props
 * @param {string} props.orderId - The order ID to update
 * @param {string} props.currentStatus - Current order status
 * @param {Function} props.onStatusUpdate - Callback function called after successful status update
 * @param {string} props.size - Size variant: 'small', 'medium', 'large' (default: 'medium')
 * @param {boolean} props.disabled - Whether the dropdown is disabled
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.pageOrder - Current page number for data refresh (optional)
 * @param {Function} props.onRefresh - Custom refresh function (optional)
 * 
 * @example
 * // For brand owners only
 * {context?.userData?.role === 'BRAND_OWNER' && (
 *   <OrderStatusDropdown
 *     orderId={order._id}
 *     currentStatus={order.order_status}
 *     onStatusUpdate={handleUpdate}
 *   />
 * )}
 * 
 * @example
 * // For both admin and brand owners
 * {(context?.userData?.role === 'ADMIN' || context?.userData?.role === 'BRAND_OWNER') && (
 *   <OrderStatusDropdown
 *     orderId={order._id}
 *     currentStatus={order.order_status}
 *     onStatusUpdate={handleUpdate}
 *   />
 * )}
 */
export const OrderStatusDropdown = ({
  orderId,
  currentStatus,
  onStatusUpdate,
  size = 'medium',
  disabled = false,
  className = '',
  pageOrder = 1,
  onRefresh
}) => {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const context = useContext(MyContext);

  /**
   * Get size-specific classes for the dropdown button
   * @param {string} size - The size variant
   * @returns {Object} - Object containing size-specific classes
   */
  const getSizeClasses = (size) => {
    const sizeMap = {
      small: {
        button: 'px-2 py-1 text-xs min-w-[80px]',
        icon: 'w-3 h-3',
        dropdown: 'text-xs'
      },
      medium: {
        button: 'px-3 py-1.5 text-sm min-w-[100px]',
        icon: 'w-4 h-4',
        dropdown: 'text-sm'
      },
      large: {
        button: 'px-4 py-2 text-base min-w-[120px]',
        icon: 'w-5 h-5',
        dropdown: 'text-base'
      }
    };
    return sizeMap[size] || sizeMap.medium;
  };

  /**
   * Get status-specific styling classes
   * @param {string} status - The order status
   * @returns {string} - CSS classes for the status
   */
  const getStatusClasses = (status) => {
    const statusMap = {
      pending: 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500',
      confirmed: 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500',
      shipped: 'bg-purple-500 hover:bg-purple-600 focus:ring-purple-500',
      delivered: 'bg-green-700 hover:bg-green-800 focus:ring-green-700',
      cancelled: 'bg-red-500 hover:bg-red-600 focus:ring-red-500'
    };
    return statusMap[status] || 'bg-gray-500 hover:bg-gray-600 focus:ring-gray-500';
  };

  /**
   * Toggle dropdown visibility
   */
  const toggleDropdown = () => {
    if (disabled || isUpdatingStatus) return;
    setOpenDropdown(!openDropdown);
  };

  /**
   * Close dropdown
   */
  const closeDropdown = () => {
    setOpenDropdown(false);
  };

  /**
   * Handle status change
   * @param {string} newStatus - The new status to set
   */
  const handleStatusChange = async (newStatus) => {
    // Prevent multiple rapid clicks
    if (isUpdatingStatus || disabled) {
      return;
    }

    console.log('🔍 Updating order status:', { orderId, newStatus });

    setIsUpdatingStatus(true);
    closeDropdown();

    const updateData = {
      order_status: newStatus
    };

    try {
      const res = await editData(`/api/order/order-status/${orderId}`, updateData);
      console.log('🔍 Update response:', res);

      if (res?.error === false && res?.success === true) {
        context.alertBox("success", res?.message);
        
        // Call custom refresh function if provided
        if (onRefresh && typeof onRefresh === 'function') {
          await onRefresh();
        } else {
          // Default refresh behavior
          await refreshOrdersData();
        }

        // Call the callback function if provided
        if (onStatusUpdate && typeof onStatusUpdate === 'function') {
          onStatusUpdate(newStatus, res);
        }
      } else {
        console.error('🚨 Update failed:', res);
        context.alertBox("error", res?.message || "Failed to update status");
      }
    } catch (error) {
      console.error('🚨 API call error:', error);
      context.alertBox("error", "Failed to update status. Please try again.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  /**
   * Default refresh function for orders data
   */
  const refreshOrdersData = async () => {
    try {
      const isBrandOwner = context?.userData?.role === 'BRAND_OWNER';
      const listUrl = isBrandOwner 
        ? `/api/order/brand-orders?page=${pageOrder}&limit=5` 
        : `/api/order/order-list?page=${pageOrder}&limit=5`;
      
      const refreshRes = await fetchDataFromApi(listUrl);
      if (refreshRes?.error === false) {
        // The parent component should handle updating the orders data
        console.log('Orders data refreshed successfully');
      }
    } catch (error) {
      console.error('Error refreshing orders:', error);
    }
  };

  /**
   * Close dropdown when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.order-status-dropdown')) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const sizeClasses = getSizeClasses(size);
  const statusClasses = getStatusClasses(currentStatus);

  return (
    <div className={`relative order-status-dropdown ${className}`}>
      <button
        onClick={toggleDropdown}
        disabled={disabled || isUpdatingStatus}
        className={`
          w-full rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 
          cursor-pointer transition-all duration-200 flex items-center justify-between
          ${sizeClasses.button}
          ${disabled || isUpdatingStatus ? 'opacity-50 cursor-not-allowed' : ''}
          ${statusClasses}
        `}
      >
        <span className="capitalize">
          {isUpdatingStatus ? 'Updating...' : (currentStatus || 'pending')}
        </span>
        
        {isUpdatingStatus ? (
          <svg className={`${sizeClasses.icon} animate-spin`} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg 
            className={`${sizeClasses.icon} transition-transform duration-200 ${openDropdown ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>
      
      {openDropdown && !isUpdatingStatus && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50">
          <div className="py-1">
            {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={isUpdatingStatus}
                className={`
                  w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors capitalize
                  ${sizeClasses.dropdown}
                  ${currentStatus === status ? 'bg-gray-100 font-medium' : ''}
                  ${isUpdatingStatus ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderStatusDropdown;
