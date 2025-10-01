import mongoose from 'mongoose';

/**
 * Hottest Brand Offer Schema
 * Handles the promotional brand cards displayed in the "Hottest brands on offer" section
 */
const hottestBrandOfferSchema = new mongoose.Schema({
    discount: {
        type: String,
        required: true,
        trim: true,
        // Examples: "Up to 50% off", "Min 30% off"
    },
    description: {
        type: String,
        required: true,
        trim: true,
        // Examples: "Stylish & elegant dresses", "Chic dresses & tops"
    },
    image: {
        type: String,
        required: true,
        // Cloudinary URL for the brand offer image
    },
    brandId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        required: true,
        // Reference to the actual brand that this offer links to
    },
    isActive: {
        type: Boolean,
        default: true
    },
    sortOrder: {
        type: Number,
        default: 0,
        // For controlling the display order of brand offers
    }
}, {
    timestamps: true
});

// Populate brand information when querying
hottestBrandOfferSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'brandId',
        select: 'name slug logo isActive'
    });
    next();
});

const HottestBrandOfferModel = mongoose.model('HottestBrandOffer', hottestBrandOfferSchema);

export default HottestBrandOfferModel;
