import BrandRequestModel from '../models/brandRequest.model.js';
import UserModel from '../models/user.model.js';
import BrandModel from '../models/brand.model.js';
import bcryptjs from 'bcryptjs';
import sendEmailFun from '../config/sendEmail.js';
import BrandOwnerInviteTemplate from '../utils/brandOwnerInviteTemplate.js';
import cloudinary from 'cloudinary';
import fs from 'fs';

const extractFirstImage = (value) => {
  if (Array.isArray(value)) {
    return value.find(Boolean) || '';
  }

  if (typeof value === 'string') {
    return value.trim();
  }

  return '';
};

export async function createBrandRequest(request, response) {
  try {
    const { name, email, brandName, description, phone } = request.body;
    if (!name || !email || !brandName || !description || !phone) {
      return response.status(400).json({ error: true, success: false, message: 'All fields are required' });
    }

    const brandImageSource = request.body.brandImage ?? request.body.brandImages ?? request.body.images ?? request.body.image;
    const brandImage = extractFirstImage(brandImageSource);

    const doc = await BrandRequestModel.create({
      userId: request.userId || null,
      name,
      email,
      brandName,
      brandImage,
      description,
      phone
    });

    return response.status(201).json({ error: false, success: true, request: doc });
  } catch (err) {
    return response.status(500).json({ error: true, success: false, message: err.message || err });
  }
}

export async function listBrandRequests(request, response) {
  try {
    const { status = 'PENDING', page = 1, limit = 20 } = request.query;
    const query = status ? { status } : {};
    const total = await BrandRequestModel.countDocuments(query);
    const requests = await BrandRequestModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    return response.status(200).json({ error: false, success: true, requests, total, page: parseInt(page) });
  } catch (err) {
    return response.status(500).json({ error: true, success: false, message: err.message || err });
  }
}

