import React, { useContext, useEffect, useState } from 'react'
import { MyContext } from '../../App';
import { FaCloudUploadAlt } from "react-icons/fa";
import CircularProgress from '@mui/material/CircularProgress';
import { editData, fetchDataFromApi, postData, uploadImage } from "../../utils/api";
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import TextField from "@mui/material/TextField";
import { Collapse } from "react-collapse";
import Radio from '@mui/material/Radio';
import PasswordInput from "../../Components/PasswordInput";

const label = { inputProps: { 'aria-label': 'Checkbox demo' } };


const Profile = () => {

    // Bangladesh mobile operator prefixes
    const validBDPrefixes = ['13', '14', '15', '16', '17', '18', '19'];

    // Bangladesh phone validation function
    const validateBangladeshPhone = (phoneNumber) => {
        // Handle null, undefined, or non-string inputs
        if (!phoneNumber || typeof phoneNumber !== 'string') {
            return { isValid: false, error: "Phone number is required" };
        }
        
        // Remove all non-digit characters except +
        const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
        
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

    const [previews, setPreviews] = useState([]);
    const [uploading, setUploading] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [isLoading2, setIsLoading2] = useState(false);
    const [userId, setUserId] = useState("");
    const [isChangePasswordFormShow, setisChangePasswordFormShow] = useState(false);
    const [phone, setPhone] = useState('');
    const [phoneError, setPhoneError] = useState('');

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

    const [selectedValue, setSelectedValue] = useState('H No 222 Street No 6 Adarsh Mohalla');

    const handleChange = (event) => {
        setSelectedValue(event.target.value);
    };

    useEffect(() => {
        const token = localStorage.getItem("accessToken");

        if (token === null) {
            history("/login");
        }

    }, [context?.isLogin])


    useEffect(() => {
        if (context?.userData?._id !== "" && context?.userData?._id !== undefined) {

            setUserId(context?.userData?._id);
            setFormsFields({
                name: context?.userData?.name || '',
                email: context?.userData?.email || '',
                mobile: context?.userData?.mobile || ''
            })

            // Clean the phone number - remove quotes and ensure proper format
            let cleanPhone = context?.userData?.mobile || '';
            
            // Ensure cleanPhone is a string and handle null/undefined cases
            if (cleanPhone && (typeof cleanPhone === 'string' || typeof cleanPhone === 'number')) {
                // Convert to string
                cleanPhone = String(cleanPhone);
                // Remove any quotes
                cleanPhone = cleanPhone.replace(/"/g, '');
                
                // Handle different phone number formats
                if (cleanPhone.startsWith('+880')) {
                    // Already in correct format
                    setPhone(cleanPhone);
                } else if (cleanPhone.startsWith('880')) {
                    // Add the + prefix
                    setPhone(`+${cleanPhone}`);
                } else if (cleanPhone.length === 11 && cleanPhone.startsWith('8')) {
                    // 88013xxxxxxx format - add +
                    setPhone(`+${cleanPhone}`);
                } else if (cleanPhone.length === 10) {
                    // 13xxxxxxxx format - add +880
                    setPhone(`+880${cleanPhone}`);
                } else {
                    // Default case - assume it needs +880
                    setPhone(`+880${cleanPhone}`);
                }
            } else {
                setPhone('');
            }

            setChangePassword({
                ...changePassword,
                email: context?.userData?.email
            })
        }

    }, [context?.userData])

    // Sync phone state with formFields.mobile
    useEffect(() => {
        if (phone) {
            setFormsFields((prevState) => ({
                ...prevState,
                mobile: phone
            }));
        }
    }, [phone])



    const onChangeInput = (e) => {
        const { name, value } = e.target;
        setFormsFields((prevState) => {
            return {
                ...prevState,
                [name]: value
            }
        })
    }

    const onChangePasswordInput = (e) => {
        const { name, value } = e.target;
        setChangePassword((prevState) => {
            return {
                ...prevState,
                [name]: value
            }
        })
    }


    const valideValue = formFields.name && formFields.name.trim() !== "" && 
                        formFields.email && formFields.email.trim() !== "" && 
                        phone && phone.trim() !== "" && 
                        phoneError === ""

    const handleSubmit = (e) => {
        e.preventDefault();

        setIsLoading(true);

        if (formFields.name === "") {
            context.alertBox("error", "Please enter full name");
            setIsLoading(false);
            return false
        }

        if (formFields.email === "") {
            context.alertBox("error", "Please enter email id");
             setIsLoading(false);
            return false
        }

        if (phone === "") {
            context.alertBox("error", "Please enter mobile number");
             setIsLoading(false);
            return false
        }

        // Validate Bangladesh phone number
        const phoneValidation = validateBangladeshPhone(phone);
        if (!phoneValidation.isValid) {
            context.alertBox("error", phoneValidation.error);
            setIsLoading(false);
            return false;
        }

        // Prepare data with properly formatted phone
        const updateData = {
            ...formFields,
            mobile: phone
        };

        editData(`/api/user/${userId}`, updateData, { withCredentials: true }).then((res) => {
            console.log(res)
            if (res?.error !== true) {
                setIsLoading(false);
                context.alertBox("success", res?.data?.message);
                // Update the context with new user data after a small delay
                setTimeout(() => {
                    context.getUserDetails();
                }, 500);
            } else {
                context.alertBox("error", res?.data?.message);
                setIsLoading(false);
            }
        })
    }

    const valideValue2 = Object.values(changePassword).filter(val => val !== changePassword.email).every(el => el)



    const handleSubmitChangePassword = (e) => {
        e.preventDefault();

        setIsLoading2(true);

        if (changePassword.oldPassword === "") {
            context.alertBox("error", "Please enter old password");
             setIsLoading2(false);
            return false
        }

        if (changePassword.newPassword === "") {
            context.alertBox("error", "Please enter new password");
             setIsLoading2(false);
            return false
        }

        // Password strength validation
        const passwordRequirements = [
            { regex: /.{8,}/, message: "New password must be at least 8 characters long" },
            { regex: /[0-9]/, message: "New password must contain at least 1 number" },
            { regex: /[a-z]/, message: "New password must contain at least 1 lowercase letter" },
            { regex: /[A-Z]/, message: "New password must contain at least 1 uppercase letter" }
        ];

        for (const requirement of passwordRequirements) {
            if (!requirement.regex.test(changePassword.newPassword)) {
                context.alertBox("error", requirement.message);
                setIsLoading2(false);
                return false;
            }
        }

        if (changePassword.confirmPassword === "") {
            context.alertBox("error", "Please enter confirm password");
             setIsLoading2(false);
            return false
        }

        if (changePassword.confirmPassword !== changePassword.newPassword) {
            context.alertBox("error", "password and confirm password not match");
             setIsLoading2(false);
            return false
        }


        postData(`/api/user/reset-password`, changePassword, { withCredentials: true }).then((res) => {
            console.log(res)
            if (res?.error !== true) {
                setIsLoading2(false);
                context.alertBox("success", res?.message);

            } else {
                context.alertBox("error", res?.message);
                setIsLoading2(false);
            }

        })


    }

    useEffect(() => {
        const userAvtar = [];
        if (context?.userData?.avatar !== "" && context?.userData?.avatar !== undefined) {
            userAvtar.push(context?.userData?.avatar);
            setPreviews(userAvtar)
        }

    }, [context?.userData])

    let selectedImages = [];

    const formdata = new FormData();

    const onChangeFile = async (e, apiEndPoint) => {
        try {
            setPreviews([]);
            const files = e.target.files;
            setUploading(true);


            for (var i = 0; i < files.length; i++) {
                if (files[i] && (files[i].type === "image/jpeg" || files[i].type === "image/jpg" ||
                    files[i].type === "image/png" ||
                    files[i].type === "image/webp")
                ) {

                    const file = files[i];

                    selectedImages.push(file);
                    formdata.append(`avatar`, file);


                } else {
                    context.alertBox("error", "Please select a valid JPG , PNG or webp image file.");
                    setUploading(false);
                    return false;
                }
            }

            uploadImage("/api/user/user-avatar", formdata).then((res) => {
                setUploading(false);
                let avatar = [];
                avatar.push(res?.data?.avtar);
                setPreviews(avatar);
            })

        } catch (error) {
            console.log(error);
        }
    }


    return (
        <>
            <div className="bg-white border border-gray-200">
                {/* Header Section - Matching Orders page style */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h2 className="text-[20px] font-[600] text-gray-900 mb-2">User Profile Management</h2>
                            <p className="text-[14px] text-gray-600">
                                Manage your account information and security settings
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setisChangePasswordFormShow(!isChangePasswordFormShow)}
                                className="bg-[#FF2E4D] text-white py-2 px-4 text-[14px] font-[600] hover:bg-[#e63852] transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                {isChangePasswordFormShow ? 'Hide Password Form' : 'Change Password'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="max-w-2xl mx-auto">
                        {/* Profile Picture Section */}
                        <div className="flex justify-center mb-8">
                            <div className="w-[120px] h-[120px] rounded-full overflow-hidden relative group flex items-center justify-center bg-gray-200 border-4 border-white shadow-lg">
                                {
                                    uploading === true ? <CircularProgress color="inherit" /> :
                                        <>
                                            {
                                                previews?.length !== 0 ? previews?.map((img, index) => {
                                                    return (
                                                        <img
                                                            src={img}
                                                            key={index}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    )
                                                })
                                                    :
                                                    <img
                                                        src={"/user.jpg"}
                                                        className="w-full h-full object-cover"
                                                    />

                                            }
                                        </>

                                }

                                <div className="overlay w-[100%] h-[100%] absolute top-0 left-0 z-50 bg-[rgba(0,0,0,0.7)] flex items-center justify-center cursor-pointer opacity-0 transition-all group-hover:opacity-100">
                                    <FaCloudUploadAlt className="text-[#fff] text-[25px]" />
                                    <input
                                        type="file"
                                        className="absolute top-0 left-0 w-full h-full opacity-0"
                                        accept='image/*'
                                        onChange={(e) =>
                                            onChangeFile(e, "/api/user/user-avatar")
                                        }
                                        name="avatar"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Profile Form */}
                        <form className="w-full" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name Field */}
                                <div>
                                    <label className="block text-[14px] font-[600] text-gray-700 mb-2">
                                        Full Name *
                                    </label>
                                    <input 
                                        type="text" 
                                        className='w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-[#FF2E4D] transition-colors duration-200 rounded-md' 
                                        name="name" 
                                        value={formFields.name || ''}
                                        disabled={isLoading === true ? true : false}
                                        onChange={onChangeInput} 
                                        placeholder="Enter your full name" 
                                    />
                                </div>

                                {/* Email Field */}
                                <div>
                                    <label className="block text-[14px] font-[600] text-gray-700 mb-2">
                                        Email Address *
                                    </label>
                                    <input 
                                        type="email" 
                                        className='w-full px-4 py-3 border border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed rounded-md' 
                                        name="email"
                                        value={formFields.email || ''}
                                        disabled={true}
                                        onChange={onChangeInput} 
                                        placeholder="Email Address" 
                                    />
                                </div>

                                {/* Mobile Number Field - Full width */}
                                <div className="md:col-span-2">
                                    <label className="block text-[14px] font-[600] text-gray-700 mb-2">
                                        Mobile Number *
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[14px] font-[600] text-gray-600">
                                            +880
                                        </span>
                                        <input
                                            type="tel"
                                            value={(() => {
                                                if (!phone || typeof phone !== 'string') return '';
                                                // If phone starts with +880, remove it to show only the digits
                                                if (phone.startsWith('+880')) {
                                                    return phone.substring(4); // Remove "+880"
                                                }
                                                // If phone starts with 880, remove it
                                                if (phone.startsWith('880')) {
                                                    return phone.substring(3); // Remove "880"
                                                }
                                                // If it starts with +88, remove it
                                                if (phone.startsWith('+88')) {
                                                    return phone.substring(3); // Remove "+88"
                                                }
                                                // Otherwise return as is (should be just digits)
                                                return phone;
                                            })()}
                                            disabled={isLoading === true ? true : false}
                                            onChange={(e) => {
                                                const digits = e.target.value.replace(/\D/g, ''); // Only allow digits
                                                const formattedPhone = digits ? `+880${digits}` : '';
                                                setPhone(formattedPhone);
                                                setFormsFields((prevState) => ({
                                                    ...prevState,
                                                    mobile: formattedPhone
                                                }));
                                                
                                                // Real-time validation
                                                if (formattedPhone && formattedPhone.length > 4) {
                                                    const validation = validateBangladeshPhone(formattedPhone);
                                                    setPhoneError(validation.isValid ? '' : validation.error);
                                                } else {
                                                    setPhoneError('');
                                                }
                                            }}
                                            maxLength={10}
                                            pattern="[0-9]*"
                                            inputMode="numeric"
                                            className="w-full pl-12 pr-3 py-3 border border-gray-300 focus:outline-none focus:border-[#FF2E4D] transition-colors duration-200 rounded-md"
                                            placeholder="13XXXXXXXX (10 digits)"
                                        />
                                    </div>
                                    {phoneError && (
                                        <p className="text-red-500 text-[12px] mt-1">
                                            {phoneError}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Update Profile Button */}
                            <div className="mt-8 flex justify-center">
                                <button
                                    type="submit"
                                    disabled={!valideValue || isLoading}
                                    className="bg-[#FF2E4D] text-white py-3 px-8 text-[16px] font-[600] hover:bg-[#e63852] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-md"
                                >
                                    {isLoading ? (
                                        <CircularProgress size={20} sx={{ color: 'white' }} />
                                    ) : (
                                        'Update Profile'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>


            <Collapse isOpened={isChangePasswordFormShow}>
                <div className="bg-white border border-gray-200 mt-6">
                    {/* Change Password Header - Matching Orders page style */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div>
                                <h2 className="text-[20px] font-[600] text-gray-900 mb-2">Change Password</h2>
                                <p className="text-[14px] text-gray-600">
                                    Update your account password for enhanced security
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="max-w-2xl mx-auto">
                            {/* Change Password Form */}
                            <form className="w-full" onSubmit={handleSubmitChangePassword}>
                                <div className="space-y-6">
                                    {/* Old Password Field */}
                                    <div>
                                        <label className="block text-[14px] font-[600] text-gray-700 mb-2">
                                            Old Password *
                                        </label>
                                        <input 
                                            type="password" 
                                            className='w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-[#FF2E4D] transition-colors duration-200 rounded-md' 
                                            name="oldPassword" 
                                            value={changePassword.oldPassword || ''}
                                            disabled={isLoading2 === true ? true : false}
                                            onChange={onChangePasswordInput} 
                                            placeholder='Enter your old password'
                                        />
                                    </div>

                                    {/* New Password Field with PasswordInput Component */}
                                    <PasswordInput
                                        value={changePassword.newPassword || ''}
                                        onChange={onChangePasswordInput}
                                        name="newPassword"
                                        label="New Password"
                                        placeholder="Enter your new password"
                                        disabled={isLoading2}
                                        showStrengthIndicator={true}
                                    />

                                    {/* Confirm Password Field */}
                                    <div>
                                        <label className="block text-[14px] font-[600] text-gray-700 mb-2">
                                            Confirm Password *
                                        </label>
                                        <input 
                                            type="password" 
                                            className='w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-[#FF2E4D] transition-colors duration-200 rounded-md' 
                                            name="confirmPassword" 
                                            value={changePassword.confirmPassword || ''}
                                            disabled={isLoading2 === true ? true : false}
                                            onChange={onChangePasswordInput} 
                                            placeholder='Confirm your new password'
                                        />
                                    </div>
                                </div>

                                {/* Change Password Button */}
                                <div className="mt-8 flex justify-center">
                                    <button
                                        type="submit"
                                        disabled={!valideValue2 || isLoading2}
                                        className="bg-[#FF2E4D] text-white py-3 px-8 text-[16px] font-[600] hover:bg-[#e63852] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-md"
                                    >
                                        {isLoading2 ? (
                                            <CircularProgress size={20} sx={{ color: 'white' }} />
                                        ) : (
                                            'Change Password'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </Collapse>

        </>
    )
}


export default Profile;