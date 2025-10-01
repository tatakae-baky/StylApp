import { Router } from 'express'
import {addReview, authWithGoogle, changePasswordController, deleteMultiple, deleteUser, forgotPasswordController, getAllReviews, getAllUsers, getReviews, loginUserController, logoutController, refreshToken, registerUserController, removeImageFromCloudinary, resetpassword, updateUserDetails, userAvatarController, userDetails, verifyEmailController, verifyForgotPasswordOtp} from '../controllers/user.controller.js';
import auth from '../middlewares/auth.js';
import authorize from '../middlewares/authorize.js';
import upload from '../middlewares/multer.js';
import { handleFileUploadError } from '../middlewares/fileUploadError.js';
import { 
    authRateLimit, 
    passwordResetRateLimit, 
    otpVerificationRateLimit, 
    adminOperationRateLimit,
    publicUploadRateLimit 
} from '../middlewares/rateLimiting.js';

const userRouter = Router()
// Authentication endpoints with rate limiting
userRouter.post('/register', authRateLimit, registerUserController)
userRouter.post('/verifyEmail', otpVerificationRateLimit, verifyEmailController)
userRouter.post('/login', authRateLimit, loginUserController)
userRouter.post('/authWithGoogle', authRateLimit, authWithGoogle)
userRouter.get('/logout', auth, logoutController);
userRouter.put('/user-avatar', auth, publicUploadRateLimit, upload.array('avatar'), handleFileUploadError, userAvatarController);
userRouter.delete('/deteleImage', auth, removeImageFromCloudinary);
userRouter.put('/:id', auth, updateUserDetails);
// Password reset endpoints with strict rate limiting
userRouter.post('/forgot-password', passwordResetRateLimit, forgotPasswordController)
userRouter.post('/verify-forgot-password-otp', otpVerificationRateLimit, verifyForgotPasswordOtp)
userRouter.post('/reset-password', passwordResetRateLimit, resetpassword)
userRouter.post('/forgot-password/change-password', passwordResetRateLimit, changePasswordController)
userRouter.post('/refresh-token', authRateLimit, refreshToken)
userRouter.get('/user-details', auth, userDetails);
userRouter.post('/addReview', auth, addReview);
userRouter.get('/getReviews', getReviews);
userRouter.get('/getAllReviews', getAllReviews);
// Admin endpoints with admin rate limiting
userRouter.get('/getAllUsers', auth, authorize(['ADMIN']), adminOperationRateLimit, getAllUsers);
userRouter.delete('/deleteMultiple', auth, authorize(['ADMIN']), adminOperationRateLimit, deleteMultiple);
userRouter.delete('/deleteUser/:id', auth, authorize(['ADMIN']), adminOperationRateLimit, deleteUser);


export default userRouter
