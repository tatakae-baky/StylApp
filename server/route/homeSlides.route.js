import { Router } from 'express'
import auth from '../middlewares/auth.js';
import authorize from '../middlewares/authorize.js';
import upload from '../middlewares/multer.js';
import { addHomeSlide, deleteMultipleSlides, deleteSlide, getHomeSlides, getSlide, removeImageFromCloudinary, updatedSlide, uploadImages } from '../controllers/homeSlider.controller.js';

const homeSlidesRouter = Router();

homeSlidesRouter.post('/uploadImages',auth,authorize(['ADMIN']),upload.array('images'),uploadImages);
homeSlidesRouter.post('/add',auth,authorize(['ADMIN']),addHomeSlide);
homeSlidesRouter.get('/',getHomeSlides);
homeSlidesRouter.get('/:id',getSlide);
homeSlidesRouter.delete('/deteleImage',auth,authorize(['ADMIN']),removeImageFromCloudinary);
homeSlidesRouter.delete('/:id',auth,authorize(['ADMIN']),deleteSlide);
homeSlidesRouter.delete('/deleteMultiple',auth,authorize(['ADMIN']),deleteMultipleSlides);
homeSlidesRouter.put('/:id',auth,authorize(['ADMIN']),updatedSlide);


export default homeSlidesRouter;
