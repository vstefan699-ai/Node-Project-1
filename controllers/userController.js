import User from '../models/User.js';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import passport from 'passport';

// GET register form
export const getRegisterForm = (req, res) => {
    res.render('register');
};

// POST register
export const registerUser = async (req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        });
        return res.redirect('/users/register');
    }

    const { username, email, password, password2 } = req.body;

    // Check passwords match
    if (password !== password2) {
        req.flash('error', 'Passwords do not match!');
        return res.redirect('/users/register');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
        req.flash('error', 'Email is already registered!');
        return res.redirect('/users/register');
    }

    // Encrypt the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the user
    const user = new User({
        username: username,
        email: email,
        password: hashedPassword
    });

    await user.save();
    req.flash('success', 'Account created! You can now log in.');
    res.redirect('/users/login');
};

// GET login form
export const getLoginForm = (req, res) => {
    res.render('login');
};

// POST login
export const loginUser = (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true,
        successFlash: 'Welcome back!'
    })(req, res, next);
};

// GET logout
export const logoutUser = (req, res) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash('success', 'You are logged out!');
        res.redirect('/users/login');
    });
};