import { Router } from 'express';
import { approveBrandRequest, createBrandRequest, listBrandRequests, rejectBrandRequest, uploadImages, deleteImage } from '../controllers/brandRequest.controller.js';
import auth from '../middlewares/auth.js';
import authorize from '../middlewares/authorize.js';
import upload from '../middlewares/multer.js';
import { handleFileUploadError } from '../middlewares/fileUploadError.js';
import { publicUploadRateLimit, brandRequestRateLimit } from '../middlewares/rateLimiting.js';

const brandRequestRouter = Router();

// Public image upload endpoint for brand request submissions (no auth required for legitimate business flow)
// Security: File type, size, and validation still enforced via multer middleware + rate limiting
brandRequestRouter.post('/brand-request/uploadImages', publicUploadRateLimit, upload.array("images"), handleFileUploadError, uploadImages);
brandRequestRouter.delete('/brand-request/deleteImage', publicUploadRateLimit, deleteImage);

// Public submission with rate limiting (no auth required for new brand partner requests)
brandRequestRouter.post('/brand-request', brandRequestRateLimit, createBrandRequest);

// Admin endpoints
brandRequestRouter.get('/brand-requests', auth, authorize(['ADMIN']), listBrandRequests);
brandRequestRouter.patch('/brand-requests/:id/approve', auth, authorize(['ADMIN']), approveBrandRequest);
brandRequestRouter.patch('/brand-requests/:id/reject', auth, authorize(['ADMIN']), rejectBrandRequest);

export default brandRequestRouter;

