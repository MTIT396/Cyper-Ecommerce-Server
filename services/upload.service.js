const cloudinary = require("cloudinary").v2;
const AppError = require("../utils/AppError");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image to Cloudinary with validation
 */
exports.uploadImage = async (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new AppError("No file provided", 400));
    }

    // Validate file type
    const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedMimes.includes(file.mimetype)) {
      return reject(
        new AppError("Invalid file type. Only images are allowed", 400),
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return reject(new AppError("File size exceeds 5MB limit", 400));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "next-cyper/avatars",
        resource_type: "auto",
        quality: "auto",
        fetch_format: "auto",
      },
      (error, result) => {
        if (error) {
          return reject(new AppError("Upload failed: " + error.message, 500));
        }

        resolve({
          success: true,
          url: result.secure_url,
          publicId: result.public_id,
        });
      },
    );

    uploadStream.end(file.buffer);
  });
};

/**
 * Delete image from Cloudinary
 */
exports.deleteImage = async (publicId) => {
  if (!publicId) {
    throw new AppError("Public ID is required", 400);
  }

  await cloudinary.uploader.destroy(publicId);

  return {
    success: true,
    message: "Image deleted successfully",
  };
};
