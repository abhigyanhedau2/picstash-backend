const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const crypto = require('crypto');

// Creating a S3 client
const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.BUCKET_ACCESS_KEY,
        secretAccessKey: process.env.BUCKET_SECRET_ACCESS_KEY,
    },
    region: process.env.BUCKET_REGION
});

const uploadToS3 = async (file) => {

    let imageKey = crypto.randomBytes(32).toString('hex');

    const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: imageKey,
        Body: file.buffer,
        ContentType: file.mimetype
    };

    const putObjCommand = new PutObjectCommand(params);
    await s3.send(putObjCommand);

    return imageKey;

};

const getFromS3 = async (key) => {

    const getObjParams = {
        Bucket: process.env.BUCKET_NAME,
        Key: key,
    }

    // Send a get request for the image
    const getObjCommand = new GetObjectCommand(getObjParams);

    const imageURL = await getSignedUrl(s3, getObjCommand, { expiresIn: 3600 });

    return imageURL;
};

const deleteFromS3 = async (key) => {
    const delObjParams = {
        Bucket: process.env.BUCKET_NAME,
        Key: key,
    }

    const delObjCommand = new DeleteObjectCommand(delObjParams);

    await s3.send(delObjCommand);
};

module.exports = { uploadToS3, getFromS3, deleteFromS3 };