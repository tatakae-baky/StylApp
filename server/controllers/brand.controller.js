import BrandModel from '../models/brand.model.js';
import ProductModel from '../models/product.modal.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
    secure: true,
});

const normalizeImageInput = (value) => {
    if (Array.isArray(value)) {
        return value.filter(Boolean);
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) {
            return [];
        }

        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            try {
                const parsed = JSON.parse(trimmed);
                if (Array.isArray(parsed)) {
                    return parsed.filter(Boolean);
                }
            } catch (error) {
                // ignore malformed JSON payloads
            }
        }

        return [trimmed];
    }

    return [];
};


// Create Brand
export async function createBrand(request, response) {
    try {
        const { name, description, website, isActive, isFeatured, sortOrder, 
                metaTitle, metaDescription, establishedYear, countryOfOrigin } = request.body;

        // Generate slug from name
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        // Check if brand already exists
        const existingBrand = await BrandModel.findOne({ 
            $or: [{ name }, { slug }] 
        });

        if (existingBrand) {
            return response.status(400).json({
                message: "Brand with this name already exists",
                error: true,
                success: false
            });
        }

        const imagesFromBody = normalizeImageInput(request.body.images);
        const fallbackImage = typeof request.body.image === 'string' ? request.body.image.trim() : '';
        const finalImages = imagesFromBody.length ? imagesFromBody : (fallbackImage ? [fallbackImage] : []);
        const logo = finalImages[0] || '';

        let brand = new BrandModel({
            name,
            slug,
            description,
            logo,
            images: finalImages,
            website,
            isActive: isActive || true,
            isFeatured: isFeatured || false,
            sortOrder: sortOrder || 0,
            metaTitle: metaTitle || name,
            metaDescription,
            establishedYear,
            countryOfOrigin
        });
        brand = await brand.save();

        return response.status(201).json({
            message: "Brand created successfully",
            error: false,
            success: true,
            brand
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// Get All Brands
export async function getAllBrands(request, response) {
    try {
        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 20;
        const sortBy = request.query.sortBy || 'name';
        const sortOrder = request.query.sortOrder === 'desc' ? -1 : 1;
        const isActive = request.query.isActive;
        const isFeatured = request.query.isFeatured;

        let filter = {};
        if (isActive !== undefined) filter.isActive = isActive === 'true';
        if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';

        const totalBrands = await BrandModel.countDocuments(filter);
        const totalPages = Math.ceil(totalBrands / perPage);

        const brands = await BrandModel.find(filter)
            .sort({ [sortBy]: sortOrder })
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        // Add product counts
        const brandsWithCounts = await Promise.all(
            brands.map(async (brand) => {
                const productCount = await ProductModel.countDocuments({ 
                    brand: brand._id 
                });
                return {
                    ...brand.toObject(),
                    totalProducts: productCount
                };
            })
        );

        return response.status(200).json({
            error: false,
            success: true,
            brands: brandsWithCounts,
            totalPages,
            currentPage: page,
            totalBrands
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// Get Brand by ID
export async function getBrandById(request, response) {
    try {
        const { id } = request.params;
        const brand = await BrandModel.findById(id);

        if (!brand) {
            return response.status(404).json({
                message: "Brand not found",
                error: true,
                success: false
            });
        }

        // Get product count
        const productCount = await ProductModel.countDocuments({ brand: id });
        
        return response.status(200).json({
            error: false,
            success: true,
            brand: {
                ...brand.toObject(),
                totalProducts: productCount
            }
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// Get Brand by Slug
export async function getBrandBySlug(request, response) {
    try {
        console.log("🔍 Backend: getBrandBySlug called");
        const { slug } = request.params;
        console.log("📍 Backend: Looking for brand with slug:", slug);
        
        const brand = await BrandModel.findOne({ slug, isActive: true });
        console.log("📦 Backend: Brand query result:", brand ? "Found" : "Not found");

        if (!brand) {
            console.log("❌ Backend: Brand not found for slug:", slug);
            return response.status(404).json({
                message: "Brand not found",
                error: true,
                success: false
            });
        }

        console.log("✅ Backend: Brand found:", brand.name);
        // Get product count
        const productCount = await ProductModel.countDocuments({ brand: brand._id });
        console.log("📊 Backend: Product count for brand:", productCount);
        
        const responseData = {
            error: false,
            success: true,
            brand: {
                ...brand.toObject(),
                totalProducts: productCount
            }
        };
        
        console.log("📤 Backend: Sending response:", responseData);
        return response.status(200).json(responseData);

    } catch (error) {
        console.error("💥 Backend: Error in getBrandBySlug:", error);
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// Update Brand
export async function updateBrand(request, response) {
    try {
        const { id } = request.params;
        const updateData = { ...request.body };

        // Update slug if name is changed
        if (updateData.name) {
            updateData.slug = updateData.name.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
        }

        // Handle image updates
        const imagesFromBody = normalizeImageInput(updateData.images);
        const fallbackImage = typeof updateData.image === 'string' ? updateData.image.trim() : '';

        if (imagesFromBody.length) {
            updateData.logo = imagesFromBody[0];
            updateData.images = imagesFromBody;
        } else if (fallbackImage) {
            updateData.logo = fallbackImage;
            updateData.images = [fallbackImage];
        } else if (Object.prototype.hasOwnProperty.call(updateData, 'image') && fallbackImage === '') {
            updateData.logo = '';
            updateData.images = [];
        }

        const brand = await BrandModel.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true }
        );

        if (!brand) {
            return response.status(404).json({
                message: "Brand not found",
                error: true,
                success: false
            });
        }

        // Update product brandName if name changed
        if (updateData.name) {
            await ProductModel.updateMany(
                { brand: id },
                { brandName: updateData.name }
            );
        }

        return response.status(200).json({
            message: "Brand updated successfully",
            error: false,
            success: true,
            brand
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// Delete Brand
export async function deleteBrand(request, response) {
    try {
        const { id } = request.params;

        // Check if brand has products
        const productCount = await ProductModel.countDocuments({ brand: id });
        
        if (productCount > 0) {
            return response.status(400).json({
                message: `Cannot delete brand. It has ${productCount} associated products.`,
                error: true,
                success: false
            });
        }

        const brand = await BrandModel.findByIdAndDelete(id);

        if (!brand) {
            return response.status(404).json({
                message: "Brand not found",
                error: true,
                success: false
            });
        }

        return response.status(200).json({
            message: "Brand deleted successfully",
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

// Get Products by Brand
export async function getProductsByBrandClean(request, response) {
    try {
        const { brandId } = request.params;
        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 20;

        const totalProducts = await ProductModel.countDocuments({ brand: brandId });
        const totalPages = Math.ceil(totalProducts / perPage);

        const products = await ProductModel.find({ brand: brandId })
            .populate('category')
            .populate('brand')
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        return response.status(200).json({
            error: false,
            success: true,
            products,
            totalPages,
            currentPage: page,
            totalProducts
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}
export async function getProductsByBrand(request, response) {
    try {
        console.log("🔍 Backend: getProductsByBrand called");
        const { brandId } = request.params;
        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 20;
        
        console.log("📍 Backend: Brand ID:", brandId);
        console.log("📄 Backend: Page:", page, "Per page:", perPage);

        const totalProducts = await ProductModel.countDocuments({ brand: brandId });
        console.log("📊 Backend: Total products for brand:", totalProducts);
        
        const totalPages = Math.ceil(totalProducts / perPage);
        console.log("📊 Backend: Total pages:", totalPages);

        const products = await ProductModel.find({ brand: brandId })
            .populate('category')
            .populate('brand')
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        console.log("📦 Backend: Found products:", products?.length);
        console.log("📤 Backend: Sending products response");

        return response.status(200).json({
            error: false,
            success: true,
            products,
            totalPages,
            currentPage: page,
            totalProducts
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// Search Brands
export async function searchBrands(request, response) {
    try {
        const { query } = request.query;
        
        if (!query) {
            return response.status(400).json({
                message: "Search query is required",
                error: true,
                success: false
            });
        }

        const brands = await BrandModel.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ],
            isActive: true
        }).limit(20);

        return response.status(200).json({
            error: false,
            success: true,
            brands
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// Upload Images
export async function uploadImages(request, response) {
    try {
        const imageFiles = request.files;

        if (!Array.isArray(imageFiles) || imageFiles.length === 0) {
            return response.status(400).json({
                message: 'No images were uploaded. Please select image files to upload.',
                error: true,
                success: false
            });
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
                    // ignore cleanup failures
                }
            }
        }

        return response.status(200).json({
            images: uploadedUrls
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// Remove Image from Cloudinary
export async function removeImageFromCloudinary(request, response) {
    try {
        const imgUrl = request.query.img;
        const user = request.user;

        if (!imgUrl) {
            return response.status(400).json({
                message: "Image URL is required",
                error: true,
                success: false
            });
        }

        // Brand ownership validation for BRAND_OWNER users
        if (user.role === 'BRAND_OWNER') {
            // Find brand that contains this image and check ownership
            const brand = await BrandModel.findOne({ 
                $or: [
                    { logo: imgUrl },
                    { images: imgUrl }
                ],
                _id: user.brandId 
            });

            if (!brand) {
                return response.status(403).json({
                    error: true,
                    success: false,
                    message: "You can only delete images from your own brand"
                });
            }
        }

        const urlArr = imgUrl.split("/");
        const image = urlArr[urlArr.length - 1];
        const imageName = image.split(".")[0];

        if (imageName) {
            try {
                // Add timeout configuration for Cloudinary
                const result = await cloudinary.uploader.destroy(imageName, {
                    timeout: 60000 // 60 seconds timeout
                });
                
                console.log("Cloudinary delete result:", result);
                
                return response.status(200).json({
                    message: "Image deleted successfully",
                    error: false,
                    success: true,
                    data: result
                });
            } catch (cloudinaryError) {
                console.error("Cloudinary deletion error:", cloudinaryError);
                
                // Return success anyway since the main goal is to remove from our system
                return response.status(200).json({
                    message: "Image removed from system (Cloudinary deletion may have failed)",
                    error: false,
                    success: true,
                    warning: "Cloudinary deletion timeout"
                });
            }
        } else {
            return response.status(400).json({
                message: "Invalid image URL",
                error: true,
                success: false
            });
        }

    } catch (error) {
        console.error("Error deleting image:", error);
        return response.status(500).json({
            message: error.message || "Failed to delete image",
            error: true,
            success: false
        });
    }
}
