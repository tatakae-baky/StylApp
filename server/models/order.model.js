import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    products: [
        {
            productId: {
                type: String
            },
            brandId: {
                type: mongoose.Schema.ObjectId,
                ref: 'Brand',
            },
            productTitle: {
                type: String
            },
            quantity: {
                type: Number
            },
            price: {
                type: Number
            },
            image: {
                type: String
            },
            subTotal: {
                type: Number
            },
            size: {
                type: String,
                default: ""
            },
            brandStatus: {
                type: String,
                enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
                default: 'pending'
            },
            status: {
                type: String,
                enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
                default: 'pending'
            }
        }
    ],
    paymentId: {
        type: String,
        default: ""
    },
    payment_status : {
        type : String,
        default : ""
    },
    order_status : {
        type : String,
        enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
        default : "pending"
    },
    delivery_address: {
        type: mongoose.Schema.ObjectId,
        ref: 'address'
    },
    shippingCharge: {
        type: Number,
        default: 0
    },
    totalAmt: {
        type: Number,
        default: 0
    },
    totalWithShipping: {
        type: Number,
        default: 0
    },
    brandDeliveryData: {
        type: Object,
        default: {}
    }
}, {
    timestamps: true
})

const OrderModel = mongoose.model('order', orderSchema)

export default OrderModel
