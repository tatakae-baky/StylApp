import React, { useState, useMemo } from 'react';
import { FaRegEye, FaEyeSlash } from 'react-icons/fa';
import { Button } from '@mui/material';

const PasswordInput = ({ 
  value, 
  onChange, 
  name = "password", 
  placeholder = "Enter your password",
  disabled = false,
  className = "",
  showStrengthIndicator = true,
  label = "Password"
}) => {
  const [isPasswordShow, setIsPasswordShow] = useState(false);

  // Password strength validation
  const passwordStrength = useMemo(() => {
    if (!value) return { score: 0, requirements: [], status: '' };

    const requirements = [
      {
        regex: /.{8,}/,
        text: "At least 8 characters",
        met: /.{8,}/.test(value)
      },
      {
        regex: /[0-9]/,
        text: "At least 1 number",
        met: /[0-9]/.test(value)
      },
      {
        regex: /[a-z]/,
        text: "At least 1 lowercase letter",
        met: /[a-z]/.test(value)
      },
      {
        regex: /[A-Z]/,
        text: "At least 1 uppercase letter",
        met: /[A-Z]/.test(value)
      }
    ];

    const metRequirements = requirements.filter(req => req.met).length;
    const score = (metRequirements / requirements.length) * 100;

    let status = '';
    let statusColor = '';
    
    if (score === 0) {
      status = '';
      statusColor = '';
    } else if (score < 50) {
      status = 'Weak password';
      statusColor = 'text-red-500';
    } else if (score < 75) {
      status = 'Medium password';
      statusColor = 'text-yellow-500';
    } else if (score < 100) {
      status = 'Good password';
      statusColor = 'text-blue-500';
    } else {
      status = 'Strong password. Must contain:';
      statusColor = 'text-green-500';
    }

    return { score, requirements, status, statusColor };
  }, [value]);

  const getProgressBarColor = () => {
    if (passwordStrength.score < 50) return 'bg-red-500';
    if (passwordStrength.score < 75) return 'bg-yellow-500';
    if (passwordStrength.score < 100) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <div className={`form-group mb-4 w-full ${className}`}>
      <h4 className="text-[14px] font-[500] mb-1">{label}</h4>
      
      <div className="relative w-full">
        <input
          type={isPasswordShow ? 'text' : 'password'}
          className="w-full h-[50px] border-2 border-[rgba(0,0,0,0.1)] rounded-md focus:border-[rgba(0,0,0,0.7)] focus:outline-none px-3 pr-12"
          name={name}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={onChange}
        />
        <Button 
          type="button"
          className="!absolute top-[7px] right-[10px] z-50 !rounded-full !w-[35px] !h-[35px] !min-w-[35px] !text-gray-600" 
          onClick={() => setIsPasswordShow(!isPasswordShow)}
        >
          {isPasswordShow ? (
            <FaEyeSlash className="text-[18px]" />
          ) : (
            <FaRegEye className="text-[18px]" />
          )}
        </Button>
      </div>

      {/* Password Strength Indicator */}
      {showStrengthIndicator && value && (
        <div className="mt-3 space-y-2">
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div 
              className={`h-1 rounded-full transition-all duration-300 ${getProgressBarColor()}`}
              style={{ width: `${passwordStrength.score}%` }}
            ></div>
          </div>

          {/* Status Text */}
          {passwordStrength.status && (
            <p className={`text-sm font-medium ${passwordStrength.statusColor}`}>
              {passwordStrength.status}
            </p>
          )}

          {/* Requirements List */}
          <div className="space-y-1">
            {passwordStrength.requirements.map((requirement, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  requirement.met ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  {requirement.met && (
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm ${requirement.met ? 'text-green-600' : 'text-gray-500'}`}>
                  {requirement.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordInput;
