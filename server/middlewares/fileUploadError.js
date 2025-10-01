// Middleware to handle file upload errors
export const handleFileUploadError = (error, req, res, next) => {
    if (error) {
        console.log('File upload error:', error);
        
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: true,
                success: false,
                message: 'File size too large. Maximum file size is 5MB.',
                code: 'FILE_SIZE_LIMIT_EXCEEDED'
            });
        }
        
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                error: true,
                success: false,
                message: 'Too many files. Maximum 10 files allowed.',
                code: 'FILE_COUNT_LIMIT_EXCEEDED'
            });
        }
        
        if (error.code === 'INVALID_FILE_TYPE') {
            return res.status(400).json({
                error: true,
                success: false,
                message: error.message,
                code: 'INVALID_FILE_TYPE'
            });
        }
        
        if (error.code === 'INVALID_FILE_EXTENSION') {
            return res.status(400).json({
                error: true,
                success: false,
                message: error.message,
                code: 'INVALID_FILE_EXTENSION'
            });
        }
        
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                error: true,
                success: false,
                message: 'Unexpected file field. Please check your form configuration.',
                code: 'UNEXPECTED_FILE_FIELD'
            });
        }
        
        // Generic multer error
        return res.status(400).json({
            error: true,
            success: false,
            message: 'File upload error: ' + (error.message || 'Unknown error'),
            code: 'FILE_UPLOAD_ERROR'
        });
    }
    
    next();
};