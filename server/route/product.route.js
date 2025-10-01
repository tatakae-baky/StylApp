import { Router } from 'express'
import auth from '../middlewares/auth.js';
import authorize from '../middlewares/authorize.js';
import { productWriteScope, requireApprovedBrandOwner } from '../middlewares/brandScope.js';
import upload from '../middlewares/multer.js';
import { handleFileUploadError } from '../middlewares/fileUploadError.js';
import { publicUploadRateLimit, adminOperationRateLimit, browsingRateLimit } from '../middlewares/rateLimiting.js';
import {createProduct, deleteMultipleProduct, deleteProduct, getAllFeaturedProducts, getAllPopularProducts, getAllProducts, getAllProductsByCatId, getAllProductsByCatName, getAllProductsByPrice, getAllProductsByRating, getAllProductsBySubCatId, getAllProductsBySubCatName, getAllProductsByThirdLavelCatId, getProduct, getProductsCount, updateProduct, uploadImages, createProductSize, deleteProductSize, updateProductSize, getProductSize, getProductSizeById, filters, sortBy, searchProductController, updateSizeStock, getSizeStockAvailability, bulkUpdateSizeStock, removeImageFromCloudinary} from '../controllers/product.controller.js';

const productRouter = Router();

// Product creation and upload endpoints with rate limiting
productRouter.post('/uploadImages', auth, authorize(['ADMIN','BRAND_OWNER']), requireApprovedBrandOwner, publicUploadRateLimit, upload.array('images'), handleFileUploadError, uploadImages);
productRouter.post('/create', auth, authorize(['ADMIN','BRAND_OWNER']), requireApprovedBrandOwner, productWriteScope, browsingRateLimit, createProduct);
// Public product endpoints - no rate limiting on reads (cached endpoints)
productRouter.get('/getAllProducts', getAllProducts);
productRouter.get('/getAllProductsByCatId/:id', getAllProductsByCatId);
productRouter.get('/getAllProductsByCatName', getAllProductsByCatName);
productRouter.get('/getAllProductsBySubCatId/:id', getAllProductsBySubCatId);
productRouter.get('/getAllProductsBySubCatName', getAllProductsBySubCatName);
productRouter.get('/getAllProductsByThirdLavelCat/:id', getAllProductsByThirdLavelCatId);
productRouter.get('/getAllProductsByThirdLavelCatName', getAllProductsBySubCatName);
productRouter.get('/getAllProductsByPrice', getAllProductsByPrice);
productRouter.get('/getAllProductsByRating', getAllProductsByRating);
productRouter.get('/getAllProductsCount', getProductsCount);
productRouter.get('/getAllFeaturedProducts', getAllFeaturedProducts);
productRouter.get('/getAllPopularProducts', getAllPopularProducts);
// Admin operations with admin rate limiting
productRouter.delete('/deleteMultiple', auth, authorize(['ADMIN']), adminOperationRateLimit, deleteMultipleProduct);
productRouter.delete('/deteleImage', auth, authorize(['ADMIN','BRAND_OWNER']), requireApprovedBrandOwner, removeImageFromCloudinary);
productRouter.delete('/:id', auth, authorize(['ADMIN','BRAND_OWNER']), requireApprovedBrandOwner, productWriteScope, deleteProduct);
productRouter.get('/:id', getProduct);
productRouter.put('/updateProduct/:id', auth, authorize(['ADMIN','BRAND_OWNER']), requireApprovedBrandOwner, productWriteScope, browsingRateLimit, updateProduct);

productRouter.post('/productSize/create',auth,authorize(['ADMIN','BRAND_OWNER']),requireApprovedBrandOwner,createProductSize);
productRouter.delete('/productSize/:id',auth,authorize(['ADMIN','BRAND_OWNER']),requireApprovedBrandOwner,deleteProductSize);
productRouter.put('/productSize/:id',auth,authorize(['ADMIN','BRAND_OWNER']),requireApprovedBrandOwner,updateProductSize);
productRouter.get('/productSize/get',getProductSize);
productRouter.get('/productSize/:id',getProductSizeById);

// Size Stock Management Routes
productRouter.put('/size-stock/update/:productId', auth, authorize(['ADMIN','BRAND_OWNER']), requireApprovedBrandOwner, updateSizeStock);
productRouter.get('/size-stock/availability/:productId', getSizeStockAvailability);
productRouter.put('/size-stock/bulk-update', auth, authorize(['ADMIN','BRAND_OWNER']), requireApprovedBrandOwner, bulkUpdateSizeStock);

// Search and filtering endpoints with lighter rate limiting (these are browsing operations)
productRouter.post('/filters', browsingRateLimit, filters);
productRouter.post('/sortBy', browsingRateLimit, sortBy);
productRouter.post('/search/get', browsingRateLimit, searchProductController);


export default productRouter;
