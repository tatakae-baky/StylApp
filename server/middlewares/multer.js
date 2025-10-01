import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Allowed image file types
const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
];

// File size limit: 5MB
const FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB in bytes

// File filter function for security
const fileFilter = (req, file, cb) => {
    // Check if file type is allowed
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
        const error = new Error('Invalid file type. Only image files (JPEG, PNG, GIF, WebP) are allowed.');
        error.code = 'INVALID_FILE_TYPE';
        return cb(error, false);
    }
    
    // Additional extension check for security
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
        const error = new Error('Invalid file extension. Only .jpg, .jpeg, .png, .gif, .webp files are allowed.');
        error.code = 'INVALID_FILE_EXTENSION';
        return cb(error, false);
    }
    
    // Sanitize filename to prevent path traversal
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    file.originalname = sanitizedFilename;
    
    cb(null, true);
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads");
    },
    filename: function (req, file, cb) {
        // Sanitize filename and add timestamp for uniqueness
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${Date.now()}_${sanitizedName}`;
        console.log('Uploading file:', filename);
        cb(null, filename);
    },
});

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: FILE_SIZE_LIMIT,
        files: 10 // Maximum 10 files per request
    }
});

export default upload;