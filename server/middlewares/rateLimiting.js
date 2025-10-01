import rateLimit from 'express-rate-limit';

// Rate limiting for authentication endpoints (login, register)
export const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 authentication attempts per windowMs
    message: {
        error: true,
        success: false,
        message: 'Too many authentication attempts. Please try again in 15 minutes.',
        code: 'AUTH_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true // Don't count successful logins against the limit
});

// Strict rate limiting for password reset and OTP operations
export const passwordResetRateLimit = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 password reset attempts per hour
    message: {
        error: true,
        success: false,
        message: 'Too many password reset attempts. Please try again in 1 hour.',
        code: 'PASSWORD_RESET_RATE_LIMIT'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Very strict rate limiting for OTP verification to prevent brute force
export const otpVerificationRateLimit = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 5, // Limit each IP to 5 OTP verification attempts per 5 minutes
    message: {
        error: true,
        success: false,
        message: 'Too many OTP verification attempts. Please try again in 5 minutes.',
        code: 'OTP_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Rate limiting for sensitive administrative operations
export const adminOperationRateLimit = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // Limit each IP to 20 admin operations per minute
    message: {
        error: true,
        success: false,
        message: 'Too many administrative operations. Please slow down.',
        code: 'ADMIN_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Rate limiting specifically for public file upload endpoints
export const publicUploadRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 upload requests per windowMs
    message: {
        error: true,
        success: false,
        message: 'Too many upload attempts. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false
    // Removed skip condition to ensure all requests are rate limited for security
});

// More restrictive rate limiting for brand request submissions
export const brandRequestRateLimit = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour  
    max: 3, // Limit each IP to 3 brand requests per hour
    message: {
        error: true,
        success: false,
        message: 'Too many brand requests. Please try again later.',
        code: 'BRAND_REQUEST_RATE_LIMIT'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Lighter rate limiting for browsing operations (read-heavy endpoints)
export const browsingRateLimit = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes  
    max: 500, // 500 requests per 5 minutes (100 per minute) - suitable for heavy browsing
    message: {
        error: true,
        success: false,
        message: 'Too many requests. Please slow down browsing.',
        code: 'BROWSING_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false
});