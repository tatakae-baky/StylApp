import React, { useContext, useEffect, useState } from "react";
import OtpBox from "../../components/OtpBox";
import { postData } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import { MyContext } from "../../App";

const Verify = () => {
  /**
   * Handle OTP state for submission
   * We keep the OTP as a flat string (e.g., "123456") that comes from `OtpBox`
   */
  const [otp, setOtp] = useState("");
  const handleOtpChange = (value) => {
    setOtp(value);
  };

  const history = useNavigate();
  const context = useContext(MyContext)

  /**
   * Submit OTP for either account verification or forgot-password flow
   * Determines action by reading `actionType` stored during previous steps
   */
  const verityOTP = (e) => {
    e.preventDefault();

    const actionType = localStorage.getItem("actionType");

    if (actionType !== "forgot-password") {

      postData("/api/user/verifyEmail", {
        email: localStorage.getItem("userEmail"),
        otp: otp
      }).then((res) => {
        if (res?.error === false) {
          context.alertBox("success", res?.message);
          localStorage.removeItem("userEmail")
          history("/login")
        } else {
          context.alertBox("error", res?.message);
        }
      })
    }
    
    else{
      postData("/api/user/verify-forgot-password-otp", {
        email: localStorage.getItem("userEmail"),
        otp: otp
      }).then((res) => {
        if (res?.error === false) {
          context.alertBox("success", res?.message);
          // Store the verified OTP temporarily for password change
          localStorage.setItem("verifiedOtp", otp);
          history("/forgot-password")
        } else {
          context.alertBox("error", res?.message);
        }
      })
    }

  }

  return (
    <section className="py-5 lg:py-10 w-full">
      <div className="container">
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            {/* Main verify card (styled to match Login/Register tone) */}
            <div className="card bg-white lg:border lg:border-gray-400 p-6 lg:p-8">
              {/* Header */}
              <div className="text-center mb-4">
                <img src="/verify3.png" width="64" height="64" alt="Verify" className="mx-auto" />
                <h2 className="text-[24px] font-[600] text-gray-900 mt-3 mb-1">Verify OTP</h2>
                <p className="text-[14px] text-gray-600">
                  We sent a 6‑digit code to
                  <span className="ml-1 font-[700] text-[#FF2E4D]">{localStorage.getItem("userEmail")}</span>
                </p>
              </div>

              {/* OTP Form */}
              <form className="w-full" onSubmit={verityOTP}>
                {/* OTP Inputs */}
                <div className="mb-4">
                  <OtpBox length={6} onChange={handleOtpChange} />
                </div>

                {/* Submit Button (match Login/Register tone) */}
                <div className="mb-2">
                  <button
                    type="submit"
                    disabled={!otp || otp.length !== 6}
                    className="w-full bg-[#FF2E4D] text-white py-3 px-4 text-[16px] font-[600] hover:bg-[#e63852] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Verify OTP
                  </button>
                </div>

                {/* Helper Text */}
                <p className="text-center text-[13px] text-gray-500 mt-3">
                  Didn’t get a code? Check your spam folder or wait a minute and try again.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Verify;
