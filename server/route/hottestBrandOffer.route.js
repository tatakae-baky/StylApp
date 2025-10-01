import { Router } from 'express';
import auth from '../middlewares/auth.js';
import authorize from '../middlewares/authorize.js';
import upload from '../middlewares/multer.js';
import { 
    addHottestBrandOffer, 
    deleteHottestBrandOffer, 
    getHottestBrandOffer, 
    getHottestBrandOffers,
    getActiveHottestBrandOffers,
    updateHottestBrandOffer, 
    uploadImages,
    getBrandsForSelection,
    removeImageFromCloudinary
} from '../controllers/hottestBrandOffer.controller.js';

/**
 * Hottest Brand Offer Routes
 * Handles routing for the hottest brand offers section
 */
const hottestBrandOfferRouter = Router();

// Image upload endpoint
hottestBrandOfferRouter.post('/uploadImages', auth, authorize(['ADMIN']), upload.array('images'), uploadImages);

// Image deletion endpoint
hottestBrandOfferRouter.delete('/deleteImage', auth, authorize(['ADMIN']), removeImageFromCloudinary);

// CRUD operations
hottestBrandOfferRouter.post('/add', auth, authorize(['ADMIN']), addHottestBrandOffer);
hottestBrandOfferRouter.get('/', getHottestBrandOffers);
hottestBrandOfferRouter.get('/active', getActiveHottestBrandOffers); // For frontend consumption
hottestBrandOfferRouter.get('/brands', getBrandsForSelection); // For admin dropdown
hottestBrandOfferRouter.get('/:id', getHottestBrandOffer);
hottestBrandOfferRouter.put('/:id', auth, authorize(['ADMIN']), updateHottestBrandOffer);
hottestBrandOfferRouter.delete('/:id', auth, authorize(['ADMIN']), deleteHottestBrandOffer);

export default hottestBrandOfferRouter;
