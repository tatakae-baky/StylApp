import express from 'express';
import { 
    createBrand, 
    getAllBrands, 
    getBrandById, 
    getBrandBySlug,
    updateBrand, 
    deleteBrand,
    getProductsByBrandClean as getProductsByBrand,
    searchBrands,
    uploadImages,
    removeImageFromCloudinary
} from '../controllers/brand.controller.js';
import auth from '../middlewares/auth.js';
import authorize from '../middlewares/authorize.js';
import { brandWriteScope, requireApprovedBrandOwner } from '../middlewares/brandScope.js';
import upload from '../middlewares/multer.js';

const brandRouter = express.Router();

// Public routes
brandRouter.get('/get', getAllBrands);
brandRouter.get('/search', searchBrands);
brandRouter.get('/slug/:slug', getBrandBySlug);
brandRouter.get('/:id', getBrandById);
brandRouter.get('/:brandId/products', getProductsByBrand);

// Protected routes
brandRouter.post('/create', auth, authorize(['ADMIN']), createBrand);
brandRouter.put('/edit/:id', auth, authorize(['ADMIN','BRAND_OWNER']), requireApprovedBrandOwner, brandWriteScope, updateBrand);
brandRouter.delete('/delete/:id', auth, authorize(['ADMIN']), deleteBrand);
brandRouter.post('/uploadImages', auth, authorize(['ADMIN','BRAND_OWNER']), requireApprovedBrandOwner, upload.array('images'), uploadImages);
brandRouter.delete('/deteleImage', auth, authorize(['ADMIN','BRAND_OWNER']), requireApprovedBrandOwner, removeImageFromCloudinary);

export default brandRouter;
