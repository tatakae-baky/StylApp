import Button from "@mui/material/Button";
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "../Navigation/style.css";
import { MyContext } from "../../../App";
import MobileNav from "./MobileNav";
import BrandMegaMenu from "../../BrandMegaMenu";

const Navigation = ({ onlyMobileNav = false }) => {
  const [catData, setCatData] = useState([]);

  const context = useContext(MyContext);

  useEffect(() => {
    setCatData(context?.catData);
  }, [context?.catData]);





  return (
    <>
      {/* Only render the main navigation on desktop or when onlyMobileNav is false */}
      {!onlyMobileNav && (
        <nav className="navigation pt-4">
          <div className="flex items-center justify-center">
            <div className="w-full">
              <ul className="flex items-center justify-center gap-8 nav">
                <li className="list-none">
                  <Link to="/" className="link transition">
                    <Button className="link transition !text-[13px] !font-medium !text-[#242424] hover:!text-[#FF2E4D]">
                      Home
                    </Button>
                  </Link>
                </li>

              <li className="list-none">
                <BrandMegaMenu />
              </li>

              {/* Category Navigation Items */}
              {catData?.length !== 0 ? (
                catData?.map((cat, index) => {
                  return (
                    <li className="list-none relative" key={index}>
                      <Link to={`/products?catId=${cat?._id}`} className="link transition">
                        <Button className="link transition !text-[13px] !font-[500] !text-[#242424]  hover:!text-[#FF2E4D] !py-3 !px-0 !normal-case ">
                          {cat?.name}
                        </Button>
                      </Link>

                      {
                        cat?.children?.length !== 0 &&
                        <div className="submenu absolute top-[120%] left-[0%] min-w-[150px] bg-white shadow-md opacity-0 transition-all z-50">
                          <ul>
                            {
                              cat?.children?.map((subCat, index_) => {
                                return (
                                  <li className="list-none w-full relative" key={index_}>
                                    <Link to={`/products?subCatId=${subCat?._id}`} className="w-full">
                                      <Button className="!text-[rgba(0,0,0,0.8)] w-full !text-left !justify-start !rounded-none !py-2 !text-[13px] hover:!bg-gray-50">
                                        {subCat?.name}
                                      </Button>

                                      {
                                        subCat?.children?.length !== 0 &&
                                        <div className="submenu absolute top-[0%] left-[100%] min-w-[150px] bg-white shadow-md opacity-0 transition-all z-50">
                                          <ul>
                                            {
                                              subCat?.children?.map((thirdLavelCat, index__) => {
                                                return (
                                                  <li className="list-none w-full" key={index__}>
                                                    <Link to={`/products?thirdLavelCatId=${thirdLavelCat?._id}`} className="w-full">
                                                      <Button className="!text-[rgba(0,0,0,0.8)] w-full !text-left !justify-start !rounded-none !py-2 !text-[13px] hover:!bg-gray-50">
                                                        {thirdLavelCat?.name}
                                                      </Button>
                                                    </Link>
                                                  </li>)
                                              })
                                            }
                                          </ul>
                                        </div>
                                      }
                                    </Link>
                                  </li>
                                )
                              })
                            }
                          </ul>
                        </div>
                      }
                    </li>
                  )
                })
              ) : (
                /* Category Loading Skeletons */
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((index) => (
                  <li className="list-none" key={`skeleton-${index}`}>
                    <div className="py-3 px-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                    </div>
                  </li>
                ))
              )}


            </ul>
          </div>
        </div>
      </nav>
      )}

      {/* Always render MobileNav on mobile regardless of onlyMobileNav prop */}
      {
        context?.windowWidth < 992 && <MobileNav />
      }
    </>
  );
};

export default Navigation;
