import React, { useState, useContext } from 'react';
import { CircularProgress } from '@mui/material';
import { postData, deleteImages } from '../../utils/api';
import { MyContext } from '../../App.jsx';
import UploadBox from '../../Components/UploadBox';
import { IoMdClose } from "react-icons/io";

const BrandPartnerRequest = () => {
  const [form, setForm] = useState({ name: '', email: '', brandName: '', description: '', phone: '' });
  const [previews, setPreviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const context = useContext(MyContext);
  
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const setPreviewsFun = (images) => {
    console.log('Setting previews:', images); // Debug log
    if (images && Array.isArray(images)) {
      setPreviews(images);
    } else {
      console.error('Invalid images data received:', images);
    }
  };

  const removeImg = (image, index) => {
    const imageArr = [...previews];
    const encodedImageUrl = encodeURIComponent(image);
    deleteImages(`/api/brand-request/deleteImage?img=${encodedImageUrl}`).then((res) => {
      if (res?.success) {
        imageArr.splice(index, 1);
        setPreviews([]);
        setTimeout(() => {
          setPreviews(imageArr);
        }, 100);
      } else {
        context.alertBox('error', 'Failed to remove image');
      }
    }).catch((error) => {
      console.error('Error removing image:', error);
      context.alertBox('error', 'Failed to remove image');
    });
  };

  const submit = (e) => {
    e.preventDefault();
    const allFieldsFilled = Object.values(form).every(Boolean);
    if (!allFieldsFilled) {
      return context.alertBox('error', 'All fields are required');
    }
    
    if (previews.length === 0) {
      return context.alertBox('error', 'Please upload a brand logo');
    }

    console.log('Submitting with previews:', previews); // Debug log

    setIsLoading(true);
    const formData = {
      ...form,
      brandImage: previews[0] // Include the uploaded image URL
    };
    
    postData('/api/brand-request', formData).then((res) => {
      setIsLoading(false);
      console.log('Submit response:', res); // Debug log
      if (res?.success) {
        context.alertBox('success', 'Request submitted successfully');
        // Reset form
        setForm({ name: '', email: '', brandName: '', description: '', phone: '' });
        setPreviews([]);
      } else {
        context.alertBox('error', res?.message || 'Failed to submit request');
      }
    }).catch((error) => {
      setIsLoading(false);
      console.error('Submit error:', error); // Debug log
      context.alertBox('error', 'Failed to submit request');
    });
  };

  return (
    <div className="bg-white border border-gray-200 h-full">
      <form className='p-6 h-full' onSubmit={submit}>
        <div className='p-2'>
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-[24px] font-[700] text-gray-900 mb-2">Brand Partner Request</h1>
            <p className="text-[14px] text-gray-600">
              Join our platform as a brand partner and showcase your products to a wider audience.
            </p>
          </div>

          {/* Basic Information */}
          <div className="mb-6">
            <h3 className="text-[16px] font-[600] text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-[14px] font-[500] mb-1 text-gray-900">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  className="w-full h-[40px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-md p-3 text-sm" 
                  name="name" 
                  value={form.name} 
                  onChange={onChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-[14px] font-[500] mb-1 text-gray-900">
                  Brand Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  className="w-full h-[40px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-md p-3 text-sm" 
                  name="brandName" 
                  value={form.brandName} 
                  onChange={onChange}
                  placeholder="Enter your brand name"
                  required
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-6">
            <h3 className="text-[16px] font-[600] text-gray-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-[14px] font-[500] mb-1 text-gray-900">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input 
                  type="email"
                  className="w-full h-[40px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-md p-3 text-sm" 
                  name="email" 
                  value={form.email} 
                  onChange={onChange}
                  placeholder="Enter your email address"
                  required
                />
              </div>
              
              <div>
                <label className="block text-[14px] font-[500] mb-1 text-gray-900">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input 
                  type="tel"
                  className="w-full h-[40px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-md p-3 text-sm" 
                  name="phone" 
                  value={form.phone} 
                  onChange={onChange}
                  placeholder="Enter your phone number"
                  required
                />
              </div>
            </div>
          </div>

          {/* Brand Description */}
          <div className="mb-6">
            <label className="block text-[14px] font-[500] mb-1 text-gray-900">
              Brand Description <span className="text-red-500">*</span>
            </label>
            <textarea 
              className="w-full h-[120px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-md p-3 text-sm resize-none" 
              name="description" 
              value={form.description} 
              onChange={onChange}
              placeholder="Tell the audience what your brand is all about"
              rows={4}
              required
            />
          </div>

          {/* Brand Logo Upload */}
          <div className="mb-6">
            <h3 className="text-[16px] font-[600] text-gray-900 mb-4">Brand Assets</h3>
            <div className="mb-3">
              <label className="block text-[14px] font-[500] mb-1 text-gray-900">
                Brand Logo <span className="text-red-500">*</span>
              </label>
              <p className="text-[12px] text-gray-500 mb-4">
                Upload your brand logo. Recommended size: 200x200px or larger. Supported formats: JPG, PNG, WebP.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {previews?.length !== 0 && previews?.map((image, index) => (
                <div className="relative group" key={index}>
                  <span 
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 flex items-center justify-center z-10 cursor-pointer hover:bg-red-700 transition-colors shadow-lg"
                    onClick={() => removeImg(image, index)}
                    title="Remove image"
                  >
                    <IoMdClose className="text-white text-sm" />
                  </span>
                  <div className="w-full aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <img 
                      src={image} 
                      alt={`Brand Logo ${index + 1}`}
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                </div>
              ))}
              <div className="w-full aspect-square">
                <UploadBox 
                  multiple={false} 
                  name="images" 
                  url="/api/brand-request/uploadImages" 
                  setPreviewsFun={setPreviewsFun}
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex justify-start">
            <button 
              type="submit" 
              className="bg-black text-white py-3 px-8 text-[16px] font-[600] hover:bg-gray-800 transition-all duration-200 flex items-center justify-center gap-2 rounded-md"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <CircularProgress size={20} sx={{ color: 'white' }} />
                  <span>Submitting Request...</span>
                </>
              ) : (
                <>
                  <span>Submit Partnership Request</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default BrandPartnerRequest;

