const { validationResult } = require('express-validator/check');
const Post = require('../models/post.model');

exports.getPosts = (req, res, next) => {
    res
        .status(200)
        .json({
            posts: [
                {
                    _id: 'abhilashgupta2706',
                    title: 'Post from my Controller',
                    content: 'Content of my post from controller',
                    imageUrl: 'images/yoda.jpg',
                    creator: {
                        name: 'Abhilash',
                    },
                    createdAt: new Date(),
                }
            ]
        });
};

exports.createPost = (req, res, next) => {
    const errors = validationResult(req);

    const title = req.body.title;
    const content = req.body.content;

    if (!errors.isEmpty()) {
        return res
            .status(422)
            .json({
                message: 'Validation failed, entered data is invalid/incorrect.',
                errors: errors.array()
            });
    }

    const post = new Post({
        title: title,
        content: content,
        imageUrl: 'images/mario.jpg',
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
        .catch(err => {
            console.log(err)
        });
};