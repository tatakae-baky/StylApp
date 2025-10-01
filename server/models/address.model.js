import mongoose from "mongoose";

const addressSchema = mongoose.Schema({
    address_line1 : {
        type : String,
        default : ""
    },
    street : {
        type : String,
        default : ""
    },
    apartmentName : {
        type : String,
        default : ""
    },
    city : {
        type : String,
        default : ""
    },
    state : {
        type : String,
        default : ""
    },
    pincode : {
        type : String
    },
    postcode : {
        type : String
    },
    country : {
        type : String,
        default : "Bangladesh"
    },
    mobile : {
        type : String,
        default : ""
    },
    status : {
        type : Boolean,
        default : true
    },
    selected : {
        type : Boolean,
        default : true
    },
    landmark : {
        type : String,
        default : ""
    },
    addressType: {
        type: String,
        enum: ["Home", "Office",],
    },
    userId : {
        type : String,
        default : ""
    }
},{
    timestamps : true
})


const AddressModel = mongoose.model('address',addressSchema)

export default AddressModel