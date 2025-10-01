import React, { useEffect, useRef, useState } from "react";

const OtpBox = ({ length, onChange }) => {
  /**
   * Maintain an array of single-character digits for each OTP box.
   * We also expose better UX: auto-focus, backspace navigation, and paste support.
   */
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const containerRef = useRef(null);

  useEffect(() => {
    // Focus first cell on mount for faster user flow
    const first = document.getElementById(`otp-input-0`);
    if (first) first.focus();
  }, []);

  const handleChange = (element, index) => {
    const value = element.value;
    if (isNaN(value)) return; // Only numbers allowed

    // Update OTP value
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    onChange(newOtp.join(""));

    // Focus on next input
    if (value && index < length - 1) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (event, index) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`).focus();
    }
  };

  const handlePaste = (event) => {
    // Allow users to paste a full code (e.g., "123456")
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    event.preventDefault();
    const chars = pasted.split("");
    const next = new Array(length).fill("");
    for (let i = 0; i < Math.min(length, chars.length); i++) next[i] = chars[i];
    setOtp(next);
    onChange(next.join(""));
    const lastIndex = Math.min(chars.length - 1, length - 1);
    const focusEl = document.getElementById(`otp-input-${lastIndex}`);
    if (focusEl) focusEl.focus();
  };

  return (
    <div
      ref={containerRef}
      onPaste={handlePaste}
      style={{ display: "flex", gap: "8px", justifyContent:'center' }}
      className="otpBox"
      aria-label="Enter the 6 digit verification code"
      role="group"
    >
      {otp.map((data, index) => (
        <input
          key={index}
          id={`otp-input-${index}`}
          type="text"
          maxLength="1"
          value={otp[index]}
          onChange={(e) => handleChange(e.target, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          inputMode="numeric"
          aria-label={`Digit ${index + 1}`}
          className="w-[40px] h-[48px] sm:w-[48px] sm:h-[56px] text-center text-[18px] border border-gray-300 focus:outline-none focus:border-[#FF2E4D] rounded"
        />
      ))}
    </div>
  );
};

export default OtpBox;
