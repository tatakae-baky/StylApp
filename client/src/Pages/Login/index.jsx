import React, { useContext, useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { IoMdEye } from "react-icons/io";
import { IoMdEyeOff } from "react-icons/io";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { MyContext } from "../../App";
import CircularProgress from "@mui/material/CircularProgress";
import { postData } from "../../utils/api";

import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { firebaseApp } from "../../firebase";
const auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();

/**
 * Login component - User authentication page with modern design
 * Matches the design theme used across the application
 */
const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordShow, setIsPasswordShow] = useState(false);
  const [formFields, setFormsFields] = useState({
    email: "",
    password: "",
  });

  const context = useContext(MyContext);
  const history = useNavigate();

  // Scroll to top and check authentication status
  useEffect(() => {
    window.scrollTo(0, 0);
    const token = localStorage.getItem("accessToken");

    if (token !== undefined && token !== null && token !== "") {
      history("/");
    }
  }, []);

  /**
   * Handle forgot password functionality
   */
  const forgotPassword = () => {
    if (formFields.email === "") {
      context.alertBox("error", "Please enter email id");
      return false;
    } else {
      context.alertBox("success", `OTP sent to ${formFields.email}`);
      localStorage.setItem("userEmail", formFields.email);
      localStorage.setItem("actionType", "forgot-password");

      postData("/api/user/forgot-password", {
        email: formFields.email,
      }).then((res) => {
        if (res?.error === false) {
          context.alertBox("success", res?.message);
          history("/verify");
        } else {
          context.alertBox("error", res?.message);
        }
      });
    }
  };

  /**
   * Handle input field changes
   * @param {Event} e - Input change event
   */
  const onChangeInput = (e) => {
    const { name, value } = e.target;
    setFormsFields(() => {
      return {
        ...formFields,
        [name]: value,
      };
    });
  };

  // Check if all form fields have values
  const valideValue = Object.values(formFields).every((el) => el);

  /**
   * Handle form submission for user login
   * @param {Event} e - Form submit event
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    setIsLoading(true);

    if (formFields.email === "") {
      context.alertBox("error", "Please enter email id");
      return false;
    }

    if (formFields.password === "") {
      context.alertBox("error", "Please enter password");
      return false;
    }

    postData("/api/user/login", formFields, { withCredentials: true }).then(
      (res) => {
        console.log(res);

        if (res?.error !== true) {
          setIsLoading(false);
          context.alertBox("success", res?.message);
          setFormsFields({
            email: "",
            password: "",
          });

          localStorage.setItem("accessToken", res?.data?.accesstoken);
          localStorage.setItem("refreshToken", res?.data?.refreshToken);

          context.setIsLogin(true);

          history("/");
        } else {
          context.alertBox("error", res?.message);
          setIsLoading(false);
        }
      }
    );
  };

  /**
   * Handle Google authentication for login
   */
  const authWithGoogle = () => {
    signInWithPopup(auth, googleProvider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;

        const fields = {
          name: user.providerData[0].displayName,
          email: user.providerData[0].email,
          password: null,
          avatar: user.providerData[0].photoURL,
          mobile: user.providerData[0].phoneNumber,
          role: "USER",
        };

        postData("/api/user/authWithGoogle", fields).then((res) => {
          if (res?.error !== true) {
            setIsLoading(false);
            context.alertBox("success", res?.message);
            localStorage.setItem("userEmail", fields.email);
            localStorage.setItem("accessToken", res?.data?.accesstoken);
            localStorage.setItem("refreshToken", res?.data?.refreshToken);

            context.setIsLogin(true);

            history("/");
          } else {
            context.alertBox("error", res?.message);
            setIsLoading(false);
          }
        });

        console.log(user);
        // IdP data available using getAdditionalUserInfo(result)
        // ...
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
  };

  return (
    <section className="py-5 lg:py-10 w-full">
      <div className="container">
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            {/* Main login card */}
            <div className="card bg-white lg:border lg:border-gray-400 p-6 lg:p-8">
              {/* Header */}
              <div className="text-center mb-4">
                <h2 className="text-[24px] font-[600] text-gray-900 mb-2">
                  Welcome Back
                </h2>
                <p className="text-[14px] text-gray-600">
                  Sign in to your account
                </p>
              </div>

              {/* Login form */}
              <form className="w-full" onSubmit={handleSubmit}>
                {/* Email Field */}
                <div className="mb-4">
                  <label className="block text-[14px] font-[600] text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formFields.email}
                    disabled={isLoading}
                    onChange={onChangeInput}
                    className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-[#FF2E4D] transition-colors duration-200"
                    placeholder="Enter your email address"
                  />
                </div>

                {/* Password Field */}
                <div className="mb-4">
                  <label className="block text-[14px] font-[600] text-gray-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={isPasswordShow ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formFields.password}
                      disabled={isLoading}
                      onChange={onChangeInput}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 focus:outline-none focus:border-[#FF2E4D] transition-colors duration-200"
                      placeholder="Enter your password"
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

                {/* Forgot Password Link */}
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={forgotPassword}
                    className="text-[#FF2E4D] text-[14px] font-[600] hover:underline transition-all duration-200"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Login Button */}
                <div className="mb-4">
                  <button
                    type="submit"
                    disabled={!valideValue || isLoading}
                    className="w-full bg-[#FF2E4D] text-white py-3 px-4 text-[16px] font-[600] hover:bg-[#e63852] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <CircularProgress size={20} sx={{ color: "white" }} />
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </div>

                {/* Divider */}
                <div className="flex items-center mb-4">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <span className="px-4 text-[14px] text-gray-500 font-[500]">
                    or continue with
                  </span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>

                {/* Google Sign In Button */}
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={authWithGoogle}
                    className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 text-[16px] font-[600] hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-3"
                  >
                    <FcGoogle className="text-[20px]" />
                    Sign in with Google
                  </button>
                </div>

                {/* Register Link */}
                <div className="text-center">
                  <p className="text-[14px] text-gray-600">
                    Don't have an account?{" "}
                    <Link
                      to="/register"
                      className="text-[#FF2E4D] font-[600] hover:underline transition-all duration-200"
                    >
                      Sign Up
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

export default Login;
