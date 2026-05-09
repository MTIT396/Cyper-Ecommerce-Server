module.exports = (err, req, res, next) => {
  console.error(err);

  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
