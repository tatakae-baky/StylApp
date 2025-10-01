import React, { useState, useEffect } from 'react'
import { useContext } from 'react';
import { MyContext } from '../../App';
import { deleteData, editData, fetchDataFromApi, postData } from '../../utils/api';
import CircularProgress from '@mui/material/CircularProgress';

const AddAddress = () => {

    // Bangladesh cities list
    const bangladeshCities = [
        "Dhaka", "Chattogram", "Sylhet", "Rajshahi", "Khulna", 
        "Barisal", "Rangpur", "Mymensingh", "Cumilla", "Narayanganj",
        "Gazipur", "Jamalpur", "Bogura", "Jessore", "Dinajpur"
    ];

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

    // Format phone number for display
    const formatBDPhoneNumber = (phone) => {
        if (!phone || phone.length < 4) return phone;
        const cleanPhone = phone.replace(/[^\d+]/g, '');
        if (cleanPhone.startsWith('+880')) {
            const digits = cleanPhone.substring(4);
            if (digits.length >= 2) {
                return `+880 ${digits.substring(0, 2)} ${digits.substring(2)}`;
            }
        }
        return phone;
    };

    const [phone, setPhone] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [addressType, setAddressType] = useState("");

    const [formFields, setFormsFields] = useState({
        address_line1: '',
        street: '',
        apartmentName: '',
        city: '',
        state: 'Bangladesh',
        pincode: '',
        postcode: '',
        country: 'Bangladesh',
        mobile: '',
        // SECURITY FIX: Removed userId - server will get it from auth token
        addressType: ''
    });

    const [isLoading, setIsLoading] = useState(false);

    const context = useContext(MyContext);

    useEffect(() => {
        if (context?.userData?._id !== undefined) {
            setFormsFields((prevState) => ({
                ...prevState,
                // SECURITY FIX: Removed userId - server gets it from auth token
                state: 'Bangladesh',
                country: 'Bangladesh'
            }))
        }
    }, [context?.userData]);


    const onChangeInput = (e) => {
        const { name, value } = e.target;
        setFormsFields(() => {
            return {
                ...formFields,
                [name]: value
            }
        })

    }



    const handleChangeAddressType = (event) => {
        setAddressType(event.target.value)
        setFormsFields(() => ({
            ...formFields,
            addressType: event.target.value
        }))
    }



    useEffect(()=>{

        if(context?.addressMode === "edit"){
            fetchAddress(context?.addressId)
        }
        
    },[context?.addressMode]);


    const handleSubmit = (e) => {
        e.preventDefault();
        if (formFields.address_line1 === "") {
            context.alertBox("error", "Please enter Address Line 1");
            return false
        }

        if (formFields.city === "") {
            context.alertBox("error", "Please select your city");
            return false
        }

        if (formFields.postcode === "") {
            context.alertBox("error", "Please enter postcode");
            return false
        }

        // Validate 4-digit postcode for Bangladesh
        if (!/^\d{4}$/.test(formFields.postcode)) {
            context.alertBox("error", "Postcode must be exactly 4 digits");
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
            return false;
        }

        if (formFields.addressType === "") {
            context.alertBox("error", "Please select address type");
            return false
        }

      

        if (context?.addressMode === "add") {
            setIsLoading(true);
            postData(`/api/address/add`, formFields, { withCredentials: true }).then((res) => {
                if (res?.error !== true) {

                    context.alertBox("success", res?.message);
                    setTimeout(() => {
                        context.setOpenAddressPanel(false)
                        setIsLoading(false);
                    }, 500)


                    context.getUserDetails();

                    setFormsFields({
                        address_line1: '',
                        street: '',
                        apartmentName: '',
                        city: '',
                        state: 'Bangladesh',
                        pincode: '',
                        postcode: '',
                        country: 'Bangladesh',
                        mobile: '',
                        // SECURITY FIX: Removed userId
                        addressType: ''
                    })

                    setAddressType("");
                    setPhone("");



                } else {
                    context.alertBox("error", res?.message);
                    setIsLoading(false);
                }

            })
        }



        if (context?.addressMode  === "edit") {
            setIsLoading(true);
            editData(`/api/address/${context?.addressId}`, formFields, { withCredentials: true }).then((res) => {

                fetchDataFromApi(`/api/address/get`).then((res) => { // SECURITY FIX: Removed userId query param
                    setTimeout(() => {
                        setIsLoading(false);
                        context.setOpenAddressPanel(false);
                    }, 500)
                    context?.getUserDetails(res.data);

                    setFormsFields({
                        address_line1: '',
                        street: '',
                        apartmentName: '',
                        city: '',
                        state: 'Bangladesh',
                        pincode: '',
                        postcode: '',
                        country: 'Bangladesh',
                        mobile: '',
                        userId: '',
                        addressType: ''
                    })

                    setAddressType("");
                    setPhone("");
                })
            })
        }


    }



    const fetchAddress = (id) => {

        fetchDataFromApi(`/api/address/${id}`).then((res) => {

            setFormsFields({
                address_line1: res?.address?.address_line1 || '',
                street: res?.address?.street || '',
                apartmentName: res?.address?.apartmentName || '',
                city: res?.address?.city || '',
                state: res?.address?.state || 'Bangladesh',
                pincode: res?.address?.pincode || '',
                postcode: res?.address?.postcode || '',
                country: res?.address?.country || 'Bangladesh',
                mobile: res?.address?.mobile || '',
                userId: res?.address?.userId || '',
                addressType: res?.address?.addressType || ''
            })

            // Clean the phone number - remove quotes and ensure proper format
            let cleanPhone = res?.address?.mobile || '';
            if (cleanPhone) {
                // Remove any quotes
                cleanPhone = cleanPhone.replace(/"/g, '');
                // Ensure it starts with +880
                if (!cleanPhone.startsWith('+880') && cleanPhone.length >= 10) {
                    cleanPhone = `+880${cleanPhone}`;
                }
            }
            setPhone(cleanPhone);
            setAddressType(res?.address?.addressType)

        })

    }

    return (
        <form className="p-6" onSubmit={handleSubmit}>
            {/* Address Line 1 */}
            <div className="mb-4">
                <label className="block text-[14px] font-[600] text-gray-700 mb-2">
                    Address Line 1 *
                </label>
                <input
                    type="text"
                    name="address_line1"
                    value={formFields.address_line1}
                    onChange={onChangeInput}
                    className="w-full px-3 py-3 border border-gray-300 focus:outline-none"
                    placeholder="Enter your address"
                />
            </div>

            {/* Street (Optional) */}
            <div className="mb-4">
                <label className="block text-[14px] font-[600] text-gray-700 mb-2">
                    Street (Optional)
                </label>
                <input
                    type="text"
                    name="street"
                    value={formFields.street}
                    onChange={onChangeInput}
                    className="w-full px-3 py-3 border border-gray-300 focus:outline-none "
                    placeholder="Enter street name"
                />
            </div>

            {/* Apartment/Building Name (Optional) */}
            <div className="mb-4">
                <label className="block text-[14px] font-[600] text-gray-700 mb-2">
                    Apartment/Building Name (Optional)
                </label>
                <input
                    type="text"
                    name="apartmentName"
                    value={formFields.apartmentName}
                    onChange={onChangeInput}
                    className="w-full px-3 py-3 border border-gray-300 focus:outline-none "
                    placeholder="Enter apartment or building name"
                />
            </div>

            {/* City */}
            <div className="mb-4">
                <label className="block text-[14px] font-[600] text-gray-700 mb-2">
                    City *
                </label>
                <select
                    name="city"
                    value={formFields.city}
                    onChange={onChangeInput}
                    className="w-full px-3 py-3 border border-gray-300 focus:outline-none bg-white"
                >
                    <option value="">Select a city</option>
                    {bangladeshCities.map((city) => (
                        <option key={city} value={city}>{city}</option>
                    ))}
                </select>
            </div>

            {/* Postcode */}
            <div className="mb-4">
                <label className="block text-[14px] font-[600] text-gray-700 mb-2">
                    Postcode *
                </label>
                <input
                    type="text"
                    name="postcode"
                    value={formFields.postcode}
                    onChange={onChangeInput}
                    maxLength={4}
                    pattern="[0-9]{4}"
                    className="w-full px-3 py-3 border border-gray-300 focus:outline-none "
                    placeholder="4-digit postcode"
                />
            </div>

            {/* Mobile Number */}
            <div className="mb-4">
                <label className="block text-[14px] font-[600] text-gray-700 mb-2">
                    Mobile Number *
                </label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[14px] font-[600] text-gray-600">
                        +880
                    </span>
                    <input
                        type="tel"
                        value={phone ? phone.replace('+880', '') : ''}
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
                        className="w-full pl-12 pr-3 py-3 border border-gray-300 focus:outline-none "
                        placeholder="13XXXXXXXX (10 digits)"
                    />
                </div>
                {phoneError && (
                    <p className="text-red-500 text-[12px] mt-1">
                        {phoneError}
                    </p>
                )}
            </div>

            {/* Address Type */}
            <div className="mb-6">
                <label className="block text-[14px] font-[600] text-gray-700 mb-3">
                    Address Type *
                </label>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="addressType"
                            value="Home"
                            checked={addressType === "Home"}
                            onChange={handleChangeAddressType}
                            className="w-4 h-4 text-[#FF2E4D] border-gray-300"
                        />
                        <span className="text-[14px] text-gray-700">Home</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="addressType"
                            value="Office"
                            checked={addressType === "Office"}
                            onChange={handleChangeAddressType}
                            className="w-4 h-4 text-[#FF2E4D] border-gray-300"
                        />
                        <span className="text-[14px] text-gray-700">Office</span>
                    </label>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-5">
                <button 
                    type="submit" 
                    className="w-full bg-[#FF2E4D] border border-gray-300 text-white py-3 text-[16px] font-[600] hover:bg-[#e63852] transition-all duration-200 flex items-center justify-center gap-2 "
                >
                    {
                        isLoading === true ? (
                            <CircularProgress size={20} sx={{ color: 'white' }} />
                        ) : (
                            'SAVE'
                        )
                    }
                </button>
            </div>
        </form>
    )
}

export default AddAddress