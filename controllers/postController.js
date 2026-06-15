import Post from '../models/Post.js';

// GET all posts
export const getAllPosts = async (req, res) => {
    const posts = await Post.find().sort({ createdAt: 'desc' });
    res.render('index', { blogTitle: 'My Blog', posts: posts });
};

// GET new post form
export const getNewPostForm = (req, res) => {
    res.render('create');
};

// POST create new post
export const createPost = async (req, res) => {
    const post = new Post({
        title: req.body.title,
        body: req.body.body,
        image: req.file ? '/uploads/' + req.file.filename : null,
        user: req.user._id
    });
    await post.save();
    req.flash('success', 'Post created successfully!');
    res.redirect('/');
};

// GET single post
export const getPost = async (req, res) => {
    const post = await Post.findById(req.params.id).populate('user');
    res.render('post', { post: post });
};

// GET edit form
export const getEditForm = async (req, res) => {
    const post = await Post.findById(req.params.id);
    res.render('edit', { post: post });
};

// PUT update post
export const updatePost = async (req, res) => {
    const updateData = {
        title: req.body.title,
        body: req.body.body
    };
    if (req.file) {
        updateData.image = '/uploads/' + req.file.filename;
    }
    await Post.findByIdAndUpdate(req.params.id, updateData);
    req.flash('success', 'Post updated successfully!');
    res.redirect('/');
};

// DELETE post
export const deletePost = async (req, res) => {
    await Post.findByIdAndDelete(req.params.id);
    req.flash('success', 'Post deleted successfully!');
    res.redirect('/');
};