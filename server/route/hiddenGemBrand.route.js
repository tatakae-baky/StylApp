import { Router } from 'express';
import auth from '../middlewares/auth.js';
import authorize from '../middlewares/authorize.js';
import upload from '../middlewares/multer.js';
import { 
    addHiddenGemBrand, 
    deleteHiddenGemBrand, 
    getHiddenGemBrand, 
    getHiddenGemBrands,
    getActiveHiddenGemBrands,
    updateHiddenGemBrand, 
    uploadImages,
    getBrandsForSelection,
    removeImageFromCloudinary
} from '../controllers/hiddenGemBrand.controller.js';

/**
 * Hidden Gem Brand Routes
 * Handles routing for the hidden gem brands section
 */
const hiddenGemBrandRouter = Router();

// Image upload endpoint
hiddenGemBrandRouter.post('/uploadImages', auth, authorize(['ADMIN']), upload.array('images'), uploadImages);

// Image deletion endpoint
hiddenGemBrandRouter.delete('/deleteImage', auth, authorize(['ADMIN']), removeImageFromCloudinary);

// CRUD operations
hiddenGemBrandRouter.post('/add', auth, authorize(['ADMIN']), addHiddenGemBrand);
hiddenGemBrandRouter.get('/', getHiddenGemBrands);
hiddenGemBrandRouter.get('/active', getActiveHiddenGemBrands); // For frontend consumption
hiddenGemBrandRouter.get('/brands', getBrandsForSelection); // For admin dropdown
hiddenGemBrandRouter.get('/:id', getHiddenGemBrand);
hiddenGemBrandRouter.put('/:id', auth, authorize(['ADMIN']), updateHiddenGemBrand);
hiddenGemBrandRouter.delete('/:id', auth, authorize(['ADMIN']), deleteHiddenGemBrand);

export default hiddenGemBrandRouter;
