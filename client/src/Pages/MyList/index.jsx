import React, { useContext, useEffect, useState } from "react";

import MyListItems from "./myListItems";
import AccountSidebar from "../../components/AccountSidebar";
import { MyContext } from "../../App";
import Button from "@mui/material/Button";
import { Link, useNavigate } from "react-router-dom";

const MyList = () => {

  const context = useContext(MyContext);
  const history = useNavigate();

  // Add authentication guard
  useEffect(() => {
    if (!context.isLogin) {
      history('/login');
    }
  }, [context.isLogin, history]);

  useEffect(()=>{
    window.scrollTo(0,0);
  },[]);

  return (
    <section className="py-4 lg:py-6 pb-20 w-full">
      <div className="container flex flex-col md:flex-row gap-5">
        <div className="col1 w-full md:w-[20%] hidden lg:block">
          <AccountSidebar />
        </div>

        <div className="col2 w-full lg:w-[70%]">
          <div className="bg-white border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-[20px] font-[600] text-gray-900 mb-2">My List</h2>
              <p className="mt-0 mb-0">
                There are <span className="font-bold text-primary">{context?.myListData?.length}</span>{" "}
                products in your My List
              </p>
            </div>


            {
              context?.myListData?.length !== 0 ? context?.myListData?.map((item, index) => {
                return (
                  <MyListItems item={item} />
                )
              })

                :

                <div className="flex items-center justify-center flex-col py-10 px-3 gap-5">
                  <img src="/mylistempty.png" className="w-[100px]" />
                  <h3>My List is currently empty</h3>
                  <Link to="/"><button className="bg-[#FF2E4D] text-white py-2 px-6 text-[16px] font-[600] hover:bg-[#e63852] transition-all duration-200 flex items-center justify-center gap-2">Continue Shopping</button></Link>
                </div>
            }


          </div>
        </div>
      </div>
    </section>
  );
};

export default MyList;
