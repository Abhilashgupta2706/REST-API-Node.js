const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator/check');

const Post = require('../models/post.model');
const { nextErrorHandler, throwErrorHandler } = require('../utils/errorHandlers.utils')

exports.getPosts = (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;
    let totalItems;

    Post
        .find()
        .countDocuments()
        .then(count => {
            totalItems = count;

            return Post
                .find()
                .skip((currentPage - 1) * perPage)
                .limit(perPage);

        })
        .then(posts => {
            res
                .status(200)
                .json({
                    message: 'Posts fetched successfully.',
                    posts: posts,
                    totalItems: totalItems
                });
        })
        .catch(err => { nextErrorHandler(err, next) });


};

exports.createPost = (req, res, next) => {
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

    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: { name: 'Abhilash Gupta' },
    });

    post
        .save()
        .then(result => {
            console.log(result);
            res
                .status(201)
                .json({
                    message: 'Post created successfully',
                    post: result
                });
        })
        .catch(err => { nextErrorHandler(err, next) });
};

exports.getPostById = (req, res, next) => {
    const postId = req.params.postId;
    Post
        .findById(postId)
        .then(post => {
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
        })
        .catch(err => { nextErrorHandler(err, next) });
};

exports.updatePost = (req, res, next) => {
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

    Post
        .findById(postId)
        .then(post => {
            if (!post) {
                throwErrorHandler('Post not found!', 404)
            };

            if (imageUrl !== post.imageUrl) {
                clearImage(post.imageUrl);
            };

            post.title = title;
            post.content = content
            post.imageUrl = imageUrl;
            return post.save();
        })
        .then(result => {
            res
                .status(200)
                .json({
                    message: 'Post updated',
                    post: result
                });
        })
        .catch(err => { nextErrorHandler(err, next) });
};

exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;

    Post
        .findById(postId)
        .then(post => {
            if (!post) {
                throwErrorHandler('Post not found!', 404)
            };

            // TODO: Check Logged in user

            clearImage(post.imageUrl);

            return Post
                .findByIdAndRemove(postId)
                .then(result => {
                    console.log(result);

                    res
                        .status(200)
                        .json({
                            message: 'Post Deleted',
                            post: post
                        });
                });
        })

        .catch(err => { nextErrorHandler(err, next) });
};

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
};  