import HeroBannerModel from '../models/heroBanner.model.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
    secure: true,
});

/**
 * Hero Banner Controller
 * Handles CRUD operations for the 70-30 layout hero banners
 */

// Image upload handler for hero banners
var heroBannerImagesArr = [];
export async function uploadImages(request, response) {
    try {
        heroBannerImagesArr = [];
        const image = request.files;

        const options = {
            use_filename: true,
            unique_filename: false,
            overwrite: false,
        };

        for (let i = 0; i < image?.length; i++) {
            const img = await cloudinary.uploader.upload(
                image[i].path,
                options,
                function (error, result) {
                    heroBannerImagesArr.push(result.secure_url);
                    fs.unlinkSync(`uploads/${request.files[i].filename}`);
                }
            );
        }

        return response.status(200).json({
            images: heroBannerImagesArr
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
 * Add new hero banner
 */
export async function addHeroBanner(request, response) {
    try {
        let heroBanner = new HeroBannerModel({
            title: request.body.title || '',
            image: heroBannerImagesArr[0] || request.body.image,
            catId: request.body.catId || '',
            subCatId: request.body.subCatId || '',
            thirdsubCatId: request.body.thirdsubCatId || '',
            position: request.body.position,
            isActive: request.body.isActive !== undefined ? request.body.isActive : true,
            sortOrder: request.body.sortOrder || 0
        });

        if (!heroBanner) {
            return response.status(500).json({
                message: "Hero banner not created",
                error: true,
                success: false
            });
        }

        heroBanner = await heroBanner.save();
        heroBannerImagesArr = [];

        return response.status(200).json({
            message: "Hero banner created successfully",
            error: false,
            success: true,
            data: heroBanner
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
 * Get all hero banners
 */
export async function getHeroBanners(request, response) {
    try {
        const heroBanners = await HeroBannerModel.find().sort({ position: 1, sortOrder: 1 });

        if (!heroBanners) {
            return response.status(500).json({
                error: true,
                success: false,
                message: "No hero banners found"
            });
        }

        return response.status(200).json({
            error: false,
            success: true,
            data: heroBanners
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
 * Get active hero banners for frontend
 */
export async function getActiveHeroBanners(request, response) {
    try {
        const heroBanners = await HeroBannerModel
            .find({ isActive: true })
            .sort({ position: 1, sortOrder: 1 });

        return response.status(200).json({
            error: false,
            success: true,
            data: heroBanners
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
 * Get single hero banner by ID
 */
export async function getHeroBanner(request, response) {
    try {
        const heroBanner = await HeroBannerModel.findById(request.params.id);

        if (!heroBanner) {
            return response.status(404).json({
                message: "The hero banner with the given ID was not found.",
                error: true,
                success: false
            });
        }

        return response.status(200).json({
            error: false,
            success: true,
            data: heroBanner
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
 * Update hero banner
 */
export async function updateHeroBanner(request, response) {
    try {
        const heroBanner = await HeroBannerModel.findByIdAndUpdate(
            request.params.id,
            {
                title: request.body.title,
                image: heroBannerImagesArr.length > 0 ? heroBannerImagesArr[0] : request.body.image,
                catId: request.body.catId,
                subCatId: request.body.subCatId,
                thirdsubCatId: request.body.thirdsubCatId,
                position: request.body.position,
                isActive: request.body.isActive,
                sortOrder: request.body.sortOrder
            },
            { new: true }
        );

        if (!heroBanner) {
            return response.status(500).json({
                message: "Hero banner cannot be updated!",
                success: false,
                error: true
            });
        }

        heroBannerImagesArr = [];

        return response.status(200).json({
            error: false,
            success: true,
            data: heroBanner,
            message: "Hero banner updated successfully"
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
 * Delete hero banner
 */
export async function deleteHeroBanner(request, response) {
    try {
        const heroBanner = await HeroBannerModel.findById(request.params.id);
        
        if (!heroBanner) {
            return response.status(404).json({
                message: "Hero banner not found!",
                success: false,
                error: true
            });
        }

        // Delete image from cloudinary
        if (heroBanner.image) {
            const imgUrl = heroBanner.image;
            const urlArr = imgUrl.split("/");
            const image = urlArr[urlArr.length - 1];
            const imageName = image.split(".")[0];

            if (imageName) {
                cloudinary.uploader.destroy(imageName, (error, result) => {
                    // console.log(error, result);
                });
            }
        }

        const deletedHeroBanner = await HeroBannerModel.findByIdAndDelete(request.params.id);

        return response.status(200).json({
            success: true,
            error: false,
            message: "Hero banner deleted successfully!"
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}
