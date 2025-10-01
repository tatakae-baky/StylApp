import { Router } from "express";
import auth from "../middlewares/auth.js";
import authorize from "../middlewares/authorize.js";
import { createOrderController, deleteOrder, getBrandOrdersController, getOrderDetailsController, getTotalOrdersCountController, getUserOrderDetailsController, totalSalesController, totalUsersController, updateOrderStatusController } from "../controllers/order.controller.js";
import { requireApprovedBrandOwner } from "../middlewares/brandScope.js";
import { browsingRateLimit, adminOperationRateLimit } from "../middlewares/rateLimiting.js";

const orderRouter = Router();

// Rate limit order creation to prevent spam  
orderRouter.post('/create', auth, browsingRateLimit, createOrderController)
orderRouter.get("/order-list", auth, authorize(['ADMIN']), adminOperationRateLimit, getOrderDetailsController)
orderRouter.put('/order-status/:id', auth, authorize(['BRAND_OWNER']), requireApprovedBrandOwner, updateOrderStatusController)
orderRouter.get('/count', auth, authorize(['ADMIN']), getTotalOrdersCountController)
orderRouter.get('/sales', auth, authorize(['ADMIN']), totalSalesController)
orderRouter.get('/users', auth, authorize(['ADMIN']), totalUsersController)
orderRouter.get('/order-list/orders', auth, getUserOrderDetailsController)
orderRouter.delete('/deleteOrder/:id', auth, authorize(['ADMIN']), adminOperationRateLimit, deleteOrder)

// Brand owner orders
orderRouter.get('/brand-orders', auth, authorize(['ADMIN','BRAND_OWNER']), requireApprovedBrandOwner, getBrandOrdersController)

export default orderRouter;
