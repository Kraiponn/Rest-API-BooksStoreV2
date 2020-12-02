const errorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
  // Copy error
  const error = { ...err };
  console.log("Error handler: ", err);

  error.message = err.message;

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Server error",
  });
};

module.exports = errorHandler;
