import SalesBannerModel from '../models/salesBanner.model.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
    secure: true,
});

/**
 * Sales Banner Controller
 * Handles CRUD operations for "Sales You Can't Miss" carousel banners
 */

// Image upload handler for sales banners
var salesBannerImagesArr = [];
export async function uploadImages(request, response) {
    try {
        salesBannerImagesArr = [];
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
                    salesBannerImagesArr.push(result.secure_url);
                    fs.unlinkSync(`uploads/${request.files[i].filename}`);
                }
            );
        }

        return response.status(200).json({
            images: salesBannerImagesArr
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
 * Add new sales banner
 */
export async function addSalesBanner(request, response) {
    try {
        let salesBanner = new SalesBannerModel({
            title: request.body.title,
            image: salesBannerImagesArr[0] || request.body.image,
            catId: request.body.catId || '',
            subCatId: request.body.subCatId || '',
            thirdsubCatId: request.body.thirdsubCatId || '',
            isActive: request.body.isActive !== undefined ? request.body.isActive : true,
            sortOrder: request.body.sortOrder || 0
        });

        if (!salesBanner) {
            return response.status(500).json({
                message: "Sales banner not created",
                error: true,
                success: false
            });
        }

        salesBanner = await salesBanner.save();
        salesBannerImagesArr = [];

        return response.status(200).json({
            message: "Sales banner created successfully",
            error: false,
            success: true,
            data: salesBanner
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
 * Get all sales banners
 */
export async function getSalesBanners(request, response) {
    try {
        const salesBanners = await SalesBannerModel.find().sort({ sortOrder: 1, createdAt: -1 });

        if (!salesBanners) {
            return response.status(500).json({
                error: true,
                success: false,
                message: "No sales banners found"
            });
        }

        return response.status(200).json({
            error: false,
            success: true,
            data: salesBanners
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
 * Get active sales banners for frontend
 */
export async function getActiveSalesBanners(request, response) {
    try {
        const salesBanners = await SalesBannerModel
            .find({ isActive: true })
            .sort({ sortOrder: 1, createdAt: -1 });

        return response.status(200).json({
            error: false,
            success: true,
            data: salesBanners
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
 * Get single sales banner by ID
 */
export async function getSalesBanner(request, response) {
    try {
        const salesBanner = await SalesBannerModel.findById(request.params.id);

        if (!salesBanner) {
            return response.status(404).json({
                message: "The sales banner with the given ID was not found.",
                error: true,
                success: false
            });
        }

        return response.status(200).json({
            error: false,
            success: true,
            data: salesBanner
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
 * Update sales banner
 */
export async function updateSalesBanner(request, response) {
    try {
        const salesBanner = await SalesBannerModel.findByIdAndUpdate(
            request.params.id,
            {
                title: request.body.title,
                image: salesBannerImagesArr.length > 0 ? salesBannerImagesArr[0] : request.body.image,
                catId: request.body.catId,
                subCatId: request.body.subCatId,
                thirdsubCatId: request.body.thirdsubCatId,
                isActive: request.body.isActive,
                sortOrder: request.body.sortOrder
            },
            { new: true }
        );

        if (!salesBanner) {
            return response.status(500).json({
                message: "Sales banner cannot be updated!",
                success: false,
                error: true
            });
        }

        salesBannerImagesArr = [];

        return response.status(200).json({
            error: false,
            success: true,
            data: salesBanner,
            message: "Sales banner updated successfully"
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
 * Delete sales banner
 */
export async function deleteSalesBanner(request, response) {
    try {
        const salesBanner = await SalesBannerModel.findById(request.params.id);
        
        if (!salesBanner) {
            return response.status(404).json({
                message: "Sales banner not found!",
                success: false,
                error: true
            });
        }

        // Delete image from cloudinary
        if (salesBanner.image) {
            const imgUrl = salesBanner.image;
            const urlArr = imgUrl.split("/");
            const image = urlArr[urlArr.length - 1];
            const imageName = image.split(".")[0];

            if (imageName) {
                cloudinary.uploader.destroy(imageName, (error, result) => {
                    // console.log(error, result);
                });
            }
        }

        const deletedSalesBanner = await SalesBannerModel.findByIdAndDelete(request.params.id);

        return response.status(200).json({
            success: true,
            error: false,
            message: "Sales banner deleted successfully!"
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}
