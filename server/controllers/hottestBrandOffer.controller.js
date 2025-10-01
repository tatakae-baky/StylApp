import HottestBrandOfferModel from '../models/hottestBrandOffer.model.js';
import BrandModel from '../models/brand.model.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
    secure: true,
});

/**
 * Hottest Brand Offer Controller
 * Handles CRUD operations for the hottest brand offers section
 */

// Image upload handler for hottest brand offers
var hottestBrandOfferImagesArr = [];
export async function uploadImages(request, response) {
    try {
        hottestBrandOfferImagesArr = [];
        const images = request.files;

        if (!images || images.length === 0) {
            return response.status(400).json({
                message: "No images uploaded",
                error: true,
                success: false
            });
        }

        const options = {
            use_filename: true,
            unique_filename: false,
            overwrite: false,
        };

        // Process uploads sequentially to avoid race conditions
        for (let i = 0; i < images.length; i++) {
            try {
                const result = await cloudinary.uploader.upload(images[i].path, options);
                hottestBrandOfferImagesArr.push(result.secure_url);
                
                // Clean up the uploaded file
                if (fs.existsSync(`uploads/${images[i].filename}`)) {
                    fs.unlinkSync(`uploads/${images[i].filename}`);
                }
            } catch (uploadError) {
                console.error(`Error uploading image ${i}:`, uploadError);
                // Clean up the file even if upload failed
                if (fs.existsSync(`uploads/${images[i].filename}`)) {
                    fs.unlinkSync(`uploads/${images[i].filename}`);
                }
            }
        }

        return response.status(200).json({
            images: hottestBrandOfferImagesArr,
            message: "Images uploaded successfully",
            error: false,
            success: true
        });

    } catch (error) {
        console.error("Upload error:", error);
        return response.status(500).json({
            message: error.message || "Image upload failed",
            error: true,
            success: false
        });
    }
}

/**
 * Add new hottest brand offer
 */
