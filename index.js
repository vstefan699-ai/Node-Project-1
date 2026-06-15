import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import methodOverride from 'method-override';
import multer from 'multer';
import path from 'path';
import morgan from 'morgan';
import session from 'express-session';
import flash from 'connect-flash';
import {
    getAllPosts,
    getNewPostForm,
    createPost,
    getPost,
    getEditForm,
    updatePost,
    deletePost
} from './controllers/postController.js';
import { 
    getRegisterForm, 
    registerUser,
    getLoginForm,
    loginUser,
    logoutUser
} from './controllers/userController.js';
import passport from 'passport';
import configurePassport from './config/passport.js';
import { ensureAuthenticated } from './middleware/auth.js';
import { check } from 'express-validator';

const app = express();

// Configure Multer for image uploads
const storage = multer.diskStorage({
    destination: 'public/uploads',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.log('Could not connect to MongoDB...', err));

// Tell Express to use EJS as the templating engine
app.set('view engine', 'ejs');

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(morgan('dev'));
app.use(session({
    secret: 'myblogsecret',
    resave: false,
    saveUninitialized: false
}));
app.use(flash());

// Passport middleware 
configurePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

// Make data available to all views
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success');
    res.locals.error_msg = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

// Routes
app.get('/', getAllPosts);
app.get('/posts/new', ensureAuthenticated, getNewPostForm);
app.post('/posts', ensureAuthenticated, upload.single('image'), createPost);
app.get('/posts/:id', getPost);
app.get('/posts/:id/edit', ensureAuthenticated, getEditForm);
app.put('/posts/:id', ensureAuthenticated, upload.single('image'), updatePost);
app.delete('/posts/:id', ensureAuthenticated, deletePost);
app.get('/about', (req, res) => res.render('about'));
app.get('/contact', (req, res) => res.render('contact'));
// User routes
app.get('/users/register', getRegisterForm);
app.post('/users/register', [
    check('username', 'Username is required').notEmpty(),
    check('email', 'Please enter a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    check('password2', 'Please confirm your password').notEmpty()
], registerUser);
app.get('/users/login', getLoginForm);
app.post('/users/login', loginUser);
app.get('/users/logout', logoutUser);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});