const cloudinary = require("cloudinary").v2;
const AppError = require("../utils/AppError");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image to Cloudinary
 * POST /api/upload/image
 */
exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError("No file provided", 400);
    }

    // Validate file type
    const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedMimes.includes(req.file.mimetype)) {
      throw new AppError("Invalid file type. Only images are allowed", 400);
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxSize) {
      throw new AppError("File size exceeds 5MB limit", 400);
    }

    // Upload to Cloudinary using buffer
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "next-cyper/avatars",
        resource_type: "auto",
        quality: "auto",
        fetch_format: "auto",
      },
      (error, result) => {
        if (error) {
          return next(new AppError("Upload failed: " + error.message, 500));
        }

        res.json({
          success: true,
          url: result.secure_url,
          publicId: result.public_id,
        });
      },
    );

    uploadStream.end(req.file.buffer);
  } catch (err) {
    next(err);
  }
};

/**
 * Delete image from Cloudinary
 * DELETE /api/upload/:publicId
 */
exports.deleteImage = async (req, res, next) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      throw new AppError("Public ID is required", 400);
    }

    await cloudinary.uploader.destroy(publicId);

    res.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
