import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
  secure: true,
});

/**
 * Upload a buffer to Cloudinary.
 * @param {Buffer} buffer
 * @param {object} options - { folder, public_id, resource_type }
 * @returns {Promise<object>} cloudinary upload result
 */
export async function uploadToCloudinary(buffer, options = {}) {
  if (!buffer) throw new Error('No buffer provided for upload');

  const uploadStream = ({ buffer, opts }) =>
    new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        opts,
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      stream.end(buffer);
    });

  const opts = {
    folder: options.folder || 'matrix/products',
    public_id: options.public_id,
    resource_type: options.resource_type || 'image',
    overwrite: true,
    transformation: options.transformation,
  };

  const result = await uploadStream({ buffer, opts });
  return result;
}

export async function deleteFromCloudinary(publicId) {
  if (!publicId) throw new Error('publicId required');
  return cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
}

export default cloudinary;