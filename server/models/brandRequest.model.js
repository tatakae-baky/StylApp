import mongoose from 'mongoose';

const brandRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.ObjectId, ref: 'User', default: null },
  name: { type: String, required: true },
  email: { type: String, required: true },
  brandName: { type: String, required: true },
  brandImage: { type: String, default: '' },
  description: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' }
}, { timestamps: true });

const BrandRequestModel = mongoose.model('BrandRequest', brandRequestSchema);
export default BrandRequestModel;

