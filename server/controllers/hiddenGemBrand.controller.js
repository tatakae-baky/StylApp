import HiddenGemBrandModel from '../models/hiddenGemBrand.model.js';
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
 * Hidden Gem Brand Controller
 * Handles CRUD operations for the hidden gem brands section
 */

// Image upload handler for hidden gem brands
var hiddenGemBrandImagesArr = [];

export async function uploadImages(request, response) {
    try {
        hiddenGemBrandImagesArr = [];
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
                hiddenGemBrandImagesArr.push(result.secure_url);
                
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
            images: hiddenGemBrandImagesArr,
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
 * Add new hidden gem brand
 */
export async function addHiddenGemBrand(request, response) {
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

        let hiddenGemBrand = new HiddenGemBrandModel({
            brandName: request.body.brandName,
            image: hiddenGemBrandImagesArr[0] || request.body.image,
            brandId: request.body.brandId,
            isActive: request.body.isActive !== undefined ? request.body.isActive : true,
            sortOrder: request.body.sortOrder || 0,
            position: request.body.position || 'small'
        });

        if (!hiddenGemBrand) {
            return response.status(500).json({
                message: "Hidden gem brand not created",
                error: true,
                success: false
            });
        }

        hiddenGemBrand = await hiddenGemBrand.save();
        hiddenGemBrandImagesArr = [];

        return response.status(200).json({
            message: "Hidden gem brand created successfully",
            error: false,
            success: true,
            data: hiddenGemBrand
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
 * Get all hidden gem brands (admin)
 */
export async function getHiddenGemBrands(request, response) {
    try {
        const hiddenGemBrands = await HiddenGemBrandModel.find()
            .sort({ position: -1, sortOrder: 1, createdAt: -1 }); // large position first, then small

        return response.status(200).json({
            message: "Hidden gem brands retrieved successfully",
            error: false,
            success: true,
            data: hiddenGemBrands
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
 * Get active hidden gem brands (client)
 */
export async function getActiveHiddenGemBrands(request, response) {
    try {
        const hiddenGemBrands = await HiddenGemBrandModel.find({ 
            isActive: true 
        })
        .populate({
            path: 'brandId',
            match: { isActive: true },
            select: 'name slug logo'
        })
        .sort({ position: -1, sortOrder: 1, createdAt: -1 }); // large position first, then small

        // Filter out entries where brand is inactive/null
        const activeBrands = hiddenGemBrands.filter(brand => brand.brandId);

        return response.status(200).json({
            message: "Active hidden gem brands retrieved successfully",
            error: false,
            success: true,
            data: activeBrands
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
 * Get single hidden gem brand
 */
export async function getHiddenGemBrand(request, response) {
    try {
        const { id } = request.params;
        const hiddenGemBrand = await HiddenGemBrandModel.findById(id);

        if (!hiddenGemBrand) {
            return response.status(404).json({
                message: "Hidden gem brand not found",
                error: true,
                success: false
            });
        }

        return response.status(200).json({
            message: "Hidden gem brand retrieved successfully",
            error: false,
            success: true,
            data: hiddenGemBrand
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
 * Update hidden gem brand
 */
export async function updateHiddenGemBrand(request, response) {
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

        // Get the current hidden gem brand to access old image
        const currentBrand = await HiddenGemBrandModel.findById(id);
        if (!currentBrand) {
            return response.status(404).json({
                message: "Hidden gem brand not found",
                error: true,
                success: false
            });
        }

        const updateData = {
            ...request.body
        };

        // Update image if new one is uploaded
        if (hiddenGemBrandImagesArr.length > 0) {
            // Delete old image from cloudinary if it exists and is different
            if (currentBrand.image && currentBrand.image !== hiddenGemBrandImagesArr[0]) {
                try {
                    const urlArr = currentBrand.image.split("/");
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
            
            updateData.image = hiddenGemBrandImagesArr[0];
            hiddenGemBrandImagesArr = [];
        }

        const hiddenGemBrand = await HiddenGemBrandModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        return response.status(200).json({
            message: "Hidden gem brand updated successfully",
            error: false,
            success: true,
            data: hiddenGemBrand
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
 * Delete hidden gem brand
 */
export async function deleteHiddenGemBrand(request, response) {
    try {
        const { id } = request.params;

        const hiddenGemBrand = await HiddenGemBrandModel.findById(id);

        if (!hiddenGemBrand) {
            return response.status(404).json({
                message: "Hidden gem brand not found",
                error: true,
                success: false
            });
        }

        // Delete associated image from cloudinary if it exists
        if (hiddenGemBrand.image) {
            try {
                const urlArr = hiddenGemBrand.image.split("/");
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

        // Delete the hidden gem brand document
        await HiddenGemBrandModel.findByIdAndDelete(id);

        return response.status(200).json({
            message: "Hidden gem brand deleted successfully",
            error: false,
            success: true,
            data: hiddenGemBrand
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
