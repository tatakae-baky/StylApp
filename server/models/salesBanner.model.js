import mongoose from "mongoose";

/**
 * Sales Banner Schema
 * Handles the "Sales You Can't Miss" carousel banners
 * These replace all the scattered banner components (AdsBannerSlider, BannerBoxV2, etc.)
 */
const salesBannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        required: true
    },
    catId: {
        type: String,
        default: ''
    },
    subCatId: {
        type: String,
        default: ''
    },
    thirdsubCatId: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    },
    sortOrder: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const SalesBannerModel = mongoose.model('SalesBanner', salesBannerSchema);

export default SalesBannerModel;
