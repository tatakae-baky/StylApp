import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import cookieParser from 'cookie-parser'
import morgan from 'morgan';
import helmet from 'helmet';
import connectDB from './config/connectDb.js';
import userRouter from './route/user.route.js'
import categoryRouter from './route/category.route.js';
import productRouter from './route/product.route.js';
import cartRouter from './route/cart.route.js';
import myListRouter from './route/mylist.route.js';
import addressRouter from './route/address.route.js';
import homeSlidesRouter from './route/homeSlides.route.js';
import heroBannerRouter from './route/heroBanner.route.js';
import salesBannerRouter from './route/salesBanner.route.js';
import subCategorySectionRouter from './route/subCategorySection.route.js';
import blogRouter from './route/blog.route.js';
import orderRouter from './route/order.route.js';
import logoRouter from './route/logo.route.js';
import brandRouter from './route/brand.route.js';
import hottestBrandOfferRouter from './route/hottestBrandOffer.route.js';
import hiddenGemBrandRouter from './route/hiddenGemBrand.route.js';
import brandRequestRouter from './route/brandRequest.route.js';

const app = express();

// Trust proxy for Render deployment (enables correct client IP detection)
app.set('trust proxy', 1);

app.use(cors());
app.options('*', cors())

app.use(express.json({ limit: '10mb' })) // Add body size limit
app.use(cookieParser())
// app.use(morgan())
app.use(helmet({
    crossOriginResourcePolicy: false
}))


app.get("/", (request, response) => {
    ///server to client
    response.json({
        message: "Server is running " + process.env.PORT
    })
})

// Health check endpoint for Render and monitoring services
app.get("/health", (request, response) => {
    response.status(200).json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development'
    })
})

// Keep-alive endpoint to prevent Render from sleeping
app.get("/keep-alive", (request, response) => {
    response.status(200).json({
        status: "awake",
        timestamp: new Date().toISOString(),
        message: "Server is awake and ready"
    })
})


app.use('/api/user',userRouter)
app.use('/api/category',categoryRouter)
app.use('/api/product',productRouter);
app.use("/api/cart",cartRouter)
app.use("/api/myList",myListRouter)
app.use("/api/address",addressRouter)
app.use("/api/homeSlides",homeSlidesRouter)
app.use("/api/heroBanners",heroBannerRouter)
app.use("/api/salesBanners",salesBannerRouter)
app.use("/api/subCategorySections",subCategorySectionRouter)
app.use("/api/blog",blogRouter)
app.use("/api/order",orderRouter)
app.use("/api/logo",logoRouter)
app.use('/api/brand',brandRouter)
app.use('/api/hottestBrandOffers',hottestBrandOfferRouter)
app.use('/api/hiddenGemBrands',hiddenGemBrandRouter)
app.use('/api', brandRequestRouter)


connectDB().then(() => {
    app.listen(process.env.PORT, () => {
        console.log("Server is running", process.env.PORT);
    })
})