export async function approveBrandRequest(request, response) {
  try {
    const { id } = request.params;
    const reqDoc = await BrandRequestModel.findById(id);
    if (!reqDoc) return response.status(404).json({ error: true, success: false, message: 'Request not found' });

    // Find or auto-create user by email
    let user = await UserModel.findOne({ email: reqDoc.email });
    let generatedPassword = null;
    let userWasCreated = false;

    if (!user) {
      // Generate a secure, random temp password
      const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@$!%*?&';
      generatedPassword = Array.from({ length: 12 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
      const salt = await bcryptjs.genSalt(10);
      const hashPassword = await bcryptjs.hash(generatedPassword, salt);

      user = await UserModel.create({
        name: reqDoc.name,
        email: reqDoc.email,
        password: hashPassword,
        verify_email: true, // allow immediate login
        status: 'Active'
      });
      userWasCreated = true;
    }

    // Create brand if not exists for this owner
    const slug = reqDoc.brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let brand = await BrandModel.findOne({ slug });
    if (!brand) {
      brand = await BrandModel.create({
        name: reqDoc.brandName,
        slug,
        description: reqDoc.description,
        logo: reqDoc.brandImage || '',
        images: reqDoc.brandImage ? [reqDoc.brandImage] : [],
        website: '',
        isActive: true,
        isFeatured: false,
        sortOrder: 0,
        metaTitle: reqDoc.brandName,
        metaDescription: reqDoc.description?.slice(0, 160) || '',
        establishedYear: undefined,
        countryOfOrigin: '',
        ownerId: user._id,
        phone: reqDoc.phone,
        email: reqDoc.email
      });
    }

    // Update user role and association
    user.role = 'BRAND_OWNER';
    user.brandId = brand._id;
    user.isApproved = true;
    user.verify_email = true; // ensure they can log in
    await user.save();

    reqDoc.status = 'APPROVED';
    await reqDoc.save();

    // Send approval email for both new and existing users
    try {
      const adminUrl = process.env.ADMIN_PANEL_URL || 'http://localhost:5174';
      
      let emailContent;
      if (userWasCreated && generatedPassword) {
        // New user - send credentials
        emailContent = {
          subject: 'Your Brand Partner Account for Stylin',
          text: `Your account is approved. Email: ${reqDoc.email}, Temporary Password: ${generatedPassword}. Login: ${adminUrl}`,
          html: BrandOwnerInviteTemplate({
            name: reqDoc.name,
            email: reqDoc.email,
            tempPassword: generatedPassword,
            brandName: reqDoc.brandName,
            adminUrl
          })
        };
      } else {
        // Existing user - send approval notification
        emailContent = {
          subject: 'Brand Partnership Approved - Stylin',
          text: `Your brand partnership request for ${reqDoc.brandName} has been approved. Login: ${adminUrl}`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111">
              <h2>Brand Partnership Approved</h2>
              <p>Hi ${reqDoc.name},</p>
              <p>Your request to become a brand partner for <strong>${reqDoc.brandName}</strong> has been approved.</p>
              <p>You can now access the admin panel with your existing account:</p>
              <div style="margin:16px 0; padding:12px 16px; background:#f6f8fa; border:1px solid #e5e7eb; border-radius:8px;">
                <div><strong>Login URL:</strong> <a href="${adminUrl}" target="_blank">${adminUrl}</a></div>
                <div><strong>Email:</strong> ${reqDoc.email}</div>
              </div>
              <p style="margin-top: 24px; color:#555">— Stylin Admin</p>
            </div>`
        };
      }
      
      await sendEmailFun({
        sendTo: reqDoc.email,
        ...emailContent
      });
      
    } catch (e) {
      console.error('Error sending brand approval email:', e?.message || e);
    }

    return response.status(200).json({ error: false, success: true, message: 'Approved', brandId: brand._id, userId: user._id, userCreated: userWasCreated });
  } catch (err) {
    return response.status(500).json({ error: true, success: false, message: err.message || err });
  }
}

export async function rejectBrandRequest(request, response) {
  try {
    const { id } = request.params;
    const reqDoc = await BrandRequestModel.findById(id);
    if (!reqDoc) return response.status(404).json({ error: true, success: false, message: 'Request not found' });
    reqDoc.status = 'REJECTED';
    await reqDoc.save();
    return response.status(200).json({ error: false, success: true, message: 'Rejected' });
  } catch (err) {
    return response.status(500).json({ error: true, success: false, message: err.message || err });
  }
}

// Upload Images for Brand Requests
export async function uploadImages(request, response) {
  try {
    const images = request.files;

    if (!Array.isArray(images) || images.length === 0) {
      return response.status(400).json({
        message: 'No images were uploaded. Please select image files to upload.',
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

    const uploadPromises = images.map(async (image, index) => {
      try {
        const result = await cloudinary.uploader.upload(image.path, options);
        fs.unlinkSync(`uploads/${image.filename}`);
        return result.secure_url;
      } catch (error) {
        try {
          fs.unlinkSync(`uploads/${image.filename}`);
        } catch (unlinkError) {
          console.error(`Error deleting file ${image.filename}:`, unlinkError);
        }
        throw error;
      }
    });

    const uploadedUrls = await Promise.all(uploadPromises);

    return response.status(200).json({
      images: uploadedUrls,
      error: false,
      success: true,
      message: `Successfully uploaded ${uploadedUrls.length} image(s)`
    });

  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
}

// Delete uploaded image
export async function deleteImage(request, response) {
    try {
        const { img } = request.query;
        
        if (!img) {
            return response.status(400).json({
                message: "Image URL is required",
                error: true,
                success: false
            });
        }

        // Decode the URL in case it was encoded
        const imageUrl = decodeURIComponent(img);

        // Validate that this is a Cloudinary URL to prevent deletion of arbitrary URLs
        if (!imageUrl.includes('cloudinary.com') || !imageUrl.includes('res.cloudinary.com')) {
            return response.status(400).json({
                message: "Invalid image URL. Only Cloudinary URLs are allowed.",
                error: true,
                success: false
            });
        }

        // Delete from Cloudinary (extract public_id from URL)
        try {
            // Extract public_id from Cloudinary URL more securely
            const urlParts = imageUrl.split('/');
            const uploadIndex = urlParts.findIndex(part => part === 'upload');
            
            if (uploadIndex === -1 || uploadIndex + 2 >= urlParts.length) {
                return response.status(400).json({
                    message: "Invalid Cloudinary URL format",
                    error: true,
                    success: false
                });
            }

            const filename = urlParts[urlParts.length - 1];
            const publicId = filename.split('.')[0];
            
            // Additional validation: ensure publicId is alphanumeric (basic security check)
            if (!/^[a-zA-Z0-9_-]+$/.test(publicId)) {
                return response.status(400).json({
                    message: "Invalid public ID format",
                    error: true,
                    success: false
                });
            }
            
            const result = await cloudinary.uploader.destroy(publicId);
            
            if (result.result !== 'ok' && result.result !== 'not found') {
                return response.status(500).json({
                    message: "Failed to delete image from cloud storage",
                    error: true,
                    success: false
                });
            }
            
        } catch (cloudinaryError) {
            console.error('Error deleting from Cloudinary:', cloudinaryError);
            return response.status(500).json({
                message: "Error occurred while deleting image from cloud storage",
                error: true,
                success: false
            });
        }

        return response.status(200).json({
            error: false,
            success: true,
            message: "Image removed successfully"
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}
