import { Button } from "@mui/material";
import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { CgLogIn } from "react-icons/cg";
import { FaRegUser } from "react-icons/fa6";
import LoadingButton from "@mui/lab/LoadingButton";
import { FcGoogle } from "react-icons/fc";
import { BsFacebook } from "react-icons/bs";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { FaRegEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import CircularProgress from "@mui/material/CircularProgress";
import { fetchDataFromApi, postData } from "../../utils/api";
import { useContext } from "react";
import { MyContext } from "../../App.jsx";
import PasswordInput from "../../Components/PasswordInput";
import RainbowButton from "../../Components/RainbowButton";

import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { firebaseApp } from "../../firebase";
import { useEffect } from "react";
const auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();

const Login = () => {
  const [loadingGoogle, setLoadingGoogle] = React.useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formFields, setFormsFields] = useState({
    email: "",
    password: "",
  });

  const context = useContext(MyContext);
  const history = useNavigate();

  useEffect(() => {
    fetchDataFromApi("/api/logo")
      .then((res) => {
        // Be defensive when API is down or returns unexpected shape
        const safeLogo = res?.logo?.[0]?.logo || "";
        if (safeLogo) {
          localStorage.setItem("logo", safeLogo);
        }
      })
      .catch(() => {
        // Swallow network errors to keep login usable
      });
  }, []);

  const onChangeInput = (e) => {
    const { name, value } = e.target;
    setFormsFields(() => {
      return {
        ...formFields,
        [name]: value,
      };
    });
  };

  const valideValue = Object.values(formFields).every((el) => el);

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
          history("/verify-account");
        } else {
          context.alertBox("error", res?.message);
        }
      });
    }
  };

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

  const authWithGoogle = () => {
    setLoadingGoogle(true);

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
        };

        postData("/api/user/authWithGoogle", fields).then((res) => {
          if (res?.error !== true) {
            setLoadingGoogle(false);
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
    <section className="bg-white w-full">
      {/* Top right Brand Partner button */}
      <div className="fixed top-4 right-4 z-50">
        <RainbowButton to="/brand-partner-request">
          Become a Brand Partner
        </RainbowButton>
      </div>
      <img src="/patern.webp" className="w-full fixed top-0 left-0 opacity-5" />

      <div className="loginBox card w-full md:w-[600px] h-[auto] pb-20 mx-auto pt-5 lg:pt-20 relative z-50">
        <Link to="/">
          {/* Constrain uploaded logo proportions for consistent header rendering */}
          <img
            src={localStorage.getItem("logo")}
            className="w-[200px] h-[50px] object-contain mx-auto"
          />
        </Link>

        <h1 className="text-center text-[18px] sm:text-[35px] font-[800] mt-4">
          Welcome Back!
          <br />
          Sign in with your credentials.
        </h1>

        <div className="flex items-center justify-center w-full mt-5 gap-4">
          <LoadingButton
            size="small"
            onClick={authWithGoogle}
            endIcon={<FcGoogle />}
            loading={loadingGoogle}
            loadingPosition="end"
            variant="outlined"
            className="!bg-none !py-2 !text-[15px] !capitalize !px-5 !text-[rgba(0,0,0,0.7)]"
          >
            Signin with Google
          </LoadingButton>
        </div>

        <br />

        <div className="w-full flex items-center justify-center gap-3">
          <span className="flex items-center w-[100px] h-[1px] bg-[rgba(0,0,0,0.2)]"></span>
          <span className="text-[10px] lg:text-[14px] font-[500]">
            Or, Sign in with your email
          </span>
          <span className="flex items-center w-[100px] h-[1px] bg-[rgba(0,0,0,0.2)]"></span>
        </div>

        <br />

        <form className="w-full px-8 mt-3" onSubmit={handleSubmit}>
          <div className="form-group mb-4 w-full">
            <h4 className="text-[14px] font-[500] mb-1">Email</h4>
            <input
              type="email"
              className="w-full h-[50px] border-2 border-[rgba(0,0,0,0.1)] rounded-md focus:border-[rgba(0,0,0,0.7)] focus:outline-none px-3"
              name="email"
              value={formFields.email}
              disabled={isLoading === true ? true : false}
              onChange={onChangeInput}
            />
          </div>

          <PasswordInput
            value={formFields.password}
            onChange={onChangeInput}
            name="password"
            disabled={isLoading}
            showStrengthIndicator={false}
          />

          <div className="form-group mb-4 w-full flex items-center justify-between">
            <FormControlLabel
              control={<Checkbox defaultChecked />}
              label="Remember Me"
            />

            <a
              onClick={forgotPassword}
              className="text-primary font-[700] text-[15px] hover:underline hover:text-gray-700 cursor-pointer"
            >
              Forgot Password?
            </a>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-[14px]">Don't have an account?</span>
            <Link
              to="/sign-up"
              className="text-primary font-[700] text-[15px] hover:underline hover:text-gray-700 cursor-pointer"
            >
              Sign Up
            </Link>
          </div>

          <Button
            type="submit"
            disabled={!valideValue}
            className="btn-blue btn-lg w-full"
          >
            {isLoading === true ? (
              <CircularProgress color="inherit" />
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </div>
    </section>
  );
};

export default Login;
