import React, { useContext, useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { IoMdEye } from "react-icons/io";
import { IoMdEyeOff } from "react-icons/io";
import { Link, useNavigate, useParams } from "react-router-dom";
import { MyContext } from "../../App";
import CircularProgress from '@mui/material/CircularProgress';
import { postData } from "../../utils/api";

/**
 * ForgotPassword component - Password reset page with modern design
 * Matches the design theme used across the application
 */
const ForgotPassword = () => {
  const [isPasswordShow, setIsPasswordShow] = useState(false);
  const [isPasswordShow2, setIsPasswordShow2] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formFields, setFormsFields] = useState({
    email: localStorage.getItem("userEmail"),
    newPassword: '',
    confirmPassword: '',
    otp: localStorage.getItem("verifiedOtp")
  });

  const context = useContext(MyContext);
  const history = useNavigate();

  /**
   * Handle input field changes
   * @param {Event} e - Input change event
   */
  const onChangeInput = (e) => {
    const { name, value } = e.target;
    setFormsFields(() => {
      return {
        ...formFields,
        [name]: value
      }
    })
  }

  // Check if all form fields have values
  const valideValue = Object.values(formFields).every(el => el)

  /**
   * Handle form submission for password reset
   * @param {Event} e - Form submit event
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    setIsLoading(true);

    if (formFields.newPassword === "") {
      context.alertBox("error", "Please enter new password");
      setIsLoading(false);
      return false
    }

    if (formFields.confirmPassword === "") {
      context.alertBox("error", "Please enter confirm password");
      setIsLoading(false);
      return false
    }

    if (formFields.confirmPassword !== formFields.newPassword) {
      context.alertBox("error", "Password and confirm password not match");
      setIsLoading(false);
      return false
    }

    postData(`/api/user/forgot-password/change-password`, formFields).then((res) => {
      console.log(res)
      if (res?.error === false) {
        localStorage.removeItem("userEmail")
        localStorage.removeItem("actionType")
        localStorage.removeItem("verifiedOtp")
        context.alertBox("success", res?.message);
        setIsLoading(false);
        history("/login")
      }
      else {
        context.alertBox("error", res?.message);
      }
    })
  }

  return (
    <section className="py-5 lg:py-10 w-full">
      <div className="container">
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            {/* Main password reset card */}
            <div className="card bg-white lg:border lg:border-gray-400 p-6 lg:p-8">
              {/* Header */}
              <div className="text-center mb-4">
                <h2 className="text-[24px] font-[600] text-gray-900 mb-2">
                  Reset Your Password
                </h2>
                <p className="text-[14px] text-gray-600">
                  Create a new secure password
                </p>
              </div>

              {/* Password reset form */}
              <form className="w-full" onSubmit={handleSubmit}>
                {/* New Password Field */}
                <div className="mb-4">
                  <label className="block text-[14px] font-[600] text-gray-700 mb-2">
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={isPasswordShow ? 'text' : 'password'}
                      id="newPassword"
                      name="newPassword"
                      value={formFields.newPassword}
                      disabled={isLoading}
                      onChange={onChangeInput}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 focus:outline-none focus:border-[#FF2E4D] transition-colors duration-200"
                      placeholder="Enter your new password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                      onClick={() => setIsPasswordShow(!isPasswordShow)}
                    >
                      {isPasswordShow ? (
                        <IoMdEyeOff className="text-[20px]" />
                      ) : (
                        <IoMdEye className="text-[20px]" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="mb-4">
                  <label className="block text-[14px] font-[600] text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={isPasswordShow2 ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formFields.confirmPassword}
                      disabled={isLoading}
                      onChange={onChangeInput}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 focus:outline-none focus:border-[#FF2E4D] transition-colors duration-200"
                      placeholder="Confirm your new password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                      onClick={() => setIsPasswordShow2(!isPasswordShow2)}
                    >
                      {isPasswordShow2 ? (
                        <IoMdEyeOff className="text-[20px]" />
                      ) : (
                        <IoMdEye className="text-[20px]" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Reset Password Button */}
                <div className="mb-4">
                  <button
                    type="submit"
                    disabled={!valideValue || isLoading}
                    className="w-full bg-[#FF2E4D] text-white py-3 px-4 text-[16px] font-[600] hover:bg-[#e63852] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <CircularProgress size={20} sx={{ color: 'white' }} />
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                </div>

                {/* Back to Login Link */}
                <div className="text-center">
                  <p className="text-[14px] text-gray-600">
                    Remember your password?{' '}
                    <Link 
                      to="/login" 
                      className="text-[#FF2E4D] font-[600] hover:underline transition-all duration-200"
                    >
                      Sign In
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;
