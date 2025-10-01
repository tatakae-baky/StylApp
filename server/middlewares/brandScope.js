import ProductModel from "../models/product.modal.js";
import BrandModel from "../models/brand.model.js";

// Ensure BRAND_OWNER is approved and has a brand
export const requireApprovedBrandOwner = async (req, res, next) => {
  try {
    const user = req.user; // set in authorize()
    if (!user) return res.status(401).json({ error: true, success: false, message: 'Unauthorized' });
    if (user.role === 'ADMIN') return next();
    if (user.role !== 'BRAND_OWNER' || !user.isApproved || !user.brandId) {
      return res.status(403).json({ error: true, success: false, message: 'Approved brand owner required' });
    }
    next();
  } catch (e) {
    return res.status(500).json({ error: true, success: false, message: 'Brand owner check failed' });
  }
};

// For product writes: enforce ownership; on create, force brand
export const productWriteScope = async (req, res, next) => {
  try {
    const user = req.user; // from authorize
    if (!user) return res.status(401).json({ error: true, success: false, message: 'Unauthorized' });
    if (user.role === 'ADMIN') return next();

    // create: force body.brand
    if (req.method === 'POST') {
      req.body.brand = user.brandId;
      return next();
    }

    // update/delete: verify product belongs to this brand
    const id = req.params.id || req.params.productId;
    if (!id) return res.status(400).json({ error: true, success: false, message: 'Missing product id' });
    const product = await ProductModel.findById(id).select('brand');
    if (!product) return res.status(404).json({ error: true, success: false, message: 'Product not found' });
    if (String(product.brand) !== String(user.brandId)) {
      return res.status(403).json({ error: true, success: false, message: 'Forbidden for this product' });
    }
    next();
  } catch (e) {
    return res.status(500).json({ error: true, success: false, message: 'Product scope check failed' });
  }
};

// For brand writes: only own brand updates allowed, creation ADMIN only
export const brandWriteScope = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: true, success: false, message: 'Unauthorized' });
    if (user.role === 'ADMIN') return next();

    const id = req.params.id || req.params.brandId;
    if (!id) return res.status(400).json({ error: true, success: false, message: 'Missing brand id' });
    if (String(user.brandId) !== String(id)) {
      return res.status(403).json({ error: true, success: false, message: 'Forbidden for this brand' });
    }
    next();
  } catch (e) {
    return res.status(500).json({ error: true, success: false, message: 'Brand scope check failed' });
  }
};

