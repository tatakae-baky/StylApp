import express from 'express';
import * as subCategorySectionController from '../controllers/subCategorySection.controller.js';
import multerConfig from '../middlewares/multer.js';
import auth from '../middlewares/auth.js';
import authorize from '../middlewares/authorize.js';

const router = express.Router();

// Image upload route
router.post('/uploadImages', auth, authorize(['ADMIN']), multerConfig.array('images'), subCategorySectionController.uploadImages);

// Delete image route
router.delete('/deteleImage', auth, authorize(['ADMIN']), subCategorySectionController.removeImageFromCloudinary);

// CRUD routes
router.post('/add', auth, authorize(['ADMIN']), subCategorySectionController.addSubCategorySection);
router.get('/get', subCategorySectionController.getSubCategorySections);
router.get('/get/:id', subCategorySectionController.getSubCategorySectionById);
router.put('/update/:id', auth, authorize(['ADMIN']), subCategorySectionController.updateSubCategorySection);
router.delete('/delete/:id', auth, authorize(['ADMIN']), subCategorySectionController.deleteSubCategorySection);

// Frontend route for active sections
router.get('/active', subCategorySectionController.getActiveSubCategorySections);

export default router;
