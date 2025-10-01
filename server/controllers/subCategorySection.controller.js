import SubCategorySectionModel from '../models/subCategorySection.model.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
    secure: true,
});

// Store uploaded images
var imagesArr = [];

/**
 * Upload images to cloudinary
 */
export async function uploadImages(request, response) {
    try {
        imagesArr = [];
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
                    imagesArr.push(result.secure_url);
                    fs.unlinkSync(`uploads/${request.files[i].filename}`);
                }
            );
        }

        return response.status(200).json({
            images: imagesArr
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
 * Add new subcategory section item
 */
export async function addSubCategorySection(request, response) {
    try {
        let subCategorySection = new SubCategorySectionModel({
            title: request.body.title,
            image: request.body.image,
            catId: request.body.catId,
            subCatId: request.body.subCatId,
            thirdsubCatId: request.body.thirdsubCatId,
            isActive: request.body.isActive !== undefined ? request.body.isActive : true,
            sortOrder: request.body.sortOrder || 0
        });

        if (!subCategorySection) {
            return response.status(500).json({
                message: "SubCategory section not created",
                error: true,
                success: false
            });
        }

        subCategorySection = await subCategorySection.save();
        
        // Clear images array after saving
        imagesArr = [];

        return response.status(200).json({
            message: "SubCategory section created successfully",
            error: false,
            success: true,
            data: subCategorySection
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
 * Get all subcategory section items
 */
export async function getSubCategorySections(request, response) {
    try {
        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 10;
        const totalPosts = await SubCategorySectionModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);

        const subCategorySections = await SubCategorySectionModel.find()
            .sort({ sortOrder: 1, createdAt: -1 })
            .skip((page - 1) * perPage)
            .limit(perPage);

        return response.status(200).json({
            subCategorySections: subCategorySections,
            totalPages: totalPages,
            page: page,
            perPage: perPage
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
 * Get subcategory section by id
 */
export async function getSubCategorySectionById(request, response) {
    try {
        const subCategorySection = await SubCategorySectionModel.findById(request.params.id);

        if (!subCategorySection) {
            return response.status(404).json({
                message: "SubCategory section not found",
                error: true,
                success: false
            });
        }

        return response.status(200).json({
            subCategorySection: subCategorySection,
            error: false,
            success: true
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
 * Update subcategory section
 */
export async function updateSubCategorySection(request, response) {
    try {
        const { id } = request.params;
        const updateData = {
            title: request.body.title,
            image: request.body.image,
            catId: request.body.catId,
            subCatId: request.body.subCatId,
            thirdsubCatId: request.body.thirdsubCatId,
            isActive: request.body.isActive,
            sortOrder: request.body.sortOrder
        };

        const subCategorySection = await SubCategorySectionModel.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true }
        );

        if (!subCategorySection) {
            return response.status(404).json({
                message: "SubCategory section not found",
                error: true,
                success: false
            });
        }

        return response.status(200).json({
            message: "SubCategory section updated successfully",
            error: false,
            success: true,
            data: subCategorySection
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
 * Delete subcategory section
 */
export async function deleteSubCategorySection(request, response) {
    try {
        const subCategorySection = await SubCategorySectionModel.findByIdAndDelete(request.params.id);

        if (!subCategorySection) {
            return response.status(404).json({
                message: "SubCategory section not found",
                error: true,
                success: false
            });
        }

        return response.status(200).json({
            message: "SubCategory section deleted successfully",
            error: false,
            success: true
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
 * Get active subcategory sections for frontend
 */
export async function getActiveSubCategorySections(request, response) {
    try {
        const subCategorySections = await SubCategorySectionModel.find({ isActive: true })
            .sort({ sortOrder: 1, createdAt: -1 });

        return response.status(200).json({
            subCategorySections: subCategorySections,
            error: false,
            success: true
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
    const imgUrl = request.query.img;

    const urlArr = imgUrl.split("/");
    const image = urlArr[urlArr.length - 1];

    const imageName = image.split(".")[0];

    if (imageName) {
        const res = await cloudinary.uploader.destroy(
            imageName,
            (error, result) => {
                // console.log(error, res)
            }
        );

        if (res) {
            response.status(200).send(res);
        }
    }
}
