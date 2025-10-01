import { Router } from 'express'
import auth from '../middlewares/auth.js';
import authorize from '../middlewares/authorize.js';
import upload from '../middlewares/multer.js';
import { addLogo, getLogo, getLogoById, removeImageFromCloudinary, updatedLogo, uploadImages } from '../controllers/logo.controller.js';

const logoRouter = Router();

logoRouter.post('/uploadImages',auth,authorize(['ADMIN']),upload.array('images'),uploadImages);
logoRouter.post('/add',auth,authorize(['ADMIN']),addLogo);
logoRouter.get('/',getLogo);
logoRouter.get('/:id',getLogoById);
logoRouter.delete('/deteleImage',auth,authorize(['ADMIN']),removeImageFromCloudinary);
logoRouter.put('/:id',auth,authorize(['ADMIN']),updatedLogo);

export default logoRouter;
