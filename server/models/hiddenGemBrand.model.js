import mongoose from 'mongoose';

/**
 * Hidden Gem Brand Schema
 * Handles the brand cards displayed in the "Hidden Gem Brands" section
 */
const hiddenGemBrandSchema = new mongoose.Schema({
    brandName: {
        type: String,
        required: true,
        trim: true,
        // Custom brand name display text (can be different from actual brand name)
    },
    image: {
        type: String,
        required: true,
        // Cloudinary URL for the hidden gem brand image
    },
    brandId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        required: true,
        // Reference to the actual brand that this card links to
    },
    isActive: {
        type: Boolean,
        default: true
    },
    sortOrder: {
        type: Number,
        default: 0,
        // For controlling the display order of hidden gem brand cards
    },
    position: {
        type: String,
        enum: ['large', 'small'],
        required: true,
        // 'large' for the main left banner, 'small' for the 4 smaller cards
    }
}, {
    timestamps: true
});

// Populate brand information when querying
hiddenGemBrandSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'brandId',
        select: 'name slug logo isActive'
    });
    next();
});

const HiddenGemBrandModel = mongoose.model('HiddenGemBrand', hiddenGemBrandSchema);

export default HiddenGemBrandModel;
