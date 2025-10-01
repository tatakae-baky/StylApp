import "./App.css";
import "./responsive.css";
import React from 'react';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Dashboard from "./Pages/Dashboard";
import Header from "./Components/Header";
import Sidebar from "./Components/Sidebar";
import { createContext, useState } from "react";
import Login from "./Pages/Login";
import SignUp from "./Pages/SignUp";
import Products from "./Pages/Products";

// REMOVED: Old HomeSliderBanners import no longer needed
import CategoryList from "./Pages/Categegory";
import SubCategoryList from "./Pages/Categegory/subCatList";
import Users from "./Pages/Users";
import Orders from "./Pages/Orders";
import ForgotPassword from "./Pages/ForgotPassword";
import VerifyAccount from "./Pages/VerifyAccount";
import ChangePassword from "./Pages/ChangePassword";

import toast, { Toaster } from 'react-hot-toast';
import { fetchDataFromApi } from "./utils/api";
import { useEffect } from "react";
import Profile from "./Pages/Profile";
import ProductDetails from "./Pages/Products/productDetails";
import AddSize from "./Pages/Products/addSize";
import SizeStockManagement from "./Pages/Products/sizeStockManagement";
// NEW: Import redesigned banner components
import { HeroBannersList } from "./Pages/HeroBanners/HeroBannersList";
import { AddHeroBanner } from "./Pages/HeroBanners/AddHeroBanner";
import { EditHeroBanner } from "./Pages/HeroBanners/EditHeroBanner";
import { SalesBannersList } from "./Pages/SalesBanners/SalesBannersList";
import { AddSalesBanner } from "./Pages/SalesBanners/AddSalesBanner";
import { EditSalesBanner } from "./Pages/SalesBanners/EditSalesBanner";
import SubCategorySectionsList from "./Pages/SubCategorySections/SubCategorySectionsList";
import { AddSubCategorySection } from "./Pages/SubCategorySections/AddSubCategorySection";
import { EditSubCategorySection } from "./Pages/SubCategorySections/EditSubCategorySection";

// REMOVED: Old banner imports no longer needed

import { BlogList } from "./Pages/Blog";
import ManageLogo from "./Pages/ManageLogo";
import LoadingBar from "react-top-loading-bar";
import BrandList from "./Pages/Brands";
import AddBrand from "./Pages/Brands/AddBrand";
import EditBrand from "./Pages/Brands/EditBrand";
import ViewBrand from "./Pages/Brands/ViewBrand";
import BrandInfo from "./Pages/Brands/BrandInfo";
import HottestBrandOffersList from "./Pages/HottestBrandOffers/HottestBrandOffersList";
import AddHottestBrandOffer from "./Pages/HottestBrandOffers/AddHottestBrandOffer";
import EditHottestBrandOffer from "./Pages/HottestBrandOffers/EditHottestBrandOffer";
import HiddenGemBrandsList from "./Pages/HiddenGemBrands/HiddenGemBrandsList";
import AddHiddenGemBrand from "./Pages/HiddenGemBrands/AddHiddenGemBrand";
import EditHiddenGemBrand from "./Pages/HiddenGemBrands/EditHiddenGemBrand";
import RequestsPage from "./Pages/Requests";
import BrandPartnerRequest from "./Pages/BrandPartnerRequest";

