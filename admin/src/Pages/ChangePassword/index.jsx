import { Button } from "@mui/material";
import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { CgLogIn } from "react-icons/cg";
import { FaRegUser } from "react-icons/fa6";
import { FaRegEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { useContext } from "react";
import { MyContext } from "../../App.jsx";
import PasswordInput from "../../Components/PasswordInput";

import CircularProgress from '@mui/material/CircularProgress';
import { fetchDataFromApi, postData } from "../../utils/api.js";
import { useEffect } from "react";

const ChangePassword = () => {

  const [isPasswordShow2, setisPasswordShow2] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formFields, setFormsFields] = useState({
    email: localStorage.getItem("userEmail"),
    newPassword: '',
    confirmPassword: '',
    otp: localStorage.getItem("verifiedOtp")
  });

  const context = useContext(MyContext);
  const history = useNavigate();

  useEffect(() => {
    fetchDataFromApi("/api/logo").then((res) => {
      localStorage.setItem('logo', res?.logo[0]?.logo)
    })
  }, [])

  const onChangeInput = (e) => {
    const { name, value } = e.target;
    setFormsFields(() => {
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

    if (formFields.newPassword === "") {
      context.alertBox("error", "Please enter new password");
      setIsLoading(false);
      return false
    }

    // Password strength validation
    const passwordRequirements = [
      { regex: /.{8,}/, message: "Password must be at least 8 characters long" },
      { regex: /[0-9]/, message: "Password must contain at least 1 number" },
      { regex: /[a-z]/, message: "Password must contain at least 1 lowercase letter" },
      { regex: /[A-Z]/, message: "Password must contain at least 1 uppercase letter" }
    ];

    for (const requirement of passwordRequirements) {
      if (!requirement.regex.test(formFields.newPassword)) {
        context.alertBox("error", requirement.message);
        setIsLoading(false);
        return false;
      }
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
    <section className="bg-white w-full">
      <header className="w-full static lg:fixed top-0 left-0  px-4 py-3 flex items-center justify-center sm:justify-between z-50">
        <Link to="/">
          {/* Keep admin logo consistent across auth pages */}
          <img
            src={localStorage.getItem('logo')}
            className="w-[200px] h-[50px] object-contain"
          />
        </Link>

        <div className="hidden sm:flex items-center gap-0">
          <NavLink to="/login" exact={true} activeClassName="isActive">
            <Button className="!rounded-full !text-[rgba(0,0,0,0.8)] !px-5 flex gap-1">
              <CgLogIn className="text-[18px]" /> Login
            </Button>
          </NavLink>

          <NavLink to="/sign-up" exact={true} activeClassName="isActive">
            <Button className="!rounded-full !text-[rgba(0,0,0,0.8)] !px-5 flex gap-1">
              <FaRegUser className="text-[15px]" /> Sign Up
            </Button>
          </NavLink>
        </div>
      </header>
      <img src="/patern.webp" className="w-full fixed top-0 left-0 opacity-5" />

      <div className="loginBox card w-full md:w-[600px] h-[auto] px-3 pb-20 mx-auto pt-5 lg:pt-20 relative z-50">
        <div className="text-center">
          <img src="/icon.svg" className="m-auto" />
        </div>

        <h1 className="text-center text-[18px] sm:text-[35px] font-[800] mt-4">
          Welcome Back!
          <br />
          You can change your password from here
        </h1>


        <br />



        <form className="w-full px-3 sm:px-3 mt-3" onSubmit={handleSubmit}>

          <PasswordInput
            value={formFields.newPassword}
            onChange={onChangeInput}
            name="newPassword"
            label="New Password"
            placeholder="Enter your new password"
            disabled={isLoading}
            showStrengthIndicator={true}
          />

          <div className="form-group mb-4 w-full">
            <h4 className="text-[14px] font-[500] mb-1">Confirm Password</h4>
            <div className="relative w-full">
              <input
                type={isPasswordShow2 === false ? 'password' : 'text'}
                className="w-full h-[50px] border-2 border-[rgba(0,0,0,0.1)] rounded-md focus:border-[rgba(0,0,0,0.7)] focus:outline-none px-3"
                name="confirmPassword"
                value={formFields.confirmPassword}
                disabled={isLoading === true ? true : false}
                onChange={onChangeInput}
              />
              <Button className="!absolute top-[7px] right-[10px] z-50 !rounded-full !w-[35px] !h-[35px] !min-w-[35px] !text-gray-600" onClick={() => setisPasswordShow2(!isPasswordShow2)}>
                {isPasswordShow2 === false ? (
                  <FaRegEye className="text-[18px]" />
                ) : (
                  <FaEyeSlash className="text-[18px]" />
                )}
              </Button>
            </div>
          </div>

          <Button type="submit" disabled={!valideValue} className="btn-blue btn-lg w-full">
            {
              isLoading === true ? <CircularProgress color="inherit" />
                :
                'Change Password'
            }
          </Button>
        </form>
      </div>
    </section>
  );
};

export default ChangePassword;
