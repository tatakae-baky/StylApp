import { Router } from 'express'
import auth from '../middlewares/auth.js';
import authorize from '../middlewares/authorize.js';
import upload from '../middlewares/multer.js';
import { addBlog, deleteBlog, getBlog, getBlogs, updateBlog, uploadImages } from '../controllers/blog.controller.js';

const blogRouter = Router();

blogRouter.post('/uploadImages',auth,authorize(['ADMIN']),upload.array('images'),uploadImages);
blogRouter.post('/add',auth,authorize(['ADMIN']),addBlog);
blogRouter.get('/',getBlogs);
blogRouter.get('/:id',getBlog);
blogRouter.delete('/:id',auth,authorize(['ADMIN']),deleteBlog);
blogRouter.put('/:id',auth,authorize(['ADMIN']),updateBlog);

export default blogRouter;
