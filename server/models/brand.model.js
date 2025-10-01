import mongoose from 'mongoose';

const brandSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        default: ''
    },
    logo: {
        type: String,
        default: ''
    },
    images: [{
        type: String
    }],
    ownerId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        default: null
    },
    phone: {
        type: String,
        default: ''
    },
    website: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    metaTitle: {
        type: String,
        default: ''
    },
    metaDescription: {
        type: String,
        default: ''
    },
    establishedYear: {
        type: Number
    },
    totalProducts: {
        type: Number,
        default: 0
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: function(email) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            },
            message: 'Please enter a valid email address'
        }
    }
}, {
    timestamps: true
});

// Index for search optimization
brandSchema.index({ name: 'text', description: 'text' });
// Note: slug index is automatically created by 'unique: true' field option
brandSchema.index({ isActive: 1, isFeatured: 1 });

const BrandModel = mongoose.model('Brand', brandSchema);
export default BrandModel;
