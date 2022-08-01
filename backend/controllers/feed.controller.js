const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator/check');

const Post = require('../models/post.model');
const User = require('../models/user.model');
const { nextErrorHandler, throwErrorHandler } = require('../utils/errorHandlers.middleware')

exports.getPosts = async (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;

    try {
        const totalItems = await Post
            .find()
            .countDocuments();

        const posts = await Post
            .find()
            .populate('creator')
            .skip((currentPage - 1) * perPage)
            .limit(perPage);

        res
            .status(200)
            .json({
                message: 'Posts fetched successfully.',
                posts: posts,
                totalItems: totalItems
            });
    }
    catch (err) { nextErrorHandler(err, next) };
};

exports.createPost = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throwErrorHandler('Validation failed, entered data is invalid/incorrect.', 422);
    };
    if (!req.file) {
        throwErrorHandler('Creation failed, No image provided.', 422);
    };

    const title = req.body.title;
    const content = req.body.content;
    const imageUrl = req.file.path.replace("\\", "/");
    let creator;

    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: req.userId
    });

    try {
        await post.save();
        const user = await User.findById(req.userId);
        user.posts.push(post);
        await user.save();

        res
            .status(201)
            .json({
                message: 'Post created successfully',
                post: post,
                creator: { _id: user._id, name: user.name }
            });
    }
    catch (err) { nextErrorHandler(err, next) };
};

exports.getPostById = async (req, res, next) => {
    const postId = req.params.postId;

    try {
        const post = await Post.findById(postId);
        if (!post) {
            throwErrorHandler('Post not found!', 404)
        };
        console.log('Post found:', post);

        res
            .status(200)
            .json({
                message: 'Post fetched',
                post: post
            });
    }
    catch (err) { nextErrorHandler(err, next) };
};

exports.updatePost = async (req, res, next) => {
    const postId = req.params.postId;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throwErrorHandler('Validation failed, entered data is invalid/incorrect.', 422);
    };

    const title = req.body.title;
    const content = req.body.content;
    var imageUrl = req.body.image;

    if (req.file) {
        imageUrl = req.file.path;
    };

    if (!imageUrl) {
        throwErrorHandler('No file uploaded!', 422);
    };

    try {
        const post = await Post.findById(postId);
        if (!post) {
            throwErrorHandler('Post not found!', 404)
        };
        if (post.creator.toString() !== req.userId) {
            throwErrorHandler('Not authorized.', 403)
        };

        if (imageUrl !== post.imageUrl) {
            clearImage(post.imageUrl);
        };

        post.title = title;
        post.content = content
        post.imageUrl = imageUrl;

        const result = await post.save();

        res
            .status(200)
            .json({
                message: 'Post updated',
                post: result
            });
    }
    catch (err) { nextErrorHandler(err, next) };
};

exports.deletePost = async (req, res, next) => {
    const postId = req.params.postId;

    try {
        const post = await Post.findById(postId);
        if (!post) {
            throwErrorHandler('Post not found!', 404)
        };

        if (post.creator.toString() !== req.userId) {
            throwErrorHandler('Not authorized.', 403)
        };

        clearImage(post.imageUrl);

        await Post.findByIdAndRemove(postId);
        const user = await User.findById(req.userId);
        user.posts.pull(postId);
        await user.save();

        res
            .status(200)
            .json({
                message: 'Post Deleted',
                post: post
            });
    }
    catch (err) { nextErrorHandler(err, next) };
};

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
};  