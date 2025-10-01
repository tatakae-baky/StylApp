import mongoose from "mongoose";

/**
 * SubCategory Section Schema
 * Handles the subcategory navigation section on the homepage
 * Each item represents a clickable category card with image and link
 */
const subCategorySectionSchema = new mongoose.Schema({
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

const SubCategorySectionModel = mongoose.model('SubCategorySection', subCategorySectionSchema);

export default SubCategorySectionModel;