export async function addHottestBrandOffer(request, response) {
    try {
        // Verify the brand exists and is active
        const brand = await BrandModel.findById(request.body.brandId);
        if (!brand || !brand.isActive) {
            return response.status(400).json({
                message: "Selected brand not found or inactive",
                error: true,
                success: false
            });
        }

        let hottestBrandOffer = new HottestBrandOfferModel({
            discount: request.body.discount,
            description: request.body.description,
            image: hottestBrandOfferImagesArr[0] || request.body.image,
            brandId: request.body.brandId,
            isActive: request.body.isActive !== undefined ? request.body.isActive : true,
            sortOrder: request.body.sortOrder || 0
        });

        if (!hottestBrandOffer) {
            return response.status(500).json({
                message: "Hottest brand offer not created",
                error: true,
                success: false
            });
        }

        hottestBrandOffer = await hottestBrandOffer.save();
        hottestBrandOfferImagesArr = [];

        return response.status(200).json({
            message: "Hottest brand offer created successfully",
            error: false,
            success: true,
            data: hottestBrandOffer
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

/**
 * Get all hottest brand offers (admin)
 */
export async function getHottestBrandOffers(request, response) {
    try {
        const hottestBrandOffers = await HottestBrandOfferModel.find()
            .sort({ sortOrder: 1, createdAt: -1 });

        return response.status(200).json({
            message: "Hottest brand offers retrieved successfully",
            error: false,
            success: true,
            data: hottestBrandOffers
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

/**
 * Get active hottest brand offers (client)
 */
export async function getActiveHottestBrandOffers(request, response) {
    try {
        const hottestBrandOffers = await HottestBrandOfferModel.find({ 
            isActive: true 
        })
        .populate({
            path: 'brandId',
            match: { isActive: true },
            select: 'name slug logo'
        })
        .sort({ sortOrder: 1, createdAt: -1 });

        // Filter out offers where brand is inactive/null
        const activeOffers = hottestBrandOffers.filter(offer => offer.brandId);

        return response.status(200).json({
            message: "Active hottest brand offers retrieved successfully",
            error: false,
            success: true,
            data: activeOffers
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

/**
 * Get single hottest brand offer
 */
export async function getHottestBrandOffer(request, response) {
    try {
        const { id } = request.params;
        const hottestBrandOffer = await HottestBrandOfferModel.findById(id);

        if (!hottestBrandOffer) {
            return response.status(404).json({
                message: "Hottest brand offer not found",
                error: true,
                success: false
            });
        }

        return response.status(200).json({
            message: "Hottest brand offer retrieved successfully",
            error: false,
            success: true,
            data: hottestBrandOffer
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

/**
 * Update hottest brand offer
 */
export async function updateHottestBrandOffer(request, response) {
    try {
        const { id } = request.params;

        // Verify the brand exists and is active if brandId is being updated
        if (request.body.brandId) {
            const brand = await BrandModel.findById(request.body.brandId);
            if (!brand || !brand.isActive) {
                return response.status(400).json({
                    message: "Selected brand not found or inactive",
                    error: true,
                    success: false
                });
            }
        }

        // Get the current hottest brand offer to access old image
        const currentOffer = await HottestBrandOfferModel.findById(id);
        if (!currentOffer) {
            return response.status(404).json({
                message: "Hottest brand offer not found",
                error: true,
                success: false
            });
        }

        const updateData = {
            ...request.body
        };

        // Update image if new one is uploaded
        if (hottestBrandOfferImagesArr.length > 0) {
            // Delete old image from cloudinary if it exists and is different
            if (currentOffer.image && currentOffer.image !== hottestBrandOfferImagesArr[0]) {
                try {
                    const urlArr = currentOffer.image.split("/");
                    const image = urlArr[urlArr.length - 1];
                    const imageName = image.split(".")[0];
                    
                    if (imageName) {
                        await cloudinary.uploader.destroy(imageName);
                    }
                } catch (imageError) {
                    console.error("Error deleting old image from cloudinary:", imageError);
                    // Continue with update even if old image cleanup fails
                }
            }
            
            updateData.image = hottestBrandOfferImagesArr[0];
            hottestBrandOfferImagesArr = [];
        }

        const hottestBrandOffer = await HottestBrandOfferModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        return response.status(200).json({
            message: "Hottest brand offer updated successfully",
            error: false,
            success: true,
            data: hottestBrandOffer
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

/**
 * Delete hottest brand offer
 */
export async function deleteHottestBrandOffer(request, response) {
    try {
        const { id } = request.params;

        const hottestBrandOffer = await HottestBrandOfferModel.findById(id);

        if (!hottestBrandOffer) {
            return response.status(404).json({
                message: "Hottest brand offer not found",
                error: true,
                success: false
            });
        }

        // Delete associated image from cloudinary if it exists
        if (hottestBrandOffer.image) {
            try {
                const urlArr = hottestBrandOffer.image.split("/");
                const image = urlArr[urlArr.length - 1];
                const imageName = image.split(".")[0];
                
                if (imageName) {
                    await cloudinary.uploader.destroy(imageName);
                }
            } catch (imageError) {
                console.error("Error deleting image from cloudinary:", imageError);
                // Continue with deletion even if image cleanup fails
            }
        }

        // Delete the hottest brand offer document
        await HottestBrandOfferModel.findByIdAndDelete(id);

        return response.status(200).json({
            message: "Hottest brand offer deleted successfully",
            error: false,
            success: true,
            data: hottestBrandOffer
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

/**
 * Remove image from cloudinary
 */
export async function removeImageFromCloudinary(request, response) {
    try {
        const imgUrl = request.query.img;

        if (!imgUrl) {
            return response.status(400).json({
                message: "Image URL is required",
                error: true,
                success: false
            });
        }

        const urlArr = imgUrl.split("/");
        const image = urlArr[urlArr.length - 1];
        const imageName = image.split(".")[0];

        if (imageName) {
            const res = await cloudinary.uploader.destroy(imageName);
            
            return response.status(200).json({
                message: "Image deleted successfully",
                error: false,
                success: true,
                data: res
            });
        } else {
            return response.status(400).json({
                message: "Invalid image URL format",
                error: true,
                success: false
            });
        }
    } catch (error) {
        console.error("Error deleting image:", error);
        return response.status(500).json({
            message: error.message || "Server error",
            error: true,
            success: false
        });
    }
}

/**
 * Get all brands for dropdown selection
 */
export async function getBrandsForSelection(request, response) {
    try {
        const brands = await BrandModel.find({ isActive: true })
            .select('name slug _id')
            .sort({ name: 1 });

        return response.status(200).json({
            message: "Brands retrieved successfully",
            error: false,
            success: true,
            data: brands
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}
