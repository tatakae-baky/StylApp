import { Router } from 'express'
import auth from '../middlewares/auth.js';
import authorize from '../middlewares/authorize.js';
import upload from '../middlewares/multer.js';
import { publicUploadRateLimit, adminOperationRateLimit } from '../middlewares/rateLimiting.js';
import { createCategory, deleteCategory, getCategories, getCategoriesCount, getCategory, getSubCategoriesCount, removeImageFromCloudinary, updatedCategory, uploadImages } from '../controllers/category.controller.js';

const categoryRouter = Router();

// Admin-only category operations with rate limiting
categoryRouter.post('/uploadImages', auth, authorize(['ADMIN']), publicUploadRateLimit, upload.array('images'), uploadImages);
categoryRouter.post('/create', auth, authorize(['ADMIN']), adminOperationRateLimit, createCategory);
// Public category endpoints - no rate limiting on reads
categoryRouter.get('/', getCategories);
categoryRouter.get('/get/count', getCategoriesCount);
categoryRouter.get('/get/count/subCat', getSubCategoriesCount);
categoryRouter.get('/:id', getCategory);
// Admin operations with rate limiting
categoryRouter.delete('/deteleImage', auth, authorize(['ADMIN']), removeImageFromCloudinary);
categoryRouter.delete('/:id', auth, authorize(['ADMIN']), adminOperationRateLimit, deleteCategory);
categoryRouter.put('/:id', auth, authorize(['ADMIN']), adminOperationRateLimit, updatedCategory);


export default categoryRouter;
