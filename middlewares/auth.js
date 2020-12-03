const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const errorResponse = require("../utils/errorResponse");

const User = require("../models/User");

// Protect route
exports.isAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    // console.log("token: ", token);
  }

  //Make sure user exists
  if (!token) {
    return next(
      new errorResponse(`User is not authorized to access this route`, 401)
    );
  }

  try {
    // Verify token
    let decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    // console.log("token", req.user);

    next();
  } catch (error) {
    return next(new errorResponse(`Not authorized to access this route`, 401));
  }
});

// Grant access to specific roles
exports.isRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new errorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }

    next();
  };
};
