import React, { useContext, useEffect, useState } from "react";
import AccountSidebar from "../../components/AccountSidebar";
import { MyContext } from "../../App";
import { useNavigate } from "react-router-dom";
import { editData, postData } from "../../utils/api";
import CircularProgress from '@mui/material/CircularProgress';
import { Collapse } from "react-collapse";


const MyAccount = () => {

  // Bangladesh mobile operator prefixes
  const validBDPrefixes = ['13', '14', '15', '16', '17', '18', '19'];

  // Bangladesh phone validation function
  const validateBangladeshPhone = (phoneNumber) => {
    // Convert to string first (in case it's a number)
    const phoneStr = String(phoneNumber || '');
    // Remove all non-digit characters except +
    const cleanPhone = phoneStr.replace(/[^\d+]/g, '');
    
    // Check if it starts with +880
    if (!cleanPhone.startsWith('+880')) {
      return { isValid: false, error: "Phone number must start with +880" };
    }
    
    // Extract the digits after +880
    const digits = cleanPhone.substring(4); // Remove +880
    
    // Check if exactly 10 digits
    if (digits.length !== 10) {
      return { isValid: false, error: "Phone number must have exactly 10 digits after +880" };
    }
    
    // Check if first 2 digits are valid Bangladesh prefixes
    const prefix = digits.substring(0, 2);
    if (!validBDPrefixes.includes(prefix)) {
      return { isValid: false, error: `Invalid operator prefix. Use: ${validBDPrefixes.join(', ')}` };
    }
    
    return { isValid: true, error: null };
  };

  const [isLoading, setIsLoading] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [userId, setUserId] = useState("");
  const [isChangePasswordFormShow, setisChangePasswordFormShow] = useState(false);
  const [phone, setPhone] = useState('');

  const [formFields, setFormsFields] = useState({
    name: '',
    email: '',
    mobile: ''
  });

  const [changePassword, setChangePassword] = useState({
    email: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const context = useContext(MyContext);
  const history = useNavigate();

  // Add authentication guard
  useEffect(() => {
    if (!context.isLogin) {
      history('/login');
    }
  }, [context.isLogin, history]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (token === null) {
      history("/");
    }


  }, [context?.isLogin])


  useEffect(() => {
    if (context?.userData?._id !== "" && context?.userData?._id !== undefined) {
      setUserId(context?.userData?._id);
      setTimeout(() => {
        setFormsFields({
          name: context?.userData?.name,
          email: context?.userData?.email,
          mobile: context?.userData?.mobile
        })
      }, 200);
      
      // Handle phone initialization properly
      let cleanPhone = context?.userData?.mobile || '';
      if (cleanPhone && cleanPhone !== 'null' && cleanPhone !== null) {
        // Convert to string first (in case it's a number from database)
        cleanPhone = String(cleanPhone);
        // Remove any quotes
        cleanPhone = cleanPhone.replace(/"/g, '');
        // Ensure it starts with +880
        if (!cleanPhone.startsWith('+880') && cleanPhone.length >= 10) {
          cleanPhone = `+880${cleanPhone}`;
        }
        setPhone(cleanPhone);
      } else {
        setPhone('');
      }

      setChangePassword({
        email: context?.userData?.email
      })
    }

  }, [context?.userData])



  const onChangeInput = (e) => {
    const { name, value } = e.target;
    setFormsFields(() => {
      return {
        ...formFields,
        [name]: value
      }
    })

    setChangePassword(() => {
      return {
        ...formFields,
        [name]: value
      }
    })


  }


  const valideValue = Object.values(formFields).every(el => el)

  const handleSubmit = (e) => {
    e.preventDefault();

    setIsLoading(true);

    if (formFields.name === "") {
      context.alertBox("error", "Please enter full name");
      return false
    }


    if (formFields.email === "") {
      context.alertBox("error", "Please enter email id");
      return false
    }


    if (formFields.mobile === "") {
      context.alertBox("error", "Please enter mobile number");
      return false
    }

    // Validate Bangladesh phone number
    const phoneValidation = validateBangladeshPhone(phone);
    if (!phoneValidation.isValid) {
      context.alertBox("error", phoneValidation.error);
      setIsLoading(false);
      return false;
    }


    editData(`/api/user/${userId}`, formFields, { withCredentials: true }).then((res) => {
      console.log(res)
      if (res?.error !== true) {
        setIsLoading(false);
        context.alertBox("success", res?.data?.message);

      } else {
        context.alertBox("error", res?.data?.message);
        setIsLoading(false);
      }

    })


  }

  const valideValue2 = Object.values(formFields).every(el => el)



  const handleSubmitChangePassword = (e) => {
    e.preventDefault();

    setIsLoading2(true);

    if (changePassword.oldPassword === "") {
      context.alertBox("error", "Please enter old password");
      return false
    }


    if (changePassword.newPassword === "") {
      context.alertBox("error", "Please enter new password");
      return false
    }


    if (changePassword.confirmPassword === "") {
      context.alertBox("error", "Please enter confirm password");
      return false
    }

    if (changePassword.confirmPassword !== changePassword.newPassword) {
      context.alertBox("error", "password and confirm password not match");
      return false
    }


    postData(`/api/user/reset-password`, changePassword, { withCredentials: true }).then((res) => {

      if (res?.error !== true) {
        setIsLoading2(false);
        context.alertBox("success", res?.message);
      } else {
        context.alertBox("error", res?.message);
        setIsLoading2(false);
      }

    })


  }

  return (
    <section className="py-3 lg:py-10 w-full">
      <div className="container flex flex-col lg:flex-row gap-5">
        <div className="w-full lg:w-[20%]">
          <AccountSidebar />
        </div>

        <div className="col2 w-full lg:w-[50%]">
          <div className="card bg-white p-6 border border-gray-200 mb-5">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <h2 className="text-[20px] font-[600] text-gray-900">My Profile</h2>
              <button 
                onClick={() => setisChangePasswordFormShow(!isChangePasswordFormShow)}
                className="bg-[#FF2E4D] border border-gray-300 text-white px-4 py-2 text-[14px] font-[600] hover:bg-[#e63852] transition-all duration-200"
              >
                Change Password
              </button>
            </div>

            <form className="mt-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="col">
                  <label className="block text-[14px] font-[600] text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formFields.name}
                    disabled={isLoading === true}
                    onChange={onChangeInput}
                    className="w-full px-3 py-3 border border-gray-300 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="col">
                  <label className="block text-[14px] font-[600] text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formFields.email}
                    disabled={true}
                    className="w-full px-3 py-3 border border-gray-300 focus:outline-none bg-gray-100 cursor-not-allowed"
                    placeholder="Enter your email"
                  />
                </div>

                <div className="col">
                  <label className="block text-[14px] font-[600] text-gray-700 mb-2">
                    Mobile Number *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[14px] font-[600] text-gray-600">
                      +880
                    </span>
                    <input
                      type="tel"
                      value={phone && phone !== 'null' && phone !== '+880null' ? String(phone).replace('+880', '').replace(/"/g, '') : ''}
                      disabled={isLoading === true}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, ''); // Only allow digits
                        const formattedPhone = digits ? `+880${digits}` : '';
                        setPhone(formattedPhone);
                        setFormsFields((prevState) => ({
                          ...prevState,
                          mobile: formattedPhone
                        }));
                      }}
                      maxLength={10}
                      pattern="[0-9]*"
                      inputMode="numeric"
                      className="w-full pl-12 pr-3 py-3 border border-gray-300 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="13XXXXXXXX (10 digits)"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-6">
                <button 
                  type="submit" 
                  disabled={!valideValue || isLoading}
                  className="bg-black border border-gray-300 text-white px-6 py-3 text-[16px] font-[600] hover:bg-gray-800 transition-all duration-200 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {
                    isLoading === true ? (
                      <CircularProgress size={20} sx={{ color: 'white' }} />
                    ) : (
                      'Update Profile'
                    )
                  }
                </button>
              </div>
            </form>
          </div>





          <Collapse isOpened={isChangePasswordFormShow}>
            <div className="card bg-white p-6 border border-gray-200">
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <h2 className="text-[20px] font-[600] text-gray-900">Change Password</h2>
              </div>

              <form className="mt-6" onSubmit={handleSubmitChangePassword}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {
                    context?.userData?.signUpWithGoogle === false && (
                      <div className="col">
                        <label className="block text-[14px] font-[600] text-gray-700 mb-2">
                          Old Password *
                        </label>
                        <input
                          type="password"
                          name="oldPassword"
                          value={changePassword.oldPassword}
                          disabled={isLoading2 === true}
                          onChange={onChangeInput}
                          className="w-full px-3 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF2E4D] focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                          placeholder="Enter your old password"
                        />
                      </div>
                    )
                  }

                  <div className="col">
                    <label className="block text-[14px] font-[600] text-gray-700 mb-2">
                      New Password *
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={changePassword.newPassword}
                      onChange={onChangeInput}
                      className="w-full px-3 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF2E4D] focus:border-transparent transition-all duration-200"
                      placeholder="Enter your new password"
                    />
                  </div>

                  <div className="col">
                    <label className="block text-[14px] font-[600] text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={changePassword.confirmPassword}
                      onChange={onChangeInput}
                      className="w-full px-3 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF2E4D] focus:border-transparent transition-all duration-200"
                      placeholder="Confirm your new password"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-6">
                  <button 
                    type="submit" 
                    disabled={isLoading2}
                    className="bg-black border border-gray-300 text-white px-6 py-3 text-[16px] font-[600] hover:bg-gray-800 transition-all duration-200 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {
                      isLoading2 === true ? (
                        <CircularProgress size={20} sx={{ color: 'white' }} />
                      ) : (
                        'Change Password'
                      )
                    }
                  </button>
                </div>
              </form>
            </div>
          </Collapse>



        </div>
      </div>
    </section>
  );
};

export default MyAccount;
