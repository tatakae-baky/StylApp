import { Router } from 'express';
import auth from '../middlewares/auth.js';
import authorize from '../middlewares/authorize.js';
import upload from '../middlewares/multer.js';
import { 
    addSalesBanner, 
    deleteSalesBanner, 
    getSalesBanner, 
    getSalesBanners, 
    getActiveSalesBanners,
    updateSalesBanner, 
    uploadImages 
} from '../controllers/salesBanner.controller.js';
import { removeImageFromCloudinary } from '../controllers/category.controller.js';

/**
 * Sales Banner Routes
 * Handles routing for "Sales You Can't Miss" carousel banners
 */
const salesBannerRouter = Router();

// Image upload endpoint
salesBannerRouter.post('/uploadImages', auth, authorize(['ADMIN']), upload.array('images'), uploadImages);

// CRUD operations
salesBannerRouter.post('/add', auth, authorize(['ADMIN']), addSalesBanner);
salesBannerRouter.get('/', getSalesBanners);
salesBannerRouter.get('/active', getActiveSalesBanners); // For frontend consumption
salesBannerRouter.get('/:id', getSalesBanner);
salesBannerRouter.put('/:id', auth, authorize(['ADMIN']), updateSalesBanner);
salesBannerRouter.delete('/:id', auth, authorize(['ADMIN']), deleteSalesBanner);

// Image deletion endpoint
salesBannerRouter.delete('/deteleImage', auth, authorize(['ADMIN']), removeImageFromCloudinary);

export default salesBannerRouter;
