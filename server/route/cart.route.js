import { Router } from "express";
import { addToCartItemController, deleteCartItemQtyController, emptyCartController, getCartItemController, updateCartItemQtyController } from "../controllers/cart.controller.js";
import auth from "../middlewares/auth.js";
import { browsingRateLimit } from "../middlewares/rateLimiting.js";

const cartRouter = Router();

// Apply rate limiting only to write operations to prevent abuse
cartRouter.post('/add', auth, browsingRateLimit, addToCartItemController)
cartRouter.get("/get", auth, getCartItemController)
cartRouter.put('/update-qty', auth, browsingRateLimit, updateCartItemQtyController)
cartRouter.delete('/delete-cart-item/:id', auth, deleteCartItemQtyController)
cartRouter.delete('/emptyCart', auth, emptyCartController) // SECURITY FIX: Removed :id parameter
export default cartRouter