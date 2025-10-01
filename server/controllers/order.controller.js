import OrderModel from "../models/order.model.js";
import ProductModel from '../models/product.modal.js';
import UserModel from '../models/user.model.js';
import AddressModel from '../models/address.model.js';
import BrandModel from '../models/brand.model.js';
import OrderConfirmationEmail from "../utils/orderEmailTemplate.js";
import AdminOrderNotificationEmail from "../utils/adminOrderEmailTemplate.js";
import BrandOrderNotificationEmail from "../utils/brandOrderEmailTemplate.js";
import OrderStatusUpdateEmail from "../utils/orderStatusEmailTemplate.js";
import sendEmailFun from "../config/sendEmail.js";
import { calculateBrandDeliveryCharges } from "../utils/brandDeliveryHelper.js";

/**
 * Get brand emails and their associated products from order
 * @param {Array} products - Array of products in the order
 * @returns {Object} - Object with brand emails and their products
 */
const getBrandEmailsAndProducts = async (products) => {
    try {
        const brandMap = new Map();
        
        // Group products by brand
        for (const product of products) {
            const productDetails = await ProductModel.findById(product.productId).populate('brand');
            if (productDetails && productDetails.brand && productDetails.brand.email) {
                const brandId = productDetails.brand._id.toString();
                
                if (!brandMap.has(brandId)) {
                    brandMap.set(brandId, {
                        brandName: productDetails.brand.name,
                        brandEmail: productDetails.brand.email,
                        products: []
                    });
                }
                
                brandMap.get(brandId).products.push(product);
            }
        }
        
        return Array.from(brandMap.values());
    } catch (error) {
        return [];
    }
};

