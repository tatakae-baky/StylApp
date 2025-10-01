import AddressModel from "../models/address.model.js";
import UserModel from "../models/user.model.js";

export const addAddressController = async (request, response) => {

    try {
        // SECURITY FIX: Use authenticated user ID from JWT token instead of trusting client
        const userId = request.userId;
        
        // SECURITY: Reject if client tries to specify a different userId
        if (request.body.userId && String(request.body.userId) !== String(userId)) {
            return response.status(403).json({
                error: true,
                success: false,
                message: 'Forbidden: Cannot add addresses for other users'
            });
        }

        const { 
            address_line1, 
            street, 
            apartmentName, 
            city, 
            state, 
            postcode,
            country, 
            mobile, 
            addressType 
        } = request.body;


        // if (!address_line1 || city || state || pincode || country || mobile || userId) {
        //     return response.status(500).json({
        //         message: "Please provide all the fields",
        //         error: true,
        //         success: false
        //     })
        // }


        const address = new AddressModel({
            address_line1, 
            street, 
            apartmentName, 
            city, 
            state, 
            postcode, 
            country, 
            mobile, 
            userId, 
            addressType
        })

        const savedAddress = await address.save();

        const updateCartUser = await UserModel.updateOne({ _id: userId }, {
            $push: {
                address_details: savedAddress?._id
            }
        })


        return response.status(200).json({
            data: savedAddress,
            message: "Address add successfully",
            error: false,
            success: true
        })




    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }

}


export const getAddressController = async (request, response) => {
    try {
        // SECURITY FIX: Use authenticated user ID from JWT token instead of query parameter
        const userId = request.userId;
        
        // SECURITY: Reject if client tries to query for different userId
        if (request.query.userId && String(request.query.userId) !== String(userId)) {
            return response.status(403).json({
                error: true,
                success: false,
                message: 'Forbidden: Cannot access other users\' addresses'
            });
        }

        const address = await AddressModel.find({ userId: userId }); // SECURITY FIX: Use authenticated user ID

        if (!address) {
            return response.status({
                error: true,
                success: false,
                message: "address not found"
            })
        }

        else {

            const updateUser = await UserModel.updateOne({ _id: userId }, { // SECURITY FIX: Use authenticated user ID
                $push: {
                    address: address?._id
                }
            })
            
            return response.status(200).json({
                error: false,
                success: true,
                data: address
            })
        }

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


export const deleteAddressController = async (request, response) => {
    try {
        const userId = request.userId // middleware
        const _id = request.params.id

        if(!_id){
            return response.status(400).json({
                message : "Provide _id",
                error : true,
                success : false
            })
          }


          const deleteItem  = await AddressModel.deleteOne({_id : _id, userId : userId })

          if(!deleteItem){
            return response.status(404).json({
                message:"The address in the database is not found",
                error:true,
                success:false
            })
          }
          

          return response.json({
            message : "address remove",
            error : false,
            success : true,
            data : deleteItem
          })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


export const getSingleAddressController = async (request, response) => {
        try {
            const id = request.params.id;
            const userId = request.userId; // SECURITY FIX: Get authenticated user ID

            // SECURITY FIX: Add ownership validation
            const address = await AddressModel.findOne({_id: id, userId: userId});

            if(!address){
                return response.status(404).json({
                    message: "Address not found or access denied",
                    error: true,
                    success: false
                })
            }


              return response.status(200).json({
                error: false,
                success: true,
                address:address
            })

        } catch (error) {
            return response.status(500).json({
                message: error.message || error,
                error: true,
                success: false
            })
        }
}





export async function editAddress(request, response) {
    try {

        const id  = request.params.id;
        const userId = request.userId; // SECURITY FIX: Get authenticated user ID

        const { 
            address_line1, 
            street, 
            apartmentName, 
            city, 
            state, 
            postcode, 
            country, 
            mobile, 
            addressType 
        } = request.body;

        // SECURITY FIX: Add ownership validation and update only if user owns the address
        const address = await AddressModel.findOneAndUpdate(
            { _id: id, userId: userId }, // SECURITY: Ensure user owns this address
            {
                address_line1: address_line1,
                street: street,
                apartmentName: apartmentName,
                city: city,
                state: state,
                postcode: postcode,
                country: country,
                mobile: mobile,
                addressType: addressType
            },
            { new: true }
        )

        if (!address) {
            return response.status(404).json({
                message: "Address not found or access denied",
                error: true,
                success: false
            });
        }

        return response.json({
            message: "Address Updated successfully",
            error: false,
            success: true,
            address: address
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}