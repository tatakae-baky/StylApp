import React from "react";
import { IoMdCheckmark } from "react-icons/io";


const Badge = (props) => {
  const sizeClasses = props.size === 'small' 
    ? 'py-0.5 px-2 text-[10px]' 
    : 'py-1 px-4 text-[11px]';
    
  return (
    <span
      className={`inline-flex items-center justify-center gap-1 ${sizeClasses} rounded-full capitalize ${
        props.status === "pending" && "bg-yellow-500 text-white"
      } ${(props.status === "confirmed" || props.status === "confirm") && "bg-blue-500 text-white"} ${
        props.status === "shipped" && "bg-purple-500 text-white"
      } ${props.status === "delivered" && "bg-green-700 text-white"} ${
        props.status === "cancelled" && "bg-red-500 text-white"
      }`}
    >
      {props.status === "delivered" && <IoMdCheckmark size={props.size === 'small' ? 10 : 13} />}
      {props.status === "confirm" ? "confirmed" : props.status}
    </span>
  );
};

export default Badge;
