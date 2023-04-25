const express = require('express');
const upload = require('../utils/multer');
const router = express.Router();

const { getPost, getMyPosts, getAllPosts, createPost, updatePost, deletePost } = require('./../controllers/post-controllers');
const AppError = require('../utils/appError');

router.route('/getPost').get(getPost);
router.route('/myPosts').get(getMyPosts);
router.route('/getAllPosts').get(getAllPosts);
router.route('/createPost').post(upload.single('image'), createPost);
router.route('/updatePost').patch(upload.single('image'), updatePost);
router.route('/deletePost').delete(deletePost);

router.use((req, res, next) => {
    return next(new AppError(404, 'Route not found.'));
});

module.exports = router;