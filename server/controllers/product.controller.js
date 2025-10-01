import ProductModel from '../models/product.modal.js';
import ProductSIZEModel from '../models/productSIZE.js';

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';


cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
    secure: true,
});

const normalizeImagesInput = (value) => {
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




//image upload
export async function uploadImages(request, response) {
    try {
        const imageFiles = request.files;

        if (!Array.isArray(imageFiles) || imageFiles.length === 0) {
            return response.status(400).json({
                message: "No images were uploaded. Please select image files to upload.",
                error: true,
                success: false,
                code: 'NO_FILES_PROVIDED'
            });
        }

        const options = {
            use_filename: true,
            unique_filename: false,
            overwrite: false,
        };

        const uploadPromises = imageFiles.map(async (file, index) => {
            try {
                const result = await cloudinary.uploader.upload(file.path, options);
                fs.unlinkSync(`uploads/${file.filename}`);
                return result.secure_url;
            } catch (error) {
                try {
                    fs.unlinkSync(`uploads/${file.filename}`);
                } catch (unlinkError) {
                    console.error(`Error deleting file ${file.filename}:`, unlinkError);
                }
                throw error;
            }
        });

        const uploadedImageUrls = await Promise.all(uploadPromises);

        return response.status(200).json({
            images: uploadedImageUrls,
            error: false,
            success: true,
            message: `Successfully uploaded ${uploadedImageUrls.length} image(s)`
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

//create product
export async function createProduct(request, response) {
    try {
        const normalizedImages = normalizeImagesInput(request.body.images);
        const fallbackImages = normalizeImagesInput(request.body.image);
        const productImages = (Array.isArray(request.body.images) || typeof request.body.images === 'string')
            ? normalizedImages
            : fallbackImages;

        let product = new ProductModel({
            name: request.body.name,
            description: request.body.description,
            images: productImages,
            brand: request.body.brand,
            price: request.body.price,
            oldPrice: request.body.oldPrice,
            catName: request.body.catName,
            category: request.body.category,
            catId: request.body.catId,
            subCatId: request.body.subCatId,
            subCat: request.body.subCat,
            thirdsubCat: request.body.thirdsubCat,
            thirdsubCatId: request.body.thirdsubCatId,
            countInStock: 0, // Will be calculated from size stock
            rating: request.body.rating,
            isFeatured: request.body.isFeatured,
            isPopular: request.body.isPopular,
            discount: request.body.discount,
            size: request.body.size,

        });

        product = await product.save();

        if (!product) {
            return response.status(500).json({
                error: true,
                success: false,
                message: "Product Not created"
            });
        }

        return response.status(200).json({
            message: "Product Created successfully",
            error: false,
            success: true,
            product: product
        })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}



//get all products
export async function getAllProducts(request, response) {
    try {

        const { page, limit } = request.query;
        const totalProducts = await ProductModel.find();

        const products = await ProductModel.find().populate('brand', 'name slug').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));

        const total = await ProductModel.countDocuments(products);

        if (!products) {
            return response.status(400).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
            total: total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalCount: totalProducts?.length,
            totalProducts: totalProducts
        })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


//get all products by category id
export async function getAllProductsByCatId(request, response) {
    try {

        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 10000;


        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);

        if (page > totalPages) {
            return response.status(404).json(
                {
                    message: "Page not found",
                    success: false,
                    error: true
                }
            );
        }

        const products = await ProductModel.find({
            catId: request.params.id
        }).populate("category").populate('brand', 'name slug')
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!products) {
            response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
            totalPages: totalPages,
            page: page,
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


//get all products by category name
export async function getAllProductsByCatName(request, response) {
    try {

        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 10000;


        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);

        if (page > totalPages) {
            return response.status(404).json(
                {
                    message: "Page not found",
                    success: false,
                    error: true
                }
            );
        }


        const products = await ProductModel.find({
            catName: request.query.catName
        }).populate("category").populate('brand', 'name slug')
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!products) {
            response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
            totalPages: totalPages,
            page: page,
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}



//get all products by sub category id
export async function getAllProductsBySubCatId(request, response) {
    try {

        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 10000;


        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);

        if (page > totalPages) {
            return response.status(404).json(
                {
                    message: "Page not found",
                    success: false,
                    error: true
                }
            );
        }

        const products = await ProductModel.find({
            subCatId: request.params.id
        }).populate("category").populate('brand', 'name slug')
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!products) {
            response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
            totalPages: totalPages,
            page: page,
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


//get all products by sub category name
export async function getAllProductsBySubCatName(request, response) {
    try {

        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 10000;


        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);

        if (page > totalPages) {
            return response.status(404).json(
                {
                    message: "Page not found",
                    success: false,
                    error: true
                }
            );
        }


        const products = await ProductModel.find({
            subCat: request.query.subCat
        }).populate("category").populate('brand', 'name slug')
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!products) {
            response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
            totalPages: totalPages,
            page: page,
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}




//get all products by sub category id
export async function getAllProductsByThirdLavelCatId(request, response) {
    try {

        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 10000;


        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);

        if (page > totalPages) {
            return response.status(404).json(
                {
                    message: "Page not found",
                    success: false,
                    error: true
                }
            );
        }

        const products = await ProductModel.find({
            thirdsubCatId: request.params.id
        }).populate("category").populate('brand', 'name slug')
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!products) {
            response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
            totalPages: totalPages,
            page: page,
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


//get all products by sub category name
export async function getAllProductsByThirdLavelCatName(request, response) {
    try {

        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 10000;


        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);

        if (page > totalPages) {
            return response.status(404).json(
                {
                    message: "Page not found",
                    success: false,
                    error: true
                }
            );
        }


        const products = await ProductModel.find({
            thirdsubCat: request.query.thirdsubCat
        }).populate("category").populate('brand', 'name slug')
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!products) {
            response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
            totalPages: totalPages,
            page: page,
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


//get all products by price

export async function getAllProductsByPrice(request, response) {
    let productList = [];

    if (request.query.catId !== "" && request.query.catId !== undefined) {
        const productListArr = await ProductModel.find({
            catId: request.query.catId,
        }).populate("category").populate('brand', 'name slug');

        productList = productListArr;
    }

    if (request.query.subCatId !== "" && request.query.subCatId !== undefined) {
        const productListArr = await ProductModel.find({
            subCatId: request.query.subCatId,
        }).populate("category").populate('brand', 'name slug');

        productList = productListArr;
    }


    if (request.query.thirdsubCatId !== "" && request.query.thirdsubCatId !== undefined) {
        const productListArr = await ProductModel.find({
            thirdsubCatId: request.query.thirdsubCatId,
        }).populate("category").populate('brand', 'name slug');

        productList = productListArr;
    }



    const filteredProducts = productList.filter((product) => {
        if (request.query.minPrice && product.price < parseInt(+request.query.minPrice)) {
            return false;
        }
        if (request.query.maxPrice && product.price > parseInt(+request.query.maxPrice)) {
            return false;
        }
        return true;
    });

    return response.status(200).json({
        error: false,
        success: true,
        products: filteredProducts,
        totalPages: 0,
        page: 0,
    });

}



//get all products by rating
export async function getAllProductsByRating(request, response) {
    try {

        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 10000;


        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);

        if (page > totalPages) {
            return response.status(404).json(
                {
                    message: "Page not found",
                    success: false,
                    error: true
                }
            );
        }

        console.log(request.query.subCatId)

        let products = [];

        if (request.query.catId !== undefined) {

            products = await ProductModel.find({
                rating: request.query.rating,
                catId: request.query.catId,

            }).populate("category").populate('brand', 'name slug')
                .skip((page - 1) * perPage)
                .limit(perPage)
                .exec();
        }

        if (request.query.subCatId !== undefined) {

            products = await ProductModel.find({
                rating: request.query.rating,
                subCatId: request.query.subCatId,

            }).populate("category").populate('brand', 'name slug')
                .skip((page - 1) * perPage)
                .limit(perPage)
                .exec();
        }


        if (request.query.thirdsubCatId !== undefined) {

            products = await ProductModel.find({
                rating: request.query.rating,
                thirdsubCatId: request.query.thirdsubCatId,

            }).populate("category").populate('brand', 'name slug')
                .skip((page - 1) * perPage)
                .limit(perPage)
                .exec();
        }


        if (!products) {
            response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
            totalPages: totalPages,
            page: page,
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


//get all products count

export async function getProductsCount(request, response) {
    try {
        const productsCount = await ProductModel.countDocuments();

        if (!productsCount) {
            response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            productCount: productsCount
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}



//get all features products
export async function getAllFeaturedProducts(request, response) {
    try {

        const products = await ProductModel.find({
            isFeatured: true
        }).populate("category").populate('brand', 'name slug');

        if (!products) {
            response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//get all popular products
export async function getAllPopularProducts(request, response) {
    try {

        const products = await ProductModel.find({
            isPopular: true
        }).populate("category").populate('brand', 'name slug');

        if (!products) {
            response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


//delete product
export async function deleteProduct(request, response) {

    const product = await ProductModel.findById(request.params.id).populate("category");

    if (!product) {
        return response.status(404).json({
            message: "Product Not found",
            error: true,
            success: false
        })
    }

    const images = product.images;

    let img = "";
    for (img of images) {
        const imgUrl = img;
        const urlArr = imgUrl.split("/");
        const image = urlArr[urlArr.length - 1];

        const imageName = image.split(".")[0];

        if (imageName) {
            cloudinary.uploader.destroy(imageName, (error, result) => {
                // console.log(error, result);
            });
        }


    }

    const deletedProduct = await ProductModel.findByIdAndDelete(request.params.id);

    if (!deletedProduct) {
        response.status(404).json({
            message: "Product not deleted!",
            success: false,
            error: true
        });
    }

    return response.status(200).json({
        success: true,
        error: false,
        message: "Product Deleted!",
    });
}


//delete multiple products
export async function deleteMultipleProduct(request, response) {
    const { ids } = request.body;

    if (!ids || !Array.isArray(ids)) {
        return response.status(400).json({ error: true, success: false, message: 'Invalid input' });
    }


    for (let i = 0; i < ids?.length; i++) {
        const product = await ProductModel.findById(ids[i]);

        const images = product.images;

        let img = "";
        for (img of images) {
            const imgUrl = img;
            const urlArr = imgUrl.split("/");
            const image = urlArr[urlArr.length - 1];

            const imageName = image.split(".")[0];

            if (imageName) {
                cloudinary.uploader.destroy(imageName, (error, result) => {
                    // console.log(error, result);
                });
            }


        }

    }

    try {
        await ProductModel.deleteMany({ _id: { $in: ids } });
        return response.status(200).json({
            message: "Product delete successfully",
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

//get single product 
export async function getProduct(request, response) {
    try {
        const product = await ProductModel.findById(request.params.id).populate("category").populate('brand', 'name slug');

        if (!product) {
            return response.status(404).json({
                message: "The product is not found",
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            product: product
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//delete images
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

        // Brand ownership validation for BRAND_OWNER users
        if (user.role === 'BRAND_OWNER') {
            // Find product that contains this image and check brand ownership
            const product = await ProductModel.findOne({ 
                images: imgUrl,
                brand: user.brandId 
            });

            // Check if image belongs to a product owned by another brand
            const otherBrandProduct = await ProductModel.findOne({ 
                images: imgUrl,
                brand: { $ne: user.brandId } 
            });

            if (otherBrandProduct) {
                return response.status(403).json({
                    error: true,
                    success: false,
                    message: "You can only delete images from your own products"
                });
            }

            // Allow deletion if:
            // 1. Image belongs to user's own product (product exists)
            // 2. Image is orphaned/newly uploaded (no product found)
        }

        // Proceed with Cloudinary deletion
        const urlArr = imgUrl.split("/");
        const image = urlArr[urlArr.length - 1];
        const imageName = image.split(".")[0];

        if (imageName) {
            const res = await cloudinary.uploader.destroy(imageName);
            
            return response.status(200).json({
                error: false,
                success: true,
                message: "Image deleted successfully",
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


//updated product 
export async function updateProduct(request, response) {
    try {
        const normalizedImages = normalizeImagesInput(request.body.images);
        const fallbackImages = normalizeImagesInput(request.body.image);
        const productImages = (Array.isArray(request.body.images) || typeof request.body.images === 'string')
            ? normalizedImages
            : fallbackImages;

        const product = await ProductModel.findByIdAndUpdate(
            request.params.id,
            {
                name: request.body.name,
                subCat: request.body.subCat,
                description: request.body.description,
                images: productImages,
                brand: request.body.brand,
                price: request.body.price,
                oldPrice: request.body.oldPrice,
                catId: request.body.catId,
                catName: request.body.catName,
                subCat: request.body.subCat,
                subCatId: request.body.subCatId,
                category: request.body.category,
                thirdsubCat: request.body.thirdsubCat,
                thirdsubCatId: request.body.thirdsubCatId,
                countInStock: request.body.countInStock,
                rating: request.body.rating,
                isFeatured: request.body.isFeatured,
                isPopular: request.body.isPopular,
                discount: request.body.discount,
                size: request.body.size,
            },
            { new: true }
        );


        if (!product) {
            return response.status(404).json({
                message: "the product can not be updated!",
                status: false,
            });
        }

        return response.status(200).json({
            message: "The product is updated",
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




export async function createProductSize(request, response) {
    try {
        let productSize = new ProductSIZEModel({
            name: request.body.name
        })

        productSize = await productSize.save();

        if (!productSize) {
            response.status(500).json({
                error: true,
                success: false,
                message: "Product size Not created"
            });
        }

        return response.status(200).json({
            message: "Product size Created successfully",
            error: false,
            success: true,
            product: productSize
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}



export async function deleteProductSize(request, response) {
    const productSize = await ProductSIZEModel.findById(request.params.id);

    if (!productSize) {
        return response.status(404).json({
            message: "Item Not found",
            error: true,
            success: false
        })
    }

    const deletedProductSize = await ProductSIZEModel.findByIdAndDelete(request.params.id);

    if (!deletedProductSize) {
        response.status(404).json({
            message: "Item not deleted!",
            success: false,
            error: true
        });
    }

    return response.status(200).json({
        success: true,
        error: false,
        message: "Product size Deleted!",
    });
}


export async function updateProductSize(request, response) {

    try {

        const productSize = await ProductSIZEModel.findByIdAndUpdate(
            request.params.id,
            {
                name: request.body.name,
            },
            { new: true }
        );


        if (!productSize) {
            return response.status(404).json({
                message: "the product size can not be updated!",
                status: false,
            });
        }

        return response.status(200).json({
            message: "The product size is updated",
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


export async function getProductSize(request, response) {

    try {

        const productSize = await ProductSIZEModel.find();

        if (!productSize) {
            return response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            data: productSize
        })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


export async function getProductSizeById(request, response) {

    try {

        const productSize = await ProductSIZEModel.findById(request.params.id);

        if (!productSize) {
            return response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            data: productSize
        })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}



export async function filters(request, response) {
    const { catId, subCatId, thirdsubCatId, brandId, minPrice, maxPrice, rating, page, limit } = request.body;

    const filters = {}

    if (catId?.length) {
        filters.catId = { $in: catId }
    }

    if (subCatId?.length) {
        filters.subCatId = { $in: subCatId }
    }

    if (thirdsubCatId?.length) {
        filters.thirdsubCatId = { $in: thirdsubCatId }
    }

    if (brandId?.length) {
        filters.brand = { $in: brandId }
    }

    if (minPrice || maxPrice) {
        filters.price = { $gte: +minPrice || 0, $lte: +maxPrice || Infinity };
    }

    if (rating?.length) {
        filters.rating = { $in: rating }
    }

    try {

        const products = await ProductModel.find(filters).populate("category").populate('brand', 'name slug').skip((page - 1) * limit).limit(parseInt(limit));

        const total = await ProductModel.countDocuments(filters);

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
            total: total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }


}


// Sort function
const sortItems = (products, sortBy, order) => {
    return products.sort((a, b) => {
        if (sortBy === 'name') {
            return order === 'asc'
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name);
        }
        if (sortBy === 'price') {
            return order === 'asc' ? a.price - b.price : b.price - a.price;
        }
        return 0; // Default
    });
};


export async function sortBy(request, response) {
    const { products, sortBy, order } = request.body;
    const sortedItems = sortItems([...products?.products], sortBy, order);
    return response.status(200).json({
        error: false,
        success: true,
        products: sortedItems,
        totalPages: 0,
        page: 0,
    });
}




export async function searchProductController(request, response) {
    try {

        const {query, page = 1, limit = 20 } = request.body;

        if (!query) {
            return response.status(400).json({
                error: true,
                success: false,
                message: "Query is required"
            });
        }

        // Convert page and limit to numbers
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Normalize the search query for better matching
        const normalizedQuery = query.trim();
        
        // Create variations of the query to handle different spellings
        const queryVariations = [];
        
        // Add original query
        queryVariations.push(normalizedQuery);
        
        // Add query without hyphens/spaces for cases like "t-shirt" -> "tshirt"
        const withoutSeparators = normalizedQuery.replace(/[-\s]+/g, '');
        if (withoutSeparators !== normalizedQuery) {
            queryVariations.push(withoutSeparators);
        }
        
        // Add query with hyphens for cases like "tshirt" -> "t-shirt"
        if (normalizedQuery.length > 3 && !normalizedQuery.includes('-') && !normalizedQuery.includes(' ')) {
            // Try to split common combinations
            const withHyphen = normalizedQuery.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
            if (withHyphen !== normalizedQuery.toLowerCase()) {
                queryVariations.push(withHyphen);
            }
            // Common word combinations
            if (normalizedQuery.toLowerCase().includes('shirt')) {
                queryVariations.push(normalizedQuery.toLowerCase().replace('shirt', '-shirt'));
                queryVariations.push(normalizedQuery.toLowerCase().replace('shirt', ' shirt'));
            }
        }

        // Build search criteria with prioritized matching
        const searchConditions = [];
        
        // For each variation, create search conditions
        queryVariations.forEach(variation => {
            searchConditions.push(
                { name: { $regex: variation, $options: "i" } },
                { brandName: { $regex: variation, $options: "i" } },
                { catName: { $regex: variation, $options: "i" } },
                { subCat: { $regex: variation, $options: "i" } },
                { thirdsubCat: { $regex: variation, $options: "i" } }
            );
        });

        const searchCriteria = {
            $or: searchConditions
        };

        // Get total count for pagination
        const totalCount = await ProductModel.countDocuments(searchCriteria);

        // Get paginated products
        const products = await ProductModel.find(searchCriteria)
            .populate("category")
            .populate('brand', 'name slug')
            .skip(skip)
            .limit(limitNum)
            .sort({ createdAt: -1 }); // Sort by newest first

        const totalPages = Math.ceil(totalCount / limitNum);

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
            total: totalCount,
            page: pageNum,
            totalPages: totalPages,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1
        })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Size-wise Stock Management Functions

/**
 * Update stock for sizes of a product
 */
export const updateSizeStock = async (request, response) => {
    try {
        const { productId } = request.params;
        const { updates } = request.body;

        if (!productId || !Array.isArray(updates) || updates.length === 0) {
            return response.status(400).json({
                error: true,
                success: false,
                message: "Product ID and updates array are required"
            });
        }

        const product = await ProductModel.findById(productId);
        if (!product) {
            return response.status(404).json({
                error: true,
                success: false,
                message: "Product not found"
            });
        }

        // Update each size stock
        updates.forEach(update => {
            const { size, stock } = update;
            const sizeIndex = product.sizeStock.findIndex(s => s.size === size);
            
            if (sizeIndex !== -1) {
                // Update existing size stock
                product.sizeStock[sizeIndex].stock = parseInt(stock);
            } else {
                // Add new size stock entry
                product.sizeStock.push({ 
                    size: size, 
                    stock: parseInt(stock),
                    sold: 0
                });
            }
        });

        // Update total countInStock (sum of all size stocks)
        product.countInStock = product.sizeStock.reduce((total, item) => total + item.stock, 0);

        await product.save();

        return response.status(200).json({
            success: true,
            error: false,
            message: "Size stock updated successfully",
            data: {
                productId: product._id,
                totalStock: product.countInStock,
                sizeStock: product.sizeStock
            }
        });

    } catch (error) {
        return response.status(500).json({
            error: true,
            success: false,
            message: error.message || error
        });
    }
};

/**
 * Get size-wise stock availability for a product
 */
export const getSizeStockAvailability = async (request, response) => {
    try {
        const { productId } = request.params;

        const product = await ProductModel.findById(productId);
        if (!product) {
            return response.status(404).json({
                error: true,
                message: "Product not found"
            });
        }

        const availability = product.sizeStock.map(s => ({
            size: s.size,
            stock: s.stock,
            sold: s.sold,
            available: s.stock // stock field represents available stock
        }));

        return response.status(200).json({
            success: true,
            error: false,
            data: availability
        });

    } catch (error) {
        return response.status(500).json({
            error: true,
            success: false,
            message: error.message || error
        });
    }
};

/**
 * Bulk update stock for all sizes of a product
 */
export const bulkUpdateSizeStock = async (request, response) => {
    try {
        const { productId, sizeStocks } = request.body;

        if (!productId || !Array.isArray(sizeStocks)) {
            return response.status(400).json({
                error: true,
                message: "Product ID and sizeStocks array are required"
            });
        }

        const product = await ProductModel.findById(productId);
        if (!product) {
            return response.status(404).json({
                error: true,
                message: "Product not found"
            });
        }

        // Update each size stock
        for (const sizeUpdate of sizeStocks) {
            const { size, stock } = sizeUpdate;
            
            if (!size || stock === undefined) {
                continue; // Skip invalid entries
            }

            const sizeIndex = product.sizeStock.findIndex(s => s.size === size);
            
            if (sizeIndex !== -1) {
                // Update existing size
                product.sizeStock[sizeIndex].stock = parseInt(stock);
            } else {
                // Add new size
                product.sizeStock.push({
                    size: size,
                    stock: parseInt(stock),
                    reserved: 0,
                    sold: 0
                });
            }
        }

        // Update total countInStock
        product.countInStock = product.sizeStock.reduce((total, item) => total + item.stock, 0);

        await product.save();

        return response.status(200).json({
            success: true,
            error: false,
            message: "Bulk size stock update completed",
            data: {
                productId: product._id,
                totalStock: product.countInStock,
                updatedSizes: sizeStocks.length
            }
        });

    } catch (error) {
        return response.status(500).json({
            error: true,
            success: false,
            message: error.message || error
        });
    }
};