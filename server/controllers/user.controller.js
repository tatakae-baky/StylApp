import UserModel from '../models/user.model.js'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import sendEmailFun from '../config/sendEmail.js';
import VerificationEmail from '../utils/verifyEmailTemplate.js';
import generatedAccessToken from '../utils/generatedAccessToken.js';
import genertedRefreshToken from '../utils/generatedRefreshToken.js';

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import ReviewModel from '../models/reviews.model.js.js';

cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
    secure: true,
});


export async function registerUserController(request, response) {
    try {
        let user;

        const { name, email, password } = request.body;
        if (!name || !email || !password) {
            return response.status(400).json({
                message: "provide email, name, password",
                error: true,
                success: false
            })
        }

        user = await UserModel.findOne({ email: email });

        if (user) {
            return response.json({
                message: "User already Registered with this email",
                error: true,
                success: false
            })
        }

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();


        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(password, salt);

        user = new UserModel({
            email: email,
            password: hashPassword,
            name: name,
            otp: verifyCode,
            otpExpires: Date.now() + 600000,

        });

        await user.save();

        // Send verification email
        await sendEmailFun({
            sendTo: email,
            subject: "Verify email from Ecommerce App",
            text: "",
            html: VerificationEmail(name, verifyCode, 'account-verify')
        })


        // Create a JWT token for verification purposes
        const token = jwt.sign(
            { email: user.email, id: user._id },
            process.env.JSON_WEB_TOKEN_SECRET_KEY
        );


        return response.status(200).json({
            success: true,
            error: false,
            message: "User registered successfully! ",
            token: token, // Optional: include this if needed for verification
        });



    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export async function verifyEmailController(request, response) {
    try {
        const { email, otp } = request.body;

        const user = await UserModel.findOne({ email: email });
        if (!user) {
            return response.status(400).json({ error: true, success: false, message: "User not found" });
        }

        const isCodeValid = user.otp === otp;
        const isNotExpired = user.otpExpires > Date.now();

        if (isCodeValid && isNotExpired) {
            user.verify_email = true;
            user.otp = null;
            user.otpExpires = null;
            await user.save();
            return response.status(200).json({ error: false, success: true, message: "Email verified successfully" });
        } else if (!isCodeValid) {
            return response.status(400).json({ error: true, success: false, message: "Invalid OTP" });
        } else {
            return response.status(400).json({ error: true, success: false, message: "OTP expired" });
        }

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


export async function authWithGoogle(request, response) {
    const { name, email, password, avatar, mobile } = request.body;

    try {
        const existingUser = await UserModel.findOne({ email: email });

        if (!existingUser) {
            const user = await UserModel.create({
                name: name,
                mobile: mobile,
                email: email,
                password: "null",
                avatar: avatar,
                verify_email: true,
                signUpWithGoogle: true
            });

            await user.save();

            const accesstoken = await generatedAccessToken(user._id, user.role);
            const refreshToken = await genertedRefreshToken(user._id);

            await UserModel.findByIdAndUpdate(user?._id, {
                last_login_date: new Date()
            })


            const cookiesOption = {
                httpOnly: true,
                secure: true,
                sameSite: "None"
            }
            response.cookie('accessToken', accesstoken, cookiesOption)
            response.cookie('refreshToken', refreshToken, cookiesOption)


            return response.json({
                message: "Login Successful",
                error: false,
                success: true,
                data: {
                    accesstoken,
                    refreshToken
                }
            })

        } else {
            const accesstoken = await generatedAccessToken(existingUser._id, existingUser.role);
            const refreshToken = await genertedRefreshToken(existingUser._id);

            await UserModel.findByIdAndUpdate(existingUser?._id, {
                last_login_date: new Date()
            })


            const cookiesOption = {
                httpOnly: true,
                secure: true,
                sameSite: "None"
            }
            response.cookie('accessToken', accesstoken, cookiesOption)
            response.cookie('refreshToken', refreshToken, cookiesOption)


            return response.json({
                message: "Login Successfull",
                error: false,
                success: true,
                data: {
                    accesstoken,
                    refreshToken
                }
            })
        }

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }


}


export async function loginUserController(request, response) {
    try {
        const { email, password } = request.body;

        const user = await UserModel.findOne({ email: email });

        if (!user) {
            return response.status(400).json({
                message: "User not register",
                error: true,
                success: false
            })
        }

        if (user.status !== "Active") {
            return response.status(400).json({
                message: "Contact to admin",
                error: true,
                success: false
            })
        }

        if (user.verify_email !== true) {
            return response.status(400).json({
                message: "Your Email is not verify yet please verify your email first",
                error: true,
                success: false
            })
        }

        const checkPassword = await bcryptjs.compare(password, user.password);

        if (!checkPassword) {
            return response.status(400).json({
                message: "Check your password",
                error: true,
                success: false
            })
        }


        const accesstoken = await generatedAccessToken(user._id, user.role);
        const refreshToken = await genertedRefreshToken(user._id);

        const updateUser = await UserModel.findByIdAndUpdate(user?._id, {
            last_login_date: new Date()
        })


        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        }
        response.cookie('accessToken', accesstoken, cookiesOption)
        response.cookie('refreshToken', refreshToken, cookiesOption)


        return response.json({
            message: "Login Successfull",
            error: false,
            success: true,
            data: {
                accesstoken,
                refreshToken
            }
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }

}



//logout controller
export async function logoutController(request, response) {
    try {
        const userid = request.userId //middleware

        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        }

        response.clearCookie("accessToken", cookiesOption)
        response.clearCookie("refreshToken", cookiesOption)

        const removeRefreshToken = await UserModel.findByIdAndUpdate(userid, {
            refresh_token: ""
        })

        return response.json({
            message: "Logout successfully",
            error: false,
            success: true
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


//image upload
export async function userAvatarController(request, response) {
    try {
        const userId = request.userId;  //auth middleware
        const imageFiles = request.files;

        if (!userId) {
            return response.status(401).json({
                message: "Unauthorized",
                error: true,
                success: false
            });
        }

        if (!Array.isArray(imageFiles) || imageFiles.length === 0) {
            return response.status(400).json({
                message: "No images were uploaded. Please select image files to upload.",
                error: true,
                success: false
            });
        }

        const user = await UserModel.findOne({ _id: userId });

        if (!user) {
            return response.status(500).json({
                message: "User not found",
                error: true,
                success: false
            });
        }

        const imgUrl = user.avatar;

        if (imgUrl) {
            const urlArr = imgUrl.split("/");
            const avatarImage = urlArr[urlArr.length - 1];
            const imageName = avatarImage.split(".")[0];

            if (imageName) {
                await cloudinary.uploader.destroy(imageName);
            }
        }

        const options = {
            use_filename: true,
            unique_filename: false,
            overwrite: false,
        };

        const uploadedUrls = [];

        for (const file of imageFiles) {
            try {
                const result = await cloudinary.uploader.upload(file.path, options);
                uploadedUrls.push(result.secure_url);
            } finally {
                try {
                    fs.unlinkSync(`uploads/${file.filename}`);
                } catch (error) {
                    // ignore file system cleanup errors
                }
            }
        }

        const avatarUrl = uploadedUrls[0] || '';

        if (!avatarUrl) {
            return response.status(400).json({
                message: "Avatar upload failed",
                error: true,
                success: false
            });
        }

        user.avatar = avatarUrl;
        await user.save();

        return response.status(200).json({
            _id: userId,
            avtar: avatarUrl
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export async function removeImageFromCloudinary(request, response) {
    try {
        const imgUrl = request.query.img;
        const user = request.user;

        if (!imgUrl) {
            return response.status(400).json({
                error: true,
                success: false,
                message: "Image URL is required"
            });
        }

        // Validate that the URL is from our Cloudinary domain
        if (!imgUrl.startsWith('https://res.cloudinary.com/dr4avma2d/')) {
            return response.status(400).json({
                error: true,
                success: false,
                message: "Invalid image URL - must be from authorized domain"
            });
        }

        // Check if this image is the user's avatar
        const userRecord = await UserModel.findById(user._id);
        if (!userRecord) {
            return response.status(404).json({
                error: true,
                success: false,
                message: "User not found"
            });
        }

        // Only allow deletion if this is the user's current avatar
        if (userRecord.avatar !== imgUrl) {
            return response.status(403).json({
                error: true,
                success: false,
                message: "You can only delete your own avatar image"
            });
        }

        // Extract public ID from Cloudinary URL
        const urlArr = imgUrl.split("/");
        const image = urlArr[urlArr.length - 1];
        const imageName = image.split(".")[0];

        if (imageName) {
            const res = await cloudinary.uploader.destroy(imageName);
            
            return response.status(200).json({
                error: false,
                success: true,
                message: "Avatar image deleted successfully",
                result: res
            });
        } else {
            return response.status(400).json({
                error: true,
                success: false,
                message: "Invalid image URL format"
            });
        }

    } catch (error) {
        return response.status(500).json({
            error: true,
            success: false,
            message: error.message || "Failed to delete image"
        });
    }
}

//update user details
export async function updateUserDetails(request, response) {
    try {
        const userId = request.userId //auth middleware
        const { name, email, mobile, password } = request.body;

        const userExist = await UserModel.findById(userId);
        if (!userExist)
            return response.status(400).send('The user cannot be Updated!');


        const updateUser = await UserModel.findByIdAndUpdate(
            userId,
            {
                name: name,
                mobile: mobile,
                email: email,
            },
            { new: true }
        )



        return response.json({
            message: "User Updated successfully",
            error: false,
            success: true,
            user: {
                name: updateUser?.name,
                _id: updateUser?._id,
                email: updateUser?.email,
                mobile: updateUser?.mobile,
                avatar: updateUser?.avatar
            }
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//forgot password
export async function forgotPasswordController(request, response) {
    try {
        const { email } = request.body

        const user = await UserModel.findOne({ email: email })

        if (!user) {
            return response.status(400).json({
                message: "Email not available",
                error: true,
                success: false
            })
        }

        else {
            let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

            user.otp = verifyCode;
            user.otpExpires = Date.now() + 600000;

            await user.save();

            await sendEmailFun({
                sendTo: email,
                subject: "Reset your Styl password – verification code",
                text: "",
                html: VerificationEmail(user.name, verifyCode, 'forgot-password')
            })


            return response.json({
                message: "Check Your Email",
                error: false,
                success: true
            })

        }



    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


export async function verifyForgotPasswordOtp(request, response) {
    try {
        const { email, otp } = request.body;

        const user = await UserModel.findOne({ email: email })

        if (!user) {
            return response.status(400).json({
                message: "Email not available",
                error: true,
                success: false
            })
        }

        if (!email || !otp) {
            return response.status(400).json({
                message: "Provide required field email, otp.",
                error: true,
                success: false
            })
        }

        if (otp !== user.otp) {
            return response.status(400).json({
                message: "Invailid OTP",
                error: true,
                success: false
            })
        }

        // Check if OTP has expired (compare Date objects properly)
        const currentTime = Date.now();

        if (user.otpExpires < currentTime) {
            return response.status(400).json({
                message: "Otp is expired",
                error: true,
                success: false
            })
        }

        // Clear OTP after successful verification to prevent reuse
        user.otp = null;
        user.otpExpires = null;

        await user.save();

        return response.status(200).json({
            message: "OTP verified successfully",
            error: false,
            success: true
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }

}


//reset password
export async function resetpassword(request, response) {
    try {
        const { email, oldPassword, newPassword, confirmPassword } = request.body;
        if (!email || !newPassword || !confirmPassword) {
            return response.status(400).json({
                error: true,
                success: false,
                message: "provide required fields email, newPassword, confirmPassword"
            })
        }

        const user = await UserModel.findOne({ email });
        if (!user) {
            return response.status(400).json({
                message: "Email is not available",
                error: true,
                success: false
            })
        }


        if (user?.signUpWithGoogle === false) {
            const checkPassword = await bcryptjs.compare(oldPassword, user.password);
            if (!checkPassword) {
                return response.status(400).json({
                    message: "Old password is wrong",
                    error: true,
                    success: false,
                })
            }
        }


        if (newPassword !== confirmPassword) {
            return response.status(400).json({
                message: "New password and Confirm password must be same.",
                error: true,
                success: false,
            })
        }

        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(confirmPassword, salt);

        user.password = hashPassword;
        user.signUpWithGoogle = false;
        await user.save();

        return response.json({
            message: "Password updated successfully.",
            error: false,
            success: true
        })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}



//change password
export async function changePasswordController(request, response) {
    try {
        const { email, newPassword, confirmPassword, otp } = request.body;
        if (!email || !newPassword || !confirmPassword || !otp) {
            return response.status(400).json({
                error: true,
                success: false,
                message: "provide required fields email, newPassword, confirmPassword, otp"
            })
        }

        const user = await UserModel.findOne({ email });
        if (!user) {
            return response.status(400).json({
                message: "Email is not available",
                error: true,
                success: false
            })
        }

        // Verify OTP is valid and not expired
        if (!user.otp || user.otp !== otp) {
            return response.status(400).json({
                message: "Invalid OTP",
                error: true,
                success: false
            })
        }

        const currentTime = Date.now();
        if (user.otpExpires < currentTime) {
            return response.status(400).json({
                message: "OTP is expired",
                error: true,
                success: false
            })
        }

        if (newPassword !== confirmPassword) {
            return response.status(400).json({
                message: "New password and Confirm password must be same.",
                error: true,
                success: false,
            })
        }

        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(confirmPassword, salt);

        user.password = hashPassword;
        user.signUpWithGoogle = false;
        // Clear OTP after successful password change (single-use)
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        return response.json({
            message: "Password updated successfully.",
            error: false,
            success: true
        })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


//refresh token controler
export async function refreshToken(request, response) {
    try {
        const refreshToken = request.cookies.refreshToken || request?.headers?.authorization?.split(" ")[1]  /// [ Bearer token]

        if (!refreshToken) {
            return response.status(401).json({
                message: "Invalid token",
                error: true,
                success: false
            })
        }


        const verifyToken = await jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESH_TOKEN)
        if (!verifyToken) {
            return response.status(401).json({
                message: "Token is expired",
                error: true,
                success: false
            })
        }

        // Extract user ID from token payload (payload uses 'id' field, not '_id')
        const userId = verifyToken?.id;
        
        if (!userId) {
            return response.status(401).json({
                message: "Invalid token payload",
                error: true,
                success: false
            })
        }

        // Fetch user from database to get current role and validate refresh token
        const user = await UserModel.findById(userId);
        if (!user) {
            return response.status(401).json({
                message: "User not found",
                error: true,
                success: false
            })
        }

        // Validate the refresh token against the stored one (basic token validation)
        if (user.refresh_token !== refreshToken) {
            return response.status(401).json({
                message: "Invalid refresh token",
                error: true,
                success: false
            })
        }

        // Generate new access token with user's current role
        const newAccessToken = await generatedAccessToken(userId, user.role)

        if (!newAccessToken) {
            return response.status(500).json({
                message: "Failed to generate new access token",
                error: true,
                success: false
            })
        }

        // Generate new refresh token for rotation
        const newRefreshToken = await genertedRefreshToken(userId)
        
        // Update user's refresh token in database
        user.refresh_token = newRefreshToken;
        await user.save();

        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        }

        response.cookie('accessToken', newAccessToken, cookiesOption)
        response.cookie('refreshToken', newRefreshToken, cookiesOption)

        return response.json({
            message: "New Access token generated",
            error: false,
            success: true,
            data: {
                accessToken: newAccessToken
            }
        })

    } catch (error) {
        // Handle JWT verification errors properly
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return response.status(401).json({
                message: "Invalid or expired token",
                error: true,
                success: false
            })
        }
        
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


//get login user details
export async function userDetails(request, response) {
    try {
        const userId = request.userId

        const user = await UserModel.findById(userId).select('-password -refresh_token').populate('address_details')

        return response.json({
            message: 'user details',
            data: user,
            error: false,
            success: true
        })
    } catch (error) {
        return response.status(500).json({
            message: "Something is wrong",
            error: true,
            success: false
        })
    }
}


//review controller
export async function addReview(request, response) {
    try {

        const {image, userName, review, rating, userId, productId} = request.body;

        const userReview = new ReviewModel({
            image:image,
            userName:userName,
            review:review,
            rating:rating,
            userId:userId,
            productId:productId
        })


        await userReview.save();

        return response.json({
            message: "Review added successfully",
            error: false,
            success: true
        })
        
    } catch (error) {
        return response.status(500).json({
            message: "Something is wrong",
            error: true,
            success: false
        })
    }
}

//get reviews
export async function getReviews(request, response) {
    try {

        const productId = request.query.productId;
       

        const reviews = await ReviewModel.find({productId:productId});

        if(!reviews){
            return response.status(400).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            reviews:reviews
        })
        
    } catch (error) {
        return response.status(500).json({
            message: "Something is wrong",
            error: true,
            success: false
        })
    }
}




//get all reviews
export async function getAllReviews(request, response) {
    try {      

        const reviews = await ReviewModel.find();

        if(!reviews){
            return response.status(400).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            reviews:reviews
        })
        
    } catch (error) {
        return response.status(500).json({
            message: "Something is wrong",
            error: true,
            success: false
        })
    }
}


//get all users
export async function getAllUsers(request, response) {
    try {
        const { page, limit } = request.query;

        const totalUsers = await UserModel.find();

        const users = await UserModel.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));

        const total = await UserModel.countDocuments(users);

        if(!users){
            return response.status(400).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            users:users,
            total: total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalUsersCount:totalUsers?.length,
            totalUsers:totalUsers
        })
        
    } catch (error) {
        return response.status(500).json({
            message: "Something is wrong",
            error: true,
            success: false
        })
    }
}



export async function deleteUser(request, response) {
    const user = await UserModel.findById(request.params.id);

    if (!user) {
        return response.status(404).json({
            message: "User Not found",
            error: true,
            success: false
        })
    }


    const deletedUser = await UserModel.findByIdAndDelete(request.params.id);

    if (!deletedUser) {
        response.status(404).json({
            message: "User not deleted!",
            success: false,
            error: true
        });
    }

    return response.status(200).json({
        success: true,
        error: false,
        message: "User Deleted!",
    });
}


//delete multiple products
export async function deleteMultiple(request, response) {
    const { ids } = request.body;

    if (!ids || !Array.isArray(ids)) {
        return response.status(400).json({ error: true, success: false, message: 'Invalid input' });
    }


    try {
        await UserModel.deleteMany({ _id: { $in: ids } });
        return response.status(200).json({
            message: "Users deleted successfully",
            error: false,
            success: true
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }

}
