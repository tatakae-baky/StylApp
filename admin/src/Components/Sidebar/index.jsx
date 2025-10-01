import { Button } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RxDashboard } from "react-icons/rx";
import { FaRegImage } from "react-icons/fa";
import { FiUsers } from "react-icons/fi";
import { RiProductHuntLine } from "react-icons/ri";
import { TbCategory} from "react-icons/tb";
import { IoBagCheckOutline } from "react-icons/io5";
import { IoMdLogOut, IoMdPricetags  } from "react-icons/io";
import { FaAngleDown } from "react-icons/fa6";
import { Collapse } from "react-collapse";
import { MyContext } from "../../App";
import { SiBloglovin } from "react-icons/si";
import { fetchDataFromApi } from "../../utils/api";
import { IoLogoBuffer } from "react-icons/io";
import { RiGeminiFill } from "react-icons/ri";



const Sidebar = () => {
  const [submenuIndex, setSubmenuIndex] = useState(null);
  const isOpenSubMenu = (index) => {
    if (submenuIndex === index) {
      setSubmenuIndex(null);
    } else {
      setSubmenuIndex(index);
    }
  };

  const context = useContext(MyContext);

  // Derive role ASAP from token to avoid admin-menu flash for BRAND_OWNER
  const parseRoleFromToken = () => {
    try {
      const t = localStorage.getItem('accessToken');
      if (!t) return null;
      const payload = JSON.parse(atob(t.split('.')[1] || ''));
      return payload?.role || null;
    } catch (e) {
      return null;
    }
  };

  const effectiveRole = context?.userData?.role || parseRoleFromToken();


  const logout = () => {
    context?.windowWidth < 992 && context?.setisSidebarOpen(false)
    setSubmenuIndex(null)

    fetchDataFromApi(`/api/user/logout?token=${localStorage.getItem('accessToken')}`, { withCredentials: true }).then((res) => {
      if (res?.error === false) {
        context.setIsLogin(false);
        context.setBrandLogo(null); // Reset brand logo on logout
        context.setBrandLogoLoading(false); // Reset loading state
        context.setUserDataLoaded(false); // Reset user data loaded state
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        history("/login")
      }
    })
  }


  const role = effectiveRole;

  // While role is unknown, render nothing to prevent flicker
  if (!role) return null;

  // Simplified sidebar for BRAND_OWNER
  if (role === 'BRAND_OWNER') {
    const brandId = context?.userData?.brandId;
    return (
      <div className={`sidebar fixed top-0 left-0 z-[52] bg-[#fff] h-full border-r border-[rgba(0,0,0,0.1)] py-2 px-4 w-[${context.isSidebarOpen === true ? `${20}%` : '0px'}]`}>
        <div className="py-2 w-full"
          onClick={() => {
            context?.windowWidth < 992 && context?.setisSidebarOpen(false)
            setSubmenuIndex(null)
          }}
        >
          <Link to="/">
            {/* Only show logo after user data is fully loaded to prevent any flicker */}
            {!context?.userDataLoaded ? (
              // Show empty space until everything is loaded
              <div className="max-w-[80px] lg:max-w-[160px] h-[50px]"></div>
            ) : context?.userData?.role === 'BRAND_OWNER' ? (
              // Brand owner: show brand logo if available
              context?.brandLogo ? (
                <img 
                  src={context.brandLogo}
                  className="max-w-[80px] lg:max-w-[160px] h-[50px]" 
                  alt="Brand Logo"
                />
              ) : (
                // No brand logo available - show empty space
                <div className="max-w-[80px] lg:max-w-[160px] h-[50px]"></div>
              )
            ) : (
              // Admin: show admin logo
              <img 
                src={localStorage.getItem('logo')}
                className="max-w-[80px] lg:max-w-[160px] h-[50px]" 
                alt="Admin Logo"
              />
            )}
          </Link>
        </div>

        <ul className="mt-4 overflow-y-scroll max-h-[80vh]">
          <li>
            <Link to="/" onClick={() => { context?.windowWidth < 992 && context?.setisSidebarOpen(false); setSubmenuIndex(null); }}>
              <Button className="w-full !capitalize !justify-start flex gap-3 text-[14px] !text-[rgba(0,0,0,0.8)] !font-[500] items-center !py-2 hover:!bg-[#f1f1f1]">
                <RxDashboard className="text-[18px]" /> <span>Dashboard</span>
              </Button>
            </Link>
          </li>

          {/* Products */}
          <li>
            <Button className="w-full !capitalize !justify-start flex gap-3 text-[14px] !text-[rgba(0,0,0,0.8)] !font-[500] items-center !py-2 hover:!bg-[#f1f1f1]" onClick={() => isOpenSubMenu(4)}>
              <RiProductHuntLine className="text-[18px]" /> <span>Products</span>
              <span className="ml-auto w-[30px] h-[30px] flex items-center justify-center">
                <FaAngleDown className={`transition-all ${submenuIndex === 4 ? "rotate-180" : ""}`} />
              </span>
            </Button>
            <Collapse isOpened={submenuIndex === 4}>
              <ul className="w-full">
                <li className="w-full">
                  <Link to="/products" onClick={() => { context?.windowWidth < 992 && context?.setisSidebarOpen(false); setSubmenuIndex(null); }}>
                    <Button className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3">
                      <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span> Product List
                    </Button>
                  </Link>
                </li>
                <li className="w-full">
                  <Button className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3" onClick={() => {
                    context.setIsOpenFullScreenPanel({ open: true, model: "Add Product" })
                    context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                    setSubmenuIndex(null)
                  }}>
                    <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                    Product Upload
                  </Button>
                </li>
                <li className="w-full">
                  <Link to="/products/size-stock-management" onClick={() => { context?.windowWidth < 992 && context?.setisSidebarOpen(false); setSubmenuIndex(null); }}>
                    <Button className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3">
                      <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span> Size Stock Management
                    </Button>
                  </Link>
                </li>
              </ul>
            </Collapse>
          </li>

          {/* Orders */}
          <li>
            <Link to="/orders" onClick={() => { context?.windowWidth < 992 && context?.setisSidebarOpen(false); setSubmenuIndex(null); }}>
              <Button className="w-full !capitalize !justify-start flex gap-3 text-[14px] !text-[rgba(0,0,0,0.8)] !font-[500] items-center !py-2 hover:!bg-[#f1f1f1]">
                <IoBagCheckOutline className="text-[18px]" /> <span>My Orders</span>
              </Button>
            </Link>
          </li>

          {/* Brand Info */}
          {brandId && (
            <li>
              <Link to="/brand-info" onClick={() => { context?.windowWidth < 992 && context?.setisSidebarOpen(false); setSubmenuIndex(null); }}>
                <Button className="w-full !capitalize !justify-start flex gap-3 text-[14px] !text-[rgba(0,0,0,0.8)] !font-[500] items-center !py-2 hover:!bg-[#f1f1f1]">
                  <IoMdPricetags className="text-[18px]" /> <span>Brand Info</span>
                </Button>
              </Link>
            </li>
          )}

          {/* Logout */}
          <li>
            <Button className="w-full !capitalize !justify-start flex gap-3 text-[14px] !text-[rgba(0,0,0,0.8)] !font-[500] items-center !py-2 hover:!bg-[#f1f1f1]" onClick={logout}>
              <IoMdLogOut className="text-[18px]" /> <span>Logout</span>
            </Button>
          </li>
        </ul>
      </div>
    );
  }

  return (
    <>
      <div className={`sidebar fixed top-0 left-0 z-[52] bg-[#fff] h-full border-r border-[rgba(0,0,0,0.1)] py-2 px-4 w-[${context.isSidebarOpen === true ? `${20}%` : '0px'}]`}>
        <div className="py-2 w-full"
          onClick={() => {
            context?.windowWidth < 992 && context?.setisSidebarOpen(false)
            setSubmenuIndex(null)
          }}
        >
          <Link to="/">
            <img
            src={localStorage.getItem('logo')}
              className="max-w-[80px] lg:max-w-[160px] h-[50px]"
            />
          </Link>
        </div>

        <ul className="mt-4 overflow-y-scroll max-h-[80vh]">
          <li>
            <Link to="/"
              onClick={() => {
                context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                setSubmenuIndex(null)
              }}
            >
              <Button className="w-full !capitalize !justify-start flex gap-3 text-[14px] !text-[rgba(0,0,0,0.8)] !font-[500] items-center !py-2 hover:!bg-[#f1f1f1]">
                <RxDashboard className="text-[18px]" /> <span>Dashboard</span>
              </Button>
            </Link>
          </li>

          <li>
            <Button
              className="w-full !capitalize !justify-start flex gap-3 text-[14px] !text-[rgba(0,0,0,0.8)] !font-[500] items-center !py-2 hover:!bg-[#f1f1f1]"
              onClick={() => isOpenSubMenu(1)}
            >
              <FaRegImage className="text-[18px]" /> <span>Hero Banners</span>
              <span className="ml-auto w-[30px] h-[30px] flex items-center justify-center">
                <FaAngleDown
                  className={`transition-all ${submenuIndex === 1 ? "rotate-180" : ""
                    }`}
                />
              </span>
            </Button>

            <Collapse isOpened={submenuIndex === 1 ? true : false}>
              <ul className="w-full">
                <li className="w-full">
                  <Link to="/hero-banners/list"
                    onClick={() => {
                      context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                      setSubmenuIndex(null)
                    }}
                  >
                    <Button className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3">
                      <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>{" "}
                      Hero Banners List
                    </Button>
                  </Link>
                </li>
                <li className="w-full">
                  <Link to="/hero-banners/add"
                    onClick={() => {
                      context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                      setSubmenuIndex(null)
                    }}
                  >
                    <Button className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3">
                      <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                      Add Hero Banner
                    </Button>
                  </Link>
                </li>
              </ul>
            </Collapse>
          </li>

          {/* Admin-only: Requests */}
          {role === 'ADMIN' && (
            <li>
              <Link to="/requests" onClick={() => { context?.windowWidth < 992 && context?.setisSidebarOpen(false); setSubmenuIndex(null); }}>
                <Button className="w-full !capitalize !justify-start flex gap-3 text-[14px] !text-[rgba(0,0,0,0.8)] !font-[500] items-center !py-2 hover:!bg-[#f1f1f1]">
                  <IoLogoBuffer className="text-[18px]" /> <span>Requests</span>
                </Button>
              </Link>
            </li>
          )}


          <li>
            <Button
              className="w-full !capitalize !justify-start flex gap-3 text-[14px] !text-[rgba(0,0,0,0.8)] !font-[500] items-center !py-2 hover:!bg-[#f1f1f1]"
              onClick={() => isOpenSubMenu(3)}
            >
              <TbCategory className="text-[18px]" /> <span>Category</span>
              <span className="ml-auto w-[30px] h-[30px] flex items-center justify-center">
                <FaAngleDown
                  className={`transition-all ${submenuIndex === 3 ? "rotate-180" : ""
                    }`}
                />
              </span>
            </Button>

            <Collapse isOpened={submenuIndex === 3 ? true : false}>
              <ul className="w-full">
                <li className="w-full">
                  <Link to="/category/list" onClick={() => {
                    context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                    setSubmenuIndex(null)
                  }}>
                    <Button className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3">
                      <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>{" "}
                      Category List

                    </Button>
                  </Link>
                </li>
                <li className="w-full">
                  <Button className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3" onClick={() => {
                    context.setIsOpenFullScreenPanel({
                      open: true,
                      model: 'Add New Category'
                    })
                    context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                    setSubmenuIndex(null)
                  }}>
                    <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                    Add a Category
                  </Button>
                </li>
                <li className="w-full">
                  <Link to="/subCategory/list" onClick={() => {
                    context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                  }}>
                    <Button className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3">
                      <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                      Sub Category List
                    </Button>
                  </Link>
                </li>
                <li className="w-full">
                  <Button className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3" onClick={() => {
                    context.setIsOpenFullScreenPanel({
                      open: true,
                      model: 'Add New Sub Category'
                    })
                    context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                    setSubmenuIndex(null)
                  }}>
                    <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                    Add a Sub Category
                  </Button>
                </li>
              </ul>
            </Collapse>
          </li>

          <li>
            <Button
              className="w-full !capitalize !justify-start flex gap-3 text-[14px] !text-[rgba(0,0,0,0.8)] !font-[500] items-center !py-2 hover:!bg-[#f1f1f1]"
              onClick={() => isOpenSubMenu(7)}
            >
              <IoMdPricetags className="text-[18px]" /> <span>Brands</span>
              <span className="ml-auto w-[30px] h-[30px] flex items-center justify-center">
                <FaAngleDown
                  className={`transition-all ${submenuIndex === 7 ? "rotate-180" : ""}`}
                />
              </span>
            </Button>

            <Collapse isOpened={submenuIndex === 7 ? true : false}>
              <ul className="w-full">
                <li className="w-full">
                  <Link to="/brands" onClick={() => {
                    context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                    setSubmenuIndex(null)
                  }}>
                    <Button className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3">
                      <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                      Brand List
                    </Button>
                  </Link>
                </li>
                <li className="w-full">
                  <Link to="/brands/add" onClick={() => {
                    context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                    setSubmenuIndex(null)
                  }}>
                    <Button className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3">
                      <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                      Add Brand
                    </Button>
                  </Link>
                </li>
              </ul>
            </Collapse>
          </li>

          <li>
            <Button
              className="w-full !capitalize !justify-start flex gap-3 text-[14px] !text-[rgba(0,0,0,0.8)] !font-[500] items-center !py-2 hover:!bg-[#f1f1f1]"
              onClick={() => isOpenSubMenu(8)}
            >
              <IoLogoBuffer className="text-[18px]" /> <span>Hottest Brand Offers</span>
              <span className="ml-auto w-[30px] h-[30px] flex items-center justify-center">
                <FaAngleDown
                  className={`transition-all ${submenuIndex === 8 ? "rotate-180" : ""}`}
                />
              </span>
            </Button>

            <Collapse isOpened={submenuIndex === 8 ? true : false}>
              <ul className="w-full">
                <li className="w-full">
                  <Link to="/hottestBrandOffers" onClick={() => {
                    context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                    setSubmenuIndex(null)
                  }}>
                    <Button className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3">
                      <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                      Offers List
                    </Button>
                  </Link>
                </li>
                <li className="w-full">
                  <Link to="/hottestBrandOffers/add" onClick={() => {
                    context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                    setSubmenuIndex(null)
                  }}>
                    <Button className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3">
                      <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                      Add Offer
                    </Button>
                  </Link>
                </li>
              </ul>
            </Collapse>
          </li>

          <li>
            <Button
              className="w-full !capitalize !justify-start flex gap-3 text-[14px] !text-[rgba(0,0,0,0.8)] !font-[500] items-center !py-2 hover:!bg-[#f1f1f1]"
              onClick={() => isOpenSubMenu(9)}
            >
              <RiGeminiFill className="text-[18px]" /> <span>Hidden Gem Brands</span>
              <span className="ml-auto w-[30px] h-[30px] flex items-center justify-center">
                <FaAngleDown
                  className={`transition-all ${submenuIndex === 9 ? "rotate-180" : ""}`}
                />
              </span>
            </Button>

            <Collapse isOpened={submenuIndex === 9 ? true : false}>
              <ul className="w-full">
                <li className="w-full">
                  <Link to="/hiddenGemBrands" onClick={() => {
                    context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                    setSubmenuIndex(null)
                  }}>
                    <Button className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3">
                      <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                      Brands List
                    </Button>
                  </Link>
                </li>
                <li className="w-full">
                  <Link to="/hiddenGemBrands/add" onClick={() => {
                    context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                    setSubmenuIndex(null)
                  }}>
                    <Button className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3">
                      <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                      Add Brand
                    </Button>
                  </Link>
                </li>
              </ul>
            </Collapse>
          </li>

          <li>
            <Button
              className="w-full !capitalize !justify-start flex gap-3 text-[14px] !text-[rgba(0,0,0,0.8)] !font-[500] items-center !py-2 hover:!bg-[#f1f1f1]"
              onClick={() => isOpenSubMenu(4)}
            >
              <RiProductHuntLine className="text-[18px]" />{" "}
              <span>Products</span>
              <span className="ml-auto w-[30px] h-[30px] flex items-center justify-center">
                <FaAngleDown
                  className={`transition-all ${submenuIndex === 4 ? "rotate-180" : ""
                    }`}
                />
              </span>
            </Button>

            <Collapse isOpened={submenuIndex === 4 ? true : false}>
              <ul className="w-full">
                <li className="w-full">
                  <Link to="/products" onClick={() => {
                    context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                    setSubmenuIndex(null)
                  }}>
                    <Button className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3">
                      <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>{" "}
                      Product List
                    </Button>
                  </Link>
                </li>
                <li className="w-full">
                  <Button className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3" onClick={() => {
                    context.setIsOpenFullScreenPanel({
                      open: true,
                      model: "Add Product"
                    })
                    context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                    setSubmenuIndex(null)
                  }}>
                    <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                    Product Upload
                  </Button>
                </li>

                <li className="w-full">
                  <Link to="/product/addSize"
                    onClick={() => {
                      context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                      setSubmenuIndex(null)
                    }}
                  >
                    <Button className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3">
                      <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                      Add Product SIZE
                    </Button>
                  </Link>
                </li>

                <li className="w-full">
                  <Link to="/products/size-stock-management"
                    onClick={() => {
                      context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                      setSubmenuIndex(null)
                    }}
                  >
                    <Button className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3">
                      <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                      Size Stock Management
                    </Button>
                  </Link>
                </li>
              </ul>
            </Collapse>
          </li>



          <li>
            <Link to="/users"
              onClick={() => {
                context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                setSubmenuIndex(null)
              }}
            >
              <Button className="w-full !capitalize !justify-start flex gap-3 text-[14px] !text-[rgba(0,0,0,0.8)] !font-[500] items-center !py-2 hover:!bg-[#f1f1f1]">
                <FiUsers className="text-[18px]" /> <span>Users</span>
              </Button>
            </Link>
          </li>


          <li>
            <Link to="/orders"
              onClick={() => {
                context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                setSubmenuIndex(null)
              }}
            >
              <Button className="w-full !capitalize !justify-start flex gap-3 text-[14px] !text-[rgba(0,0,0,0.8)] !font-[500] items-center !py-2 hover:!bg-[#f1f1f1]">
                <IoBagCheckOutline className="text-[20px]" /> <span>Orders</span>
              </Button>
            </Link>
          </li>




          <li>
            <Button
              className="w-full !capitalize !justify-start flex gap-3 text-[14px] !text-[rgba(0,0,0,0.8)] !font-[500] items-center !py-2 hover:!bg-[#f1f1f1]"
              onClick={() => isOpenSubMenu(5)}
            >
              <RiProductHuntLine className="text-[18px]" />
              <span>Sales Banners</span>
              <span className="ml-auto w-[30px] h-[30px] flex items-center justify-center">
                <FaAngleDown
                  className={`transition-all ${submenuIndex === 5 ? "rotate-180" : ""
                    }`}
                />
              </span>
            </Button>

            <Collapse isOpened={submenuIndex === 5 ? true : false}>
              <ul className="w-full">
                <li className="w-full">
                  <Link to="/sales-banners/list"
                    onClick={() => {
                      context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                      setSubmenuIndex(null)
                    }}
                  >
                    <Button className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3">
                      <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>{" "}
                      Sales Banners List
                    </Button>
                  </Link>
                </li>
                <li className="w-full">
                  <Link to="/sales-banners/add"
                    onClick={() => {
                      context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                      setSubmenuIndex(null)
                    }}
                  >
                    <Button className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3">
                      <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                      Add Sales Banner
                    </Button>
                  </Link>
                </li>
              </ul>
            </Collapse>
          </li>

          <li>
            <Button
              className="w-full !capitalize !justify-start flex gap-3 text-[14px] !text-[rgba(0,0,0,0.8)] !font-[500] items-center !py-2 hover:!bg-[#f1f1f1]"
              onClick={() => isOpenSubMenu(8)}
            >
              <TbCategory className="text-[18px]" />
              <span>SubCategory Sections</span>
              <span className="ml-auto w-[30px] h-[30px] flex items-center justify-center">
                <FaAngleDown
                  className={`transition-all ${submenuIndex === 8 ? "rotate-180" : ""
                    }`}
                />
              </span>
            </Button>

            <Collapse isOpened={submenuIndex === 8 ? true : false}>
              <ul className="w-full">
                <li className="w-full">
                  <Link to="/subcategory-sections/list"
                    onClick={() => {
                      context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                      setSubmenuIndex(null)
                    }}
                  >
                    <Button className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3">
                      <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>{" "}
                      SubCategory Sections List
                    </Button>
                  </Link>
                </li>
                <li className="w-full">
                  <Link to="/subcategory-sections/add"
                    onClick={() => {
                      context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                      setSubmenuIndex(null)
                    }}
                  >
                    <Button className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3">
                      <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                      Add SubCategory Section
                    </Button>
                  </Link>
                </li>
              </ul>
            </Collapse>
          </li>


          <li>
            <Button
              className="w-full !capitalize !justify-start flex gap-3 text-[14px] !text-[rgba(0,0,0,0.8)] !font-[500] items-center !py-2 hover:!bg-[#f1f1f1]"
              onClick={() => isOpenSubMenu(6)}
            >
              <SiBloglovin className="text-[18px]" />
              <span>Blogs</span>
              <span className="ml-auto w-[30px] h-[30px] flex items-center justify-center">
                <FaAngleDown
                  className={`transition-all ${submenuIndex === 6 ? "rotate-180" : ""
                    }`}
                />
              </span>
            </Button>

            <Collapse isOpened={submenuIndex === 6 ? true : false}>
              <ul className="w-full">
                <li className="w-full">
                  <Link to="/blog/List" onClick={() => {
                    context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                    setSubmenuIndex(null)
                  }}>
                    <Button className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3">
                      <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                      Blog List
                    </Button>
                  </Link>
                </li>
                <li className="w-full">
                  <Button className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3" onClick={() => {
                    context.setIsOpenFullScreenPanel({
                      open: true,
                      model: "Add Blog"
                    })
                    context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                    setSubmenuIndex(null)
                  }}>
                    <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                    Add Blog
                  </Button>
                </li>


              </ul>
            </Collapse>
          </li>


          <li>
            <Link to="/logo/manage">
              <Button
                className="w-full !capitalize !justify-start flex gap-3 text-[14px] !text-[rgba(0,0,0,0.8)] !font-[500] items-center !py-2 hover:!bg-[#f1f1f1]"
              >
                <IoLogoBuffer className="text-[18px]" />
                <span>Manage Logo</span>
              </Button>
            </Link>
          </li>

          <li>
            <Button className="w-full !capitalize !justify-start flex gap-3 text-[14px] !text-[rgba(0,0,0,0.8)] !font-[500] items-center !py-2 hover:!bg-[#f1f1f1]" onClick={logout}>
              <IoMdLogOut className="text-[20px]" /> <span>Logout</span>
            </Button>
          </li>
        </ul>



      </div>


      {
        context?.windowWidth < 920 && context?.isSidebarOpen === true &&
        <div className="sidebarOverlay pointer-events-none fixed top-0 left-0 bg-[rgba(0,0,0,0.5)] w-full h-full
       z-[51]" onClick={() => {
            context?.setisSidebarOpen(false)
            setSubmenuIndex(null)
          }}>
        </div>
      }



    </>
  );
};

export default Sidebar;