const MyContext = createContext();
function App() {
  const [isSidebarOpen, setisSidebarOpen] = useState(true);
  const [isLogin, setIsLogin] = useState(false);
  const [userData, setUserData] = useState(null);
  const [address, setAddress] = useState([]);
  const [catData, setCatData] = useState([]);
  const [brandData, setBrandData] = useState([]);
  const [brandLogo, setBrandLogo] = useState(null); // Brand logo for brand owners
  const [brandLogoLoading, setBrandLogoLoading] = useState(false); // Track brand logo loading state
  const [userDataLoaded, setUserDataLoaded] = useState(false); // Track if user data is fully loaded
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [sidebarWidth, setSidebarWidth] = useState(18);

  const [progress, setProgress] = useState(0);


  const [isOpenFullScreenPanel, setIsOpenFullScreenPanel] = useState({
    open: false,
    id: ""
  });


  useEffect(() => {
    localStorage.removeItem("userEmail")
    if (windowWidth < 992) {
      setisSidebarOpen(false);
      setSidebarWidth(100)
    } else {
      setSidebarWidth(18)
    }
  }, [windowWidth])


  useEffect(() => {
    if (userData?.role !== "ADMIN") {
      const handleContextmenu = e => {
        e.preventDefault()
      }
      document.addEventListener('contextmenu', handleContextmenu)
      return function cleanup() {
        document.removeEventListener('contextmenu', handleContextmenu)
      }
    }
  }, [userData])

  // Central route guard: block USER or unauthenticated from admin pages
  useEffect(() => {
    const publicPaths = [
      '/login',
      '/sign-up',
      '/verify-account',
      '/forgot-password',
      '/brand-partner-request'
    ];
    const path = window.location.pathname;

    // Not logged in trying to access admin
    const token = localStorage.getItem('accessToken');
    if (!token && !publicPaths.includes(path)) {
      window.location.href = '/login';
      return;
    }

    // Logged in but forbidden role
    if (userData && userData.role && userData.role === 'USER' && !publicPaths.includes(path)) {
      toast.error('Access denied');
      window.location.href = '/login';
    }
  }, [userData, isLogin]);

  // Fallback guard using JWT role before userData loads
  useEffect(() => {
    const publicPaths = ['/login','/sign-up','/verify-account','/forgot-password','/brand-partner-request'];
    const path = window.location.pathname;
    const token = localStorage.getItem('accessToken');
    if (token && !userData && !publicPaths.includes(path)) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload?.role === 'USER') {
          toast.error('Access denied');
          window.location.href = '/login';
        }
      } catch (e) {
        window.location.href = '/login';
      }
    }
  }, [userData, isLogin]);

  // Hard gate before rendering any admin content
  const publicPaths = ['/login', '/sign-up', '/verify-account', '/forgot-password', '/brand-partner-request'];
  const path = window.location.pathname;
  if (!publicPaths.includes(path)) {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      window.location.replace('/login');
      return null;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload?.role === 'USER') {
        window.location.replace('/login');
        return null;
      }
    } catch (e) {
      window.location.replace('/login');
      return null;
    }
  }

  const router = createBrowserRouter([
    {
      path: "/",
      exact: true,
      element: (
        <>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />

              </div>
              <div
                className={`contentRight overflow-hidden ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <Dashboard />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/login",
      exact: true,
      element: (
        <>
          <Login />
        </>
      ),
    },
    {
      path: "/brand-partner-request",
      exact: true,
      element: (
        <>
          <BrandPartnerRequest />
        </>
      ),
    },
    {
      path: "/sign-up",
      exact: true,
      element: (
        <>
          <SignUp />
        </>
      ),
    },
    {
      path: "/requests",
      exact: true,
      element: (
        <>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"}
                  transition-all`}
              >
                <Sidebar />
              </div>
              <div className={`contentRight overflow-hidden ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}>
                <RequestsPage />
              </div>
            </div>
          </section>
        </>
      )
    },
    {
      path: "/forgot-password",
      exact: true,
      element: (
        <>
          <ForgotPassword />
        </>
      ),
    },
    {
      path: "/verify-account",
      exact: true,
      element: (
        <>
          <VerifyAccount />
        </>
      ),
    },
    {
      path: "/change-password",
      exact: true,
      element: (
        <>
          <ChangePassword />
        </>
      ),
    },
    {
      path: "/products",
      exact: true,
      element: (
        <>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <Products />
              </div>
            </div>
          </section>
        </>
      ),
    },
    // REMOVED: Old homeSlider route - replaced by hero-banners
    {
      path: "/category/list",
      exact: true,
      element: (
        <>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <CategoryList />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/subCategory/list",
      exact: true,
      element: (
        <>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <SubCategoryList />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/brands",
      exact: true,
      element: (
        <>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <BrandList />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/brands/add",
      exact: true,
      element: (
        <>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <AddBrand />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/brands/view/:id",
      exact: true,
      element: (
        <>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <ViewBrand />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/brands/edit/:id",
      exact: true,
      element: (
        <>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <EditBrand />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/brand-info",
      exact: true,
      element: (
        <>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <BrandInfo />
              </div>
            </div>
          </section>
        </>
      ),
    },
    // Hottest Brand Offers Routes
    {
      path: "/hottestBrandOffers",
      exact: true,
      element: (
        <>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <HottestBrandOffersList />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/hottestBrandOffers/add",
      exact: true,
      element: (
        <>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <AddHottestBrandOffer />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/hottestBrandOffers/edit/:id",
      exact: true,
      element: (
        <>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <EditHottestBrandOffer />
              </div>
            </div>
          </section>
        </>
      ),
    },
    // Hidden Gem Brands Routes
    {
      path: "/hiddenGemBrands",
      exact: true,
      element: (
        <>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <HiddenGemBrandsList />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/hiddenGemBrands/add",
      exact: true,
      element: (
        <>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <AddHiddenGemBrand />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/hiddenGemBrands/edit/:id",
      exact: true,
      element: (
        <>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <EditHiddenGemBrand />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/users",
      exact: true,
      element: (
        <>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <Users />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/orders",
      exact: true,
      element: (
        <>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <Orders />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/profile",
      exact: true,
      element: (
        <>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <Profile />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/product/:id",
      exact: true,
      element: (
        <>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <ProductDetails />
              </div>
            </div>
          </section>
        </>
      ),
    },

    {
      path: "/product/addSize",
      exact: true,
      element: (
        <>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <AddSize />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/products/size-stock-management",
      exact: true,
      element: (
        <>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <SizeStockManagement />
              </div>
            </div>
          </section>
        </>
      ),
    },
    // REMOVED: Old bannerV1 route - replaced by sales-banners
    // REMOVED: Old bannerlist2 route - replaced by sales-banners
    // NEW: Hero Banner Routes
    {
      path: "/hero-banners/list",
      exact: true,
      element: (
        <>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <HeroBannersList />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/hero-banners/add",
      exact: true,
      element: (
        <>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <AddHeroBanner />
              </div>
            </div>
          </section>
        </>
      ),
    },
    // NEW: Sales Banner Routes
    {
      path: "/sales-banners/list",
      exact: true,
      element: (
        <>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <SalesBannersList />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/sales-banners/add",
      exact: true,
      element: (
        <>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <AddSalesBanner />
              </div>
            </div>
          </section>
        </>
      ),
    },
    // NEW: Edit routes for both banner types
    {
      path: "/hero-banners/edit/:id",
      exact: true,
      element: (
        <>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <EditHeroBanner />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/sales-banners/edit/:id",
      exact: true,
      element: (
        <>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <EditSalesBanner />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/blog/List",
      exact: true,
      element: (
        <>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <BlogList />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/logo/manage",
      exact: true,
      element: (
        <>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <ManageLogo />
              </div>
            </div>
          </section>
        </>
      ),
    },
    // NEW: SubCategory Section Routes
    {
      path: "/subcategory-sections/list",
      exact: true,
      element: (
        <>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <SubCategorySectionsList />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/subcategory-sections/add",
      exact: true,
      element: (
        <>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <AddSubCategorySection />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/subcategory-sections/edit/:id",
      exact: true,
      element: (
        <>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <EditSubCategorySection />
              </div>
            </div>
          </section>
        </>
      ),
    },
  ]);

  const alertBox = (type, msg, callback) => {
    if (type === "success") {
      toast.success(msg)
    }
    if (type === "error") {
      toast.error(msg)
    }
    if (type === "question") {
      // Show confirmation dialog
      const confirmed = window.confirm(msg);
      if (confirmed && callback) {
        callback();
      }
    }
  }


  useEffect(() => {

    const token = localStorage.getItem('accessToken');

    if (token !== undefined && token !== null && token !== "") {
      setIsLogin(true);

      fetchDataFromApi(`/api/user/user-details`).then((res) => {
        setUserData(res.data);
        
        // Fetch brand logo for brand owners
        if (res.data?.role === 'BRAND_OWNER' && res.data?.brandId) {
          getBrandLogo(res.data.brandId);
        } else {
          // Reset brand logo for non-brand owners
          setBrandLogo(null);
          setBrandLogoLoading(false);
          setUserDataLoaded(true); // Set as loaded for non-brand owners immediately
        }
        
        if (res?.response?.data?.message === "You have not login") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          setIsLogin(false);
          alertBox("error", "Your session is closed please login again")

          //window.location.href = "/login"
        }
      })

    } else {
      setIsLogin(false);
    }

  }, [isLogin])


  useEffect(() => {
    getCat();
    getBrands(); // Add this line

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };

  }, [])


  const getCat = () => {
    fetchDataFromApi("/api/category").then((res) => {
      setCatData(res?.data)
    })
  }

  const getBrands = () => {
    fetchDataFromApi("/api/brand/get").then((res) => {
      if (res?.error === false) {
        setBrandData(res.brands || []);
      } else {
        setBrandData([]);
      }
    }).catch((error) => {
      console.error("Error fetching brands:", error);
      setBrandData([]);
    });
  }

  const getBrandLogo = (brandId) => {
    setBrandLogoLoading(true);
    fetchDataFromApi(`/api/brand/${brandId}`).then((res) => {
      if (res?.error === false && res.brand?.logo) {
        setBrandLogo(res.brand.logo);
        setBrandLogoLoading(false);
        setUserDataLoaded(true); // Set as loaded when brand logo is ready
      } else {
        // Reset to null if no brand logo found, but still set loading to false
        setBrandLogo(null);
        setBrandLogoLoading(false);
        setUserDataLoaded(true); // Set as loaded even if no logo found
      }
    }).catch((error) => {
      console.error("Error fetching brand logo:", error);
      setBrandLogo(null);
      setBrandLogoLoading(false);
      setUserDataLoaded(true); // Set as loaded even on error
    });
  }

  const getUserDetails = () => {
    const token = localStorage.getItem('accessToken');
    if (token !== undefined && token !== null && token !== "") {
      fetchDataFromApi(`/api/user/user-details`).then((res) => {
        setUserData(res.data);
        if (res?.response?.data?.message === "You have not login") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          setIsLogin(false);
          alertBox("error", "Your session is closed please login again")
        }
      })
    }
  }


  const values = {
    isSidebarOpen,
    setisSidebarOpen,
    isLogin,
    setIsLogin,
    isOpenFullScreenPanel,
    setIsOpenFullScreenPanel,
    alertBox,
    setUserData,
    userData,
    getUserDetails,
    setAddress,
    address,
    catData,
    setCatData,
    getCat,
    brandData,
    setBrandData,
    getBrands,
    brandLogo,
    setBrandLogo,
    getBrandLogo,
    brandLogoLoading,
    setBrandLogoLoading,
    userDataLoaded,
    setUserDataLoaded,
    windowWidth,
    setSidebarWidth,
    sidebarWidth,
    setProgress,
    progress
  };

  return (
    <>
      <MyContext.Provider value={values}>
        <RouterProvider router={router} />
        <LoadingBar
          color="#1565c0"
          progress={progress}
          onLoaderFinished={() => setProgress(0)}
          className="topLoadingBar"
          height={3}
        />
        <Toaster />
      </MyContext.Provider>
    </>
  );
}

export default App;
export { MyContext };
