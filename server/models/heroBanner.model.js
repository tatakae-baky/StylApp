import mongoose from "mongoose";

/**
 * Hero Banner Schema
 * Handles the 70-30 layout banners that replace the HomeSlider
 * Position determines if it's main (70%) or side (30%) banner
 */
const heroBannerSchema = new mongoose.Schema({
    title: {
        type: String,
        default: '',
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
    position: {
        type: String,
        enum: ['main', 'side'],
        required: true
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

const HeroBannerModel = mongoose.model('HeroBanner', heroBannerSchema);

export default HeroBannerModel;
