import { Router } from 'express';
import auth from '../middlewares/auth.js';
import authorize from '../middlewares/authorize.js';
import upload from '../middlewares/multer.js';
import { 
    addHeroBanner, 
    deleteHeroBanner, 
    getHeroBanner, 
    getHeroBanners, 
    getActiveHeroBanners,
    updateHeroBanner, 
    uploadImages 
} from '../controllers/heroBanner.controller.js';
import { removeImageFromCloudinary } from '../controllers/category.controller.js';

/**
 * Hero Banner Routes
 * Handles routing for the 70-30 layout hero banners that replace HomeSlider
 */
const heroBannerRouter = Router();

// Image upload endpoint
heroBannerRouter.post('/uploadImages', auth, authorize(['ADMIN']), upload.array('images'), uploadImages);

// CRUD operations
heroBannerRouter.post('/add', auth, authorize(['ADMIN']), addHeroBanner);
heroBannerRouter.get('/', getHeroBanners);
heroBannerRouter.get('/active', getActiveHeroBanners); // For frontend consumption
heroBannerRouter.get('/:id', getHeroBanner);
heroBannerRouter.put('/:id', auth, authorize(['ADMIN']), updateHeroBanner);
heroBannerRouter.delete('/:id', auth, authorize(['ADMIN']), deleteHeroBanner);

// Image deletion endpoint
heroBannerRouter.delete('/deteleImage', auth, authorize(['ADMIN']), removeImageFromCloudinary);

export default heroBannerRouter;
