import CartProductModel from "../models/cartProduct.modal.js";
import ProductModel from "../models/product.modal.js";

export const addToCartItemController = async (request, response) => {
    try {
        const userId = request.userId //middleware
        const { productTitle, image, rating, price, oldPrice, quantity, subTotal, productId, countInStock, discount, size, weight, ram, brand } = request.body

        if (!productId) {
            return response.status(402).json({
                message: "Provide productId",
                error: true,
                success: false
            })
        }

        // Size-specific stock validation (no reservation)
        if (size) {
            try {
                const product = await ProductModel.findById(productId);
                if (!product) {
                    return response.status(404).json({
                        message: "Product not found",
                        error: true,
                        success: false
                    });
                }

                // Check if size exists and has enough stock
                const sizeStock = product.sizeStock.find(s => s.size === size);
                if (!sizeStock) {
                    return response.status(400).json({
                        message: `Size ${size} is not available for this product`,
                        error: true,
                        success: false
                    });
                }

                const availableStock = sizeStock.stock - sizeStock.sold;
                if (availableStock < quantity) {
                    return response.status(400).json({
                        message: `Only ${availableStock} units available for size ${size}`,
                        error: true,
                        success: false,
                        availableStock: availableStock
                    });
                }

                // No stock reservation - just validate availability

            } catch (stockError) {
                return response.status(400).json({
                    message: stockError.message,
                    error: true,
                    success: false
                });
            }
        }

        const checkItemCart = await CartProductModel.findOne({
            userId: userId,
            productId: productId,
            size: size || ""
        })

        if (checkItemCart) {
            return response.status(400).json({
                message: "Item is already in cart"
            })
        }

        const cartItem = new CartProductModel({
            productTitle: productTitle,
            image: image,
            rating: rating,
            price: price,
            oldPrice: oldPrice,
            quantity: quantity,
            subTotal: subTotal,
            productId: productId,
            countInStock: countInStock,
            userId: userId,
            brand: brand,
            discount: discount,
            size: size,
            weight: weight,
            ram: ram
        })

        const save = await cartItem.save();

        return response.status(200).json({
            data: save,
            message: "Item added successfully",
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


export const getCartItemController = async (request, response) => {
    try {
        const userId = request.userId;

        const cartItems = await CartProductModel.find({
            userId: userId
        });

        return response.json({
            data: cartItems,
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

export const updateCartItemQtyController = async (request, response) => {
    try {

        const userId = request.userId
        const { _id, qty , subTotal, size, weight, ram} = request.body



        if (!_id || !qty) {
            return response.status(400).json({
                message: "provide _id, qty"
            })
        }

        const updateCartitem = await CartProductModel.updateOne(
            {
                _id: _id,
                userId: userId
            },
            {
                quantity: qty,
                subTotal:subTotal,
                size:size,
                ram:ram,
                weight:weight
            },
            { new: true }
        )


        return response.json({
            message: "Cart item updated successfully",
            success: true,
            error: false,
            data: updateCartitem
        })



    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


export const deleteCartItemQtyController = async (request, response) => {
    try {
        const userId = request.userId // middleware
        const { id } = request.params


        if(!id){
            return response.status(400).json({
                message : "Provide _id",
                error : true,
                success : false
            })
          }


          const deleteCartItem  = await CartProductModel.deleteOne({_id : id, userId : userId })

          if(!deleteCartItem){
            return response.status(404).json({
                message:"The product in the cart is not found",
                error:true,
                success:false
            })
          }
         

          return response.status(200).json({
            message : "Item removed successfully",
            error : false,
            success : true,
            data : deleteCartItem
          })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}



export const emptyCartController = async (request, response) => {
    try {
        // SECURITY FIX: Use authenticated user ID from JWT token instead of URL parameter
        const userId = request.userId;

        await CartProductModel.deleteMany({userId:userId })

          return response.status(200).json({
            error : false,
            success : true,
          })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}