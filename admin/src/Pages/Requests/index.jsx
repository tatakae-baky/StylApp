import React, { useEffect, useState, useContext } from 'react';
import { fetchDataFromApi, patchData } from '../../utils/api';
import { Button } from '@mui/material';
import { FaAngleDown, FaAngleUp, FaCopy } from "react-icons/fa6";
import { MyContext } from '../../App.jsx';

const RequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpenRequestDetails, setIsOpenRequestDetails] = useState(null);
  const context = useContext(MyContext);

  /**
   * Load brand requests from API
   * Fetches pending requests and updates component state
   */
  const load = async () => {
    try {
      setLoading(true);
      const res = await fetchDataFromApi('/api/brand-requests?status=PENDING');
      if (res?.error === false) {
        setRequests(res.requests || []);
      }
    } catch (error) {
      context.alertBox('error', 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { 
    load(); 
  }, []);

  /**
   * Toggle the visibility of request details for a specific request
   * @param {number} index - The index of the request to toggle
   */
  const toggleRequestDetails = (index) => {
    if (isOpenRequestDetails === index) {
      setIsOpenRequestDetails(null);
    } else {
      setIsOpenRequestDetails(index);
    }
  };

  /**
   * Copy request ID to clipboard for easy sharing/reference
   * @param {string} requestId - The request ID to copy
   */
  const copyRequestId = async (requestId) => {
    try {
      await navigator.clipboard.writeText(requestId);
      context.alertBox("success", "Request ID copied to clipboard");
    } catch (err) {
      console.error('Failed to copy request ID:', err);
      context.alertBox("error", "Failed to copy Request ID");
    }
  };

  /**
   * Approve a brand request
   * @param {string} id - Request ID to approve
   */
  const approve = async (id) => {
    try {
      const res = await patchData(`/api/brand-requests/${id}/approve`, {});
      if (res?.success) { 
        context.alertBox('success', 'Brand request approved successfully!'); 
        load(); 
      } else {
        context.alertBox('error', res?.message || 'Failed to approve request');
      }
    } catch (error) {
      context.alertBox('error', 'Failed to approve request');
    }
  }

  /**
   * Reject a brand request
   * @param {string} id - Request ID to reject
   */
  const reject = async (id) => {
    try {
      const res = await patchData(`/api/brand-requests/${id}/reject`, {});
      if (res?.success) { 
        context.alertBox('success', 'Brand request rejected'); 
        load(); 
      } else {
        context.alertBox('error', res?.message || 'Failed to reject request');
      }
    } catch (error) {
      context.alertBox('error', 'Failed to reject request');
    }
  }

  if (loading) {
    return (
      <div className="bg-white border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-[20px] font-[600] text-gray-900 mb-2">Brand Partner Requests</h2>
          <p className="text-[14px] text-gray-600">Loading requests...</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-[20px] font-[600] text-gray-900 mb-2">Brand Partner Requests</h2>
            <p className="text-[14px] text-gray-600">
              There are <span className="font-bold text-[#FF2E4D]">{requests?.length}</span>{" "}
              pending requests
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Mobile/Tablet View - Card Layout */}
        <div className="lg:hidden space-y-4">
          {requests?.length !== 0 && requests?.map((req, index) => (
            <div key={index} className="border border-gray-200 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <button
                    className="w-8 h-8 rounded-full bg-[#f1f1f1] flex items-center justify-center hover:bg-gray-200 transition-colors"
                    onClick={() => toggleRequestDetails(index)}
                  >
                    {isOpenRequestDetails === index ? 
                      <FaAngleUp className="text-[14px] text-gray-600" /> : 
                      <FaAngleDown className="text-[14px] text-gray-600" />
                    }
                  </button>
                  <span className="text-[12px] px-2 py-1 bg-orange-100 text-orange-800 rounded-md font-[500]">
                    PENDING
                  </span>
                </div>
                <span className="text-[12px] text-gray-500">
                  {req?.createdAt?.split("T")[0]}
                </span>
              </div>

              <div className="space-y-2 text-[14px]">
                <div className="flex justify-between items-start">
                  <span className="font-[600] text-gray-700">Request ID:</span>
                  <div className="text-right">
                    <div className="text-[#FF2E4D] font-mono text-[11px] break-all max-w-[150px]">
                      {req?._id}
                    </div>
                    <button
                      onClick={() => copyRequestId(req?._id)}
                      className="text-[10px] text-gray-500 hover:text-[#FF2E4D] transition-colors mt-1 flex items-center gap-1"
                      title="Copy Request ID"
                    >
                      <FaCopy className="text-[8px]" />
                      Copy ID
                    </button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="font-[600] text-gray-700">Brand Name:</span>
                  <span className="text-[13px] font-[600]">{req?.brandName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-[600] text-gray-700">Owner:</span>
                  <span className="text-[13px]">{req?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-[600] text-gray-700">Email:</span>
                  <span className="text-[13px]">{req?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-[600] text-gray-700">Phone:</span>
                  <span className="text-[13px]">{req?.phone}</span>
                </div>
                
                {/* Action buttons */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => approve(req._id)}
                    size="small"
                    className="!text-[12px] !py-1 !px-3 flex-1"
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => reject(req._id)}
                    size="small"
                    className="!text-[12px] !py-1 !px-3 flex-1"
                  >
                    Reject
                  </Button>
                </div>
              </div>

              {/* Expandable Request Details */}
              {isOpenRequestDetails === index && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-[600] text-gray-900 mb-3">Request Details</h4>
                  <div className="space-y-3">
                    {/* Brand Logo */}
                    {req?.brandImage && (
                      <div className="bg-white p-3 rounded border">
                        <h5 className="font-[600] text-gray-900 mb-2">Brand Logo</h5>
                        <img
                          src={req?.brandImage}
                          className="w-20 h-20 object-cover rounded border"
                          alt={`${req?.brandName} logo`}
                        />
                      </div>
                    )}
                    
                    {/* Brand Description */}
                    <div className="bg-white p-3 rounded border">
                      <h5 className="font-[600] text-gray-900 mb-2">Brand Description</h5>
                      <p className="text-[13px] text-gray-700 leading-relaxed">
                        {req?.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop View - Table Layout */}
        <div className="hidden lg:block">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 w-12">
                    &nbsp;
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Request ID
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Brand Name
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Owner Name
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Contact
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Date
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {requests?.length !== 0 && requests?.map((req, index) => (
                  <React.Fragment key={index}>
                    <tr className="bg-white border-b hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <button
                          className="w-8 h-8 rounded-full bg-[#f1f1f1] flex items-center justify-center hover:bg-gray-200 transition-colors"
                          onClick={() => toggleRequestDetails(index)}
                        >
                          {isOpenRequestDetails === index ? 
                            <FaAngleUp className="text-[14px] text-gray-600" /> : 
                            <FaAngleDown className="text-[14px] text-gray-600" />
                          }
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <div className="group relative">
                          <div className="flex items-center gap-2">
                            <span className="text-[#FF2E4D] font-mono text-[12px] cursor-pointer hover:text-[#e63852] transition-colors">
                              {req?._id?.substring(0, 24)}
                            </span>
                            <button
                              onClick={() => copyRequestId(req?._id)}
                              className="text-gray-400 hover:text-[#FF2E4D] transition-colors p-1"
                              title="Copy Request ID"
                            >
                              <FaCopy className="text-[10px]" />
                            </button>
                          </div>
                          {/* Full Request ID Tooltip */}
                          <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-[11px] font-mono rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                            {req?._id}
                            <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {req?.brandImage && (
                            <img
                              src={req?.brandImage}
                              className="w-8 h-8 object-cover rounded border"
                              alt={`${req?.brandName} logo`}
                            />
                          )}
                          <span className="font-[600] text-[13px]">{req?.brandName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-[13px]">{req?.name}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-[13px]">
                          <div>{req?.email}</div>
                          <div className="text-gray-500">{req?.phone}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[13px]">
                        {req?.createdAt?.split("T")[0]}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => approve(req._id)} 
                            variant="contained" 
                            color="success" 
                            size="small"
                            className="!text-[12px] !py-1 !px-2"
                          >
                            Approve
                          </Button>
                          <Button 
                            onClick={() => reject(req._id)} 
                            variant="outlined" 
                            color="error" 
                            size="small"
                            className="!text-[12px] !py-1 !px-2"
                          >
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>

                    {isOpenRequestDetails === index && (
                      <tr>
                        <td colSpan="7" className="px-4 py-4 bg-gray-50">
                          <div className="space-y-4">
                            <h4 className="font-[600] text-gray-900 mb-3">Request Details</h4>
                            
                            {/* Brand Description */}
                            <div className="bg-white p-4 rounded border">
                              <h5 className="font-[600] text-gray-900 mb-2">Brand Description</h5>
                              <p className="text-[13px] text-gray-700 leading-relaxed">
                                {req?.description}
                              </p>
                            </div>

                            {/* Brand Logo (if available) */}
                            {req?.brandImage && (
                              <div className="bg-white p-4 rounded border">
                                <h5 className="font-[600] text-gray-900 mb-2">Brand Logo</h5>
                                <img
                                  src={req?.brandImage}
                                  className="w-24 h-24 object-cover rounded border"
                                  alt={`${req?.brandName} logo`}
                                />
                              </div>
                            )}

                            {/* Contact Information */}
                            <div className="bg-white p-4 rounded border">
                              <h5 className="font-[600] text-gray-900 mb-2">Contact Information</h5>
                              <div className="text-[13px] text-gray-600 space-y-1">
                                <div><span className="font-[600] text-gray-900">Owner:</span> {req?.name}</div>
                                <div><span className="font-[600] text-gray-900">Email:</span> {req?.email}</div>
                                <div><span className="font-[600] text-gray-900">Phone:</span> {req?.phone}</div>
                                <div><span className="font-[600] text-gray-900">Request ID:</span> <span className="font-mono text-[#FF2E4D]">{req?._id}</span></div>
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

        {/* Empty State */}
        {requests?.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-[18px] font-[600] text-gray-600 mb-2">No Pending Requests</h3>
            <p className="text-[14px] text-gray-500 max-w-md mx-auto">
              There are currently no brand partnership requests awaiting review. 
              New requests will appear here when submitted.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RequestsPage;
