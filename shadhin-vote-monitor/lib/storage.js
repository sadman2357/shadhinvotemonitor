const AWS = require('aws-sdk');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Configure AWS S3
const s3 = new AWS.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    signatureVersion: 'v4'
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

/**
 * Upload file to S3
 */
const uploadToS3 = async (buffer, mimetype, originalName) => {
    const fileExtension = path.extname(originalName);
    const fileName = `${uuidv4()}${fileExtension}`;
    const key = `uploads/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${fileName}`;

    const params = {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
        ServerSideEncryption: 'AES256',
        // Make files private by default
        ACL: 'private'
    };

    try {
        const result = await s3.upload(params).promise();
        return {
            url: result.Location,
            key: result.Key,
            bucket: result.Bucket
        };
    } catch (error) {
        console.error('S3 upload error:', error);
        throw new Error('Failed to upload file to storage');
    }
};

/**
 * Generate signed URL for private file access
 * URLs expire after specified time
 */
const getSignedUrl = (key, expiresIn = 3600) => {
    const params = {
        Bucket: BUCKET_NAME,
        Key: key,
        Expires: expiresIn // URL valid for 1 hour by default
    };

    return s3.getSignedUrl('getObject', params);
};

/**
 * Delete file from S3
 */
const deleteFromS3 = async (key) => {
    const params = {
        Bucket: BUCKET_NAME,
        Key: key
    };

    try {
        await s3.deleteObject(params).promise();
        return true;
    } catch (error) {
        console.error('S3 delete error:', error);
        throw new Error('Failed to delete file from storage');
    }
};

/**
 * Compress and optimize image
 */
const optimizeImage = async (buffer, options = {}) => {
    try {
        const optimized = await sharp(buffer)
            .resize(options.maxWidth || 1920, options.maxHeight || 1080, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({
                quality: options.quality || 85,
                progressive: true
            })
            .toBuffer();

        return optimized;
    } catch (error) {
        console.error('Image optimization error:', error);
        throw new Error('Failed to optimize image');
    }
};

/**
 * Generate thumbnail from image
 */
const generateThumbnail = async (buffer) => {
    try {
        const thumbnail = await sharp(buffer)
            .resize(400, 300, {
                fit: 'cover',
                position: 'center'
            })
            .jpeg({
                quality: 80,
                progressive: true
            })
            .toBuffer();

        return thumbnail;
    } catch (error) {
        console.error('Thumbnail generation error:', error);
        throw new Error('Failed to generate thumbnail');
    }
};

/**
 * Add watermark to image
 */
const addWatermark = async (buffer, text = 'Citizen Submitted – Unverified') => {
    try {
        const image = sharp(buffer);
        const metadata = await image.metadata();

        // Create SVG watermark
        const svgWatermark = Buffer.from(`
      <svg width="${metadata.width}" height="${metadata.height}">
        <style>
          .watermark { 
            fill: rgba(255, 255, 255, 0.7); 
            font-size: 24px; 
            font-family: Arial, sans-serif;
            font-weight: bold;
          }
        </style>
        <text x="50%" y="95%" text-anchor="middle" class="watermark">${text}</text>
      </svg>
    `);

        const watermarked = await image
            .composite([{
                input: svgWatermark,
                gravity: 'south'
            }])
            .toBuffer();

        return watermarked;
    } catch (error) {
        console.error('Watermark error:', error);
        // Return original if watermarking fails
        return buffer;
    }
};

/**
 * Process uploaded media file
 * Handles both images and videos
 */
const processMedia = async (file) => {
    const { buffer, mimetype, originalname } = file;

    try {
        let processedBuffer = buffer;
        let thumbnailUrl = null;

        // Process images
        if (mimetype.startsWith('image/')) {
            // Optimize image
            processedBuffer = await optimizeImage(buffer);

            // Add watermark
            processedBuffer = await addWatermark(processedBuffer);

            // Generate thumbnail
            const thumbnailBuffer = await generateThumbnail(processedBuffer);
            const thumbnailUpload = await uploadToS3(
                thumbnailBuffer,
                'image/jpeg',
                `thumb_${originalname}`
            );
            thumbnailUrl = thumbnailUpload.url;
        }

        // Upload main file
        const mainUpload = await uploadToS3(processedBuffer, mimetype, originalname);

        return {
            url: mainUpload.url,
            key: mainUpload.key,
            thumbnailUrl,
            size: processedBuffer.length
        };

    } catch (error) {
        console.error('Media processing error:', error);
        throw error;
    }
};

module.exports = {
    uploadToS3,
    getSignedUrl,
    deleteFromS3,
    optimizeImage,
    generateThumbnail,
    addWatermark,
    processMedia
};
