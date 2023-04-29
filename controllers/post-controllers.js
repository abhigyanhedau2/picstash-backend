const catchAsync = require('./../utils/catchAsync.js');
const AppError = require('../utils/appError.js');
const User = require('./../models/User');
const Post = require('./../models/Post');

const { uploadToS3, getFromS3, deleteFromS3 } = require('./../utils/s3.js');

const getPost = catchAsync(async (req, res, next) => {

    // Fetch data from req.body
    const { postId } = req.body;

    // Check if id is provided or not
    if (postId === undefined || postId.length !== 24) return next(new AppError(400, 'Post id is required.'));

    // Fetch the post from database
    const postFromDB = await Post.findById(postId);

    // If no post is found return error
    if (!postFromDB) return next(new AppError(400, 'Post not found.'));

    const imageURL = await getFromS3(postFromDB.imageKey);

    // Send the post
    return res.status(200).json({
        status: 'success',
        message: 'Post was successfully fetched',
        post: postFromDB,
        imageURL
    });
});

const getMyPosts = catchAsync(async (req, res, next) => {

    const userId = req.body.userId;

    // Check if id is provided or not
    if (userId === undefined || userId.length !== 24) return next(new AppError(400, 'User not found.'));

    // Fetch the user from the database
    const user = await User.findById(userId);

    // If user id is invalid
    if (!user) return next(new AppError(400, 'User not found.'));

    const userPosts = [];

    for (const postId of user.posts) {
        const postFromDB = await Post.findById(postId);
        const imageURL = await getFromS3(postFromDB.imageKey);
        let post = {
            ...postFromDB._doc
        }
        post.imageURL = imageURL;
        userPosts.push(post);
    }

    return res.status(200).json({
        status: 'success',
        results: userPosts.length,
        message: 'Posts fetched successfully',
        posts: userPosts
    });

});

const getAllPosts = catchAsync(async (req, res, next) => {

    const posts = await Post.find();

    const allPosts = [];

    for (const eachPost of posts) {
        const imageURL = await getFromS3(eachPost.imageKey);
        let newPost = {
            ...eachPost._doc,
        };
        newPost.imageURL = imageURL;
        allPosts.push(newPost);
    }

    return res.status(200).json({
        status: 'success',
        results: allPosts.length,
        posts: allPosts
    });

});

const createPost = catchAsync(async (req, res, next) => {

    // Fetch data from req.body
    const { userId, caption } = req.body;

    // Check if id is provided or not
    if (userId === undefined || userId.length !== 24) return next(new AppError(400, 'User not found.'));

    // Fetch the user from the database
    const user = await User.findById(userId);

    // If user id is invalid
    if (!user) return next(new AppError(400, 'User not found.'));

    const imageKey = await uploadToS3(req.file);

    const stringedCaption = caption.toString();

    const newPost = await Post.create({
        userId: userId,
        caption: stringedCaption,
        imageKey
    });

    const updatedPosts = user.posts;
    updatedPosts.push(newPost.id);

    await User.findByIdAndUpdate(userId, { posts: updatedPosts });

    const imageURL = await getFromS3(newPost.imageKey);

    return res.status(201).json({
        status: 'success',
        message: 'Post was successfully created',
        post: newPost,
        imageURL
    });
});

const updatePost = catchAsync(async (req, res, next) => {

    const { userId, postId, caption } = req.body;

    // Check if id is provided or not
    if (userId === undefined || userId.length !== 24) return next(new AppError(400, 'User not found.'));

    // Fetch the user from the database
    const user = await User.findById(userId);

    // If user id is invalid
    if (!user) return next(new AppError(400, 'User not found.'));

    // Check if id is provided or not
    if (postId === undefined || postId.length !== 24) return next(new AppError(400, 'Post id is required.'));

    // Fetch the post from database
    const postFromDB = await Post.findById(postId);

    // If no post is found return error
    if (!postFromDB) return next(new AppError(400, 'Post not found.'));

    if (postFromDB.userId.toString() !== userId) return next(new AppError(403, 'Forbidden. Unauthorized Access'));

    let newImageKey, stringedCaption;

    if (caption) stringedCaption = caption.toString();

    if (req.file) {
        await deleteFromS3(postFromDB.imageKey);
        newImageKey = await uploadToS3(req.file);
    }

    const updatedPost = await Post.findByIdAndUpdate(postId, { imageKey: newImageKey, caption: stringedCaption }, { new: true });

    const imageURL = await getFromS3(updatedPost.imageKey);

    return res.status(200).json({
        status: 'success',
        message: 'Post was successfully updated',
        post: updatedPost,
        imageURL
    });

});

const deletePost = catchAsync(async (req, res, next) => {

    const { userId, postId } = req.body;

    // Check if id is provided or not
    if (userId === undefined || userId.length !== 24) return next(new AppError(400, 'User not found.'));

    // Fetch the user from the database
    const user = await User.findById(userId);

    // If user id is invalid
    if (!user) return next(new AppError(400, 'User not found.'));

    // Check if id is provided or not
    if (postId === undefined || postId.length !== 24) return next(new AppError(400, 'Post id is required.'));

    // Fetch the post from database
    const postFromDB = await Post.findById(postId);

    // If no post is found return error
    if (!postFromDB) return next(new AppError(400, 'Post not found.'));

    if (postFromDB.userId.toString() !== userId) return next(new AppError(403, 'Forbidden. Unauthorized Access'));

    await Post.findByIdAndDelete(postId);

    const updatedPosts = user.posts.filter(postId => postId !== postId);

    await User.findByIdAndUpdate(userId, { posts: updatedPosts });

    return res.status(200).json({
        status: 'success',
        message: 'Post was successfully deleted'
    })

});

module.exports = { getPost, getMyPosts, getAllPosts, createPost, updatePost, deletePost };