export const createOrderController = async (request, response) => {
    try {
        // SECURITY FIX: Use authenticated user ID from JWT token instead of trusting client
        const userId = request.userId;
        
        // SECURITY: Reject if client tries to specify a different userId
        if (request.body.userId && String(request.body.userId) !== String(userId)) {
            return response.status(403).json({
                error: true,
                success: false,
                message: 'Forbidden: Cannot create orders for other users'
            });
        }

        // Get delivery address to calculate shipping
        const deliveryAddress = await AddressModel.findById(request.body.delivery_address);
        let city = 'Outside Dhaka'; // Default
        
        if (deliveryAddress && deliveryAddress.city) {
            city = deliveryAddress.city.trim();
        }
        
        // Calculate brand-based delivery charges
        const brandDeliveryData = await calculateBrandDeliveryCharges(request.body.products, city);
        
        // Calculate total amount from string (removing currency formatting)
        const cleanTotalAmt = typeof request.body.totalAmt === 'string' 
            ? parseFloat(request.body.totalAmt.replace(/[^0-9.]/g, ''))
            : request.body.totalAmt;
            
        const totalWithShipping = cleanTotalAmt + brandDeliveryData.totalDeliveryCharges;

        // augment products with brandId and default brandStatus
        const itemsWithBrand = [];
        for (const p of request.body.products || []) {
            try {
                const prod = await ProductModel.findById(p.productId).select('brand name');
                itemsWithBrand.push({
                    ...p,
                    brandId: prod?.brand || null,
                    brandStatus: 'pending'
                });
            } catch (e) {
                itemsWithBrand.push({ ...p, brandStatus: 'pending' });
            }
        }

        let order = new OrderModel({
            userId: userId, // SECURITY FIX: Use authenticated user ID
            products: itemsWithBrand,
            paymentId: request.body.paymentId,
            payment_status: request.body.payment_status,
            delivery_address: request.body.delivery_address,
            totalAmt: cleanTotalAmt,
            shippingCharge: brandDeliveryData.totalDeliveryCharges,
            totalWithShipping: totalWithShipping,
            brandDeliveryData: brandDeliveryData, // Store brand delivery breakdown
            date: request.body.date
        });

        if (!order) {
            response.status(500).json({
                error: true,
                success: false
            })
        }

        order = await order.save();

        // Note: Stock reduction now happens only when admin confirms the order
        // This prevents stock reduction for pending/unconfirmed orders

        const user = await UserModel.findOne({ _id: userId }) // SECURITY FIX: Use authenticated user ID

        // 1. Send Customer Confirmation Email
        if (user?.email) {
            await sendEmailFun({
                sendTo: [user.email],
                subject: `Order Received - Order #${order._id}`,
                text: "",
                html: OrderConfirmationEmail(user.name, order, deliveryAddress)
            });
        }

        // 2. Send Admin Notification Email
        const adminEmail = process.env.ADMIN_EMAIL || "admin@styl-bd.com";
        await sendEmailFun({
            sendTo: [adminEmail],
            subject: `🔔 New Order Alert #${order._id} - Admin Dashboard`,
            text: "",
            html: AdminOrderNotificationEmail(user?.name, order, user?.email, deliveryAddress)
        });

        // 3. Send Brand Notification Emails using brand groups
        for (const brandGroup of brandDeliveryData.brandGroups) {
            // Find brand email
            try {
                const brand = await BrandModel.findOne({ 
                    $or: [
                        { _id: brandGroup.brandId },
                        { name: brandGroup.brandName }
                    ]
                });
                
                if (brand && brand.email) {
                    await sendEmailFun({
                        sendTo: [brand.email],
                        subject: `🛍️ New Order for ${brandGroup.brandName} - Order #${order._id}`,
                        text: "",
                        html: BrandOrderNotificationEmail(brandGroup.brandName, user?.name, order, brandGroup.products, deliveryAddress)
                    });
                }
            } catch (emailError) {
                console.log('Error sending brand email:', emailError);
            }
        }


        return response.status(200).json({
            error: false,
            success: true,
            message: "Order Placed",
            order: order,
            brandDeliveryData: brandDeliveryData
        });


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


export async function getOrderDetailsController(request, response) {
    try {
        const userId = request.userId // order id

        const { page, limit } = request.query;

        const orderlist = await OrderModel.find().sort({ createdAt: -1 }).populate('delivery_address userId').skip((page - 1) * limit).limit(parseInt(limit));

        const total = await OrderModel.countDocuments(orderlist);

        return response.json({
            message: "order list",
            data: orderlist,
            error: false,
            success: true,
            total: total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export async function getUserOrderDetailsController(request, response) {
    try {
        const userId = request.userId // order id

        const { page, limit } = request.query;

        const orderlist = await OrderModel.find({ userId: userId }).sort({ createdAt: -1 }).populate('delivery_address userId').skip((page - 1) * limit).limit(parseInt(limit));

        const orderTotal = await OrderModel.find({ userId: userId }).sort({ createdAt: -1 }).populate('delivery_address userId');

        const total = await orderTotal?.length;

        return response.json({
            message: "order list",
            data: orderlist,
            error: false,
            success: true,
            total: total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// List orders for a specific brand (for BRAND_OWNER)
export async function getBrandOrdersController(request, response) {
    try {
        const { page = 1, limit = 10 } = request.query;
        const brandId = request.user?.brandId || request.query.brandId;
        if (!brandId) return response.status(400).json({ error: true, success: false, message: 'brandId required' });

        // Use the brandId field that's stored directly in products array
        const query = { 'products.brandId': brandId };
        
        const orders = await OrderModel.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate('delivery_address userId');

        const total = await OrderModel.countDocuments(query);

        // Filter products to include only those for this brand in response
        const filtered = orders.map(order => ({
            ...order.toObject(),
            products: (order.products || []).filter(product => String(product.brandId) === String(brandId))
        }));

        return response.json({ 
            error: false, 
            success: true, 
            data: filtered, 
            total, 
            page: parseInt(page), 
            totalPages: Math.ceil(total / limit) 
        });
    } catch (error) {
        return response.status(500).json({ message: error.message || error, error: true, success: false });
    }
}

export async function getTotalOrdersCountController(request, response) {
    try {
        const ordersCount = await OrderModel.countDocuments();
        return response.status(200).json({
            error: false,
            success: true,
            count: ordersCount
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export const updateOrderStatusController = async (request, response) => {
    try {
        const { order_status } = request.body;
        const { id } = request.params; // Get ID from route params
        const user = request.user; // From auth middleware

        // Get current order before updating
        const currentOrder = await OrderModel.findById(id).populate('delivery_address userId');
        
        if (!currentOrder) {
            return response.status(404).json({
                message: "Order not found",
                error: true,
                success: false
            });
        }

        // Store previous product statuses BEFORE any updates (for both ADMIN and BRAND_OWNER)
        const previousProductStatuses = currentOrder.products.map(p => ({
            productId: p.productId,
            brandId: p.brandId,
            previousStatus: p.status || p.brandStatus || 'pending'
        }));

        // For BRAND_OWNER: Check if they have products in this order
        if (user.role === 'BRAND_OWNER') {
            const brandProducts = currentOrder.products.filter(product => 
                product.brandId && String(product.brandId) === String(user.brandId)
            );

            if (brandProducts.length === 0) {
                return response.status(403).json({
                    message: "You don't have products in this order",
                    error: true,
                    success: false
                });
            }

            // Update status for all products belonging to this brand owner
            for (let i = 0; i < currentOrder.products.length; i++) {
                if (currentOrder.products[i].brandId && 
                    String(currentOrder.products[i].brandId) === String(user.brandId)) {
                    currentOrder.products[i].status = order_status;
                    // Also update brandStatus for backward compatibility
                    currentOrder.products[i].brandStatus = order_status;
                }
            }

            // Set the order status to the brand's status - no auto-calculation
            currentOrder.order_status = order_status;

            // Handle size-specific stock reduction when order is confirmed
            if (order_status === 'confirmed') {
                for (let i = 0; i < currentOrder.products.length; i++) {
                    const orderItem = currentOrder.products[i];
                    // Only reduce stock for this brand owner's products that weren't already confirmed
                    if (orderItem.brandId && String(orderItem.brandId) === String(user.brandId)) {
                        const prevStatus = previousProductStatuses.find(p => 
                            p.productId === orderItem.productId && 
                            String(p.brandId) === String(user.brandId)
                        )?.previousStatus || 'pending';
                        
                        // Only reduce stock if product wasn't already confirmed
                        if (prevStatus !== 'confirmed') {
                            await updateSizeSpecificStock(orderItem);
                        }
                    }
                }
            }

            // Handle sales tracking for delivered orders
            if (order_status === 'delivered') {
                for (let i = 0; i < currentOrder.products.length; i++) {
                    const orderItem = currentOrder.products[i];
                    // Only count sales for this brand owner's products that weren't already delivered
                    if (orderItem.brandId && String(orderItem.brandId) === String(user.brandId)) {
                        const prevStatus = previousProductStatuses.find(p => 
                            p.productId === orderItem.productId && 
                            String(p.brandId) === String(user.brandId)
                        )?.previousStatus || 'pending';
                        
                        // Only increment sales if product wasn't already delivered
                        if (prevStatus !== 'delivered') {
                            await updateProductSales(orderItem);
                        }
                    }
                }
            }

        } else {
            // For ADMIN: Only allow read-only access (monitoring purposes)
            return response.status(403).json({
                message: "Order status can only be updated by brand owners",
                error: true,
                success: false
            });
        }

        const previousStatus = currentOrder.order_status;

        // Save the updated order
        await currentOrder.save();

        // Get brand name for email (we'll fetch it separately since we can't populate)
        let brandName = 'Brand';
        try {
            const brand = await BrandModel.findById(user.brandId).select('name');
            if (brand) brandName = brand.name;
        } catch (error) {
            // Brand name fetch failed, continue with default
        }

        // Send status update email to customer (skip if status is pending)
        if (order_status !== 'pending' && currentOrder.userId && currentOrder.userId.email) {
            await sendEmailFun({
                sendTo: [currentOrder.userId.email],
                subject: `Order Update from ${brandName}: ${order_status.charAt(0).toUpperCase() + order_status.slice(1)} - Order #${currentOrder._id}`,
                text: "",
                html: OrderStatusUpdateEmail(currentOrder.userId.name, currentOrder, order_status, brandName)
            });
        }

        // Determine message based on what actually happened
        let successMessage = "Order status updated successfully";
        if (user.role === 'BRAND_OWNER') {
            const brandProductsCount = currentOrder.products.filter(p => 
                p.brandId && String(p.brandId) === String(user.brandId)
            ).length;
            
            successMessage = `Your ${brandProductsCount} product(s) status updated to "${order_status}" successfully`;
        }

        return response.json({
            message: successMessage,
            success: true,
            error: false,
            data: {
                order_status: currentOrder.order_status,
                updated_products: currentOrder.products.filter(p => 
                    p.brandId && String(p.brandId) === String(user.brandId)
                )
            }
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

/**
 * Update size-specific stock when order is confirmed
 * @param {Object} orderItem - Order item containing productId, size, quantity
 */
const updateSizeSpecificStock = async (orderItem) => {
    try {
        const product = await ProductModel.findById(orderItem.productId);
        if (!product) {
            return;
        }

        if (orderItem.size && orderItem.size.trim() !== '') {
            // Handle size-specific stock reduction
            const sizeIndex = product.sizeStock.findIndex(s => s.size === orderItem.size);
            if (sizeIndex !== -1) {
                const sizeStock = product.sizeStock[sizeIndex];
                
                // Reduce actual stock
                const stockToReduce = Math.min(sizeStock.stock, orderItem.quantity);
                product.sizeStock[sizeIndex].stock = Math.max(0, sizeStock.stock - stockToReduce);
                
                // Recalculate total countInStock from all size stocks
                product.countInStock = product.sizeStock.reduce((total, item) => total + item.stock, 0);
                
            } else {
                // Fallback to general stock reduction
                product.countInStock = Math.max(0, product.countInStock - orderItem.quantity);
            }
        } else {
            // For products without sizes, reduce general stock
            product.countInStock = Math.max(0, product.countInStock - orderItem.quantity);
        }

        await product.save();

    } catch (error) {
        throw error;
    }
};

/**
 * Update sales count when order is delivered
 * @param {Object} orderItem - Order item containing productId, size, quantity
 */
const updateProductSales = async (orderItem) => {
    try {
        const product = await ProductModel.findById(orderItem.productId);
        if (!product) {
            return;
        }

        if (orderItem.size && orderItem.size.trim() !== '') {
            // Handle size-specific sales increment
            const sizeIndex = product.sizeStock.findIndex(s => s.size === orderItem.size);
            if (sizeIndex !== -1) {
                // Increase sold count for size-specific tracking
                product.sizeStock[sizeIndex].sold = (product.sizeStock[sizeIndex].sold || 0) + orderItem.quantity;
            }
        }

        // Update total sales count (regardless of size)
        product.sale = (product.sale || 0) + orderItem.quantity;

        await product.save();

    } catch (error) {
        throw error;
    }
};

export const totalSalesController = async (request, response) => {
    try {
        const currentYear = new Date().getFullYear();

        const ordersList = await OrderModel.find();

        let totalSales = 0;
        let monthlySales = [
            {
                name: 'JAN',
                TotalSales: 0
            },
            {
                name: 'FEB',
                TotalSales: 0
            },
            {
                name: 'MAR',
                TotalSales: 0
            },
            {
                name: 'APRIL',
                TotalSales: 0
            },
            {
                name: 'MAY',
                TotalSales: 0
            },
            {
                name: 'JUNE',
                TotalSales: 0
            },
            {
                name: 'JULY',
                TotalSales: 0
            },
            {
                name: 'AUG',
                TotalSales: 0
            },
            {
                name: 'SEP',
                TotalSales: 0
            },
            {
                name: 'OCT',
                TotalSales: 0
            },
            {
                name: 'NOV',
                TotalSales: 0
            },
            {
                name: 'DEC',
                TotalSales: 0
            },
        ]


        for (let i = 0; i < ordersList.length; i++) {
            totalSales = totalSales + parseInt(ordersList[i].totalAmt);
            const str = JSON.stringify(ordersList[i]?.createdAt);
            const year = str.substr(1, 4);
            const monthStr = str.substr(6, 8);
            const month = parseInt(monthStr.substr(0, 2));

            if (currentYear == year) {

                if (month === 1) {
                    monthlySales[0] = {
                        name: 'JAN',
                        TotalSales: monthlySales[0].TotalSales = parseInt(monthlySales[0].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

                if (month === 2) {

                    monthlySales[1] = {
                        name: 'FEB',
                        TotalSales: monthlySales[1].TotalSales = parseInt(monthlySales[1].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

                if (month === 3) {
                    monthlySales[2] = {
                        name: 'MAR',
                        TotalSales: monthlySales[2].TotalSales = parseInt(monthlySales[2].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

                if (month === 4) {
                    monthlySales[3] = {
                        name: 'APRIL',
                        TotalSales: monthlySales[3].TotalSales = parseInt(monthlySales[3].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

                if (month === 5) {
                    monthlySales[4] = {
                        name: 'MAY',
                        TotalSales: monthlySales[4].TotalSales = parseInt(monthlySales[4].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

                if (month === 6) {
                    monthlySales[5] = {
                        name: 'JUNE',
                        TotalSales: monthlySales[5].TotalSales = parseInt(monthlySales[5].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

                if (month === 7) {
                    monthlySales[6] = {
                        name: 'JULY',
                        TotalSales: monthlySales[6].TotalSales = parseInt(monthlySales[6].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

                if (month === 8) {
                    monthlySales[7] = {
                        name: 'AUG',
                        TotalSales: monthlySales[7].TotalSales = parseInt(monthlySales[7].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

                if (month === 9) {
                    monthlySales[8] = {
                        name: 'SEP',
                        TotalSales: monthlySales[8].TotalSales = parseInt(monthlySales[8].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

                if (month === 10) {
                    monthlySales[9] = {
                        name: 'OCT',
                        TotalSales: monthlySales[9].TotalSales = parseInt(monthlySales[9].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

                if (month === 11) {
                    monthlySales[10] = {
                        name: 'NOV',
                        TotalSales: monthlySales[10].TotalSales = parseInt(monthlySales[10].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

                if (month === 12) {
                    monthlySales[11] = {
                        name: 'DEC',
                        TotalSales: monthlySales[11].TotalSales = parseInt(monthlySales[11].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

            }


        }


        return response.status(200).json({
            totalSales: totalSales,
            monthlySales: monthlySales,
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





export const totalUsersController = async (request, response) => {
    try {
        const users = await UserModel.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 },
            },
        ]);



        let monthlyUsers = [
            {
                name: 'JAN',
                TotalUsers: 0
            },
            {
                name: 'FEB',
                TotalUsers: 0
            },
            {
                name: 'MAR',
                TotalUsers: 0
            },
            {
                name: 'APRIL',
                TotalUsers: 0
            },
            {
                name: 'MAY',
                TotalUsers: 0
            },
            {
                name: 'JUNE',
                TotalUsers: 0
            },
            {
                name: 'JULY',
                TotalUsers: 0
            },
            {
                name: 'AUG',
                TotalUsers: 0
            },
            {
                name: 'SEP',
                TotalUsers: 0
            },
            {
                name: 'OCT',
                TotalUsers: 0
            },
            {
                name: 'NOV',
                TotalUsers: 0
            },
            {
                name: 'DEC',
                TotalUsers: 0
            },
        ]




        for (let i = 0; i < users.length; i++) {

            if (users[i]?._id?.month === 1) {
                monthlyUsers[0] = {
                    name: 'JAN',
                    TotalUsers: users[i].count
                }
            }

            if (users[i]?._id?.month === 2) {
                monthlyUsers[1] = {
                    name: 'FEB',
                    TotalUsers: users[i].count
                }
            }

            if (users[i]?._id?.month === 3) {
                monthlyUsers[2] = {
                    name: 'MAR',
                    TotalUsers: users[i].count
                }
            }

            if (users[i]?._id?.month === 4) {
                monthlyUsers[3] = {
                    name: 'APRIL',
                    TotalUsers: users[i].count
                }
            }

            if (users[i]?._id?.month === 5) {
                monthlyUsers[4] = {
                    name: 'MAY',
                    TotalUsers: users[i].count
                }
            }

            if (users[i]?._id?.month === 6) {
                monthlyUsers[5] = {
                    name: 'JUNE',
                    TotalUsers: users[i].count
                }
            }

            if (users[i]?._id?.month === 7) {
                monthlyUsers[6] = {
                    name: 'JULY',
                    TotalUsers: users[i].count
                }
            }

            if (users[i]?._id?.month === 8) {
                monthlyUsers[7] = {
                    name: 'AUG',
                    TotalUsers: users[i].count
                }
            }

            if (users[i]?._id?.month === 9) {
                monthlyUsers[8] = {
                    name: 'SEP',
                    TotalUsers: users[i].count
                }
            }

            if (users[i]?._id?.month === 10) {
                monthlyUsers[9] = {
                    name: 'OCT',
                    TotalUsers: users[i].count
                }
            }

            if (users[i]?._id?.month === 11) {
                monthlyUsers[10] = {
                    name: 'NOV',
                    TotalUsers: users[i].count
                }
            }

            if (users[i]?._id?.month === 12) {
                monthlyUsers[11] = {
                    name: 'DEC',
                    TotalUsers: users[i].count
                }
            }

        }



        return response.status(200).json({
            TotalUsers: monthlyUsers,
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



export async function deleteOrder(request, response) {
    const order = await OrderModel.findById(request.params.id);

    if (!order) {
        return response.status(404).json({
            message: "Order Not found",
            error: true,
            success: false
        })
    }

    const deletedOrder = await OrderModel.findByIdAndDelete(request.params.id);

    if (!deletedOrder) {
        response.status(404).json({
            message: "Order not deleted!",
            success: false,
            error: true
        });
    }

    return response.status(200).json({
        success: true,
        error: false,
        message: "Order Deleted!",
    });
}
