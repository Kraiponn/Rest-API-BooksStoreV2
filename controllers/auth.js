const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const errorResponse = require("../utils/errorResponse");
const { validationResult } = require("express-validator");
const validateResult = require("../utils/validateResults");

// @desc    Get profile
// @route   GET /api/v2/auth/profile
// @access  Public
exports.getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(
      new errorResponse(`User not found with id of ${req.user._id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: { user },
  });
});

// @desc    Register new member
// @route   POST /api/v2/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  // console.log(errors.array());

  // Make sure user validation is correct
  if (!errors.isEmpty()) {
    // console.log("Valid result: ", validateResult(errors.array()));

    return next(
      new errorResponse(
        `Validation is incorect: ${validateResult(errors.array())}`,
        400
      )
    );
  }

  const email = await User.findOne({ email: req.body.email });

  // Make sure email not exists
  if (email) {
    return next(new errorResponse(`This email has already in the system`, 400));
  }

  const user = await User.create(req.body);
  res.status(201).json({
    success: true,
    data: user,
  });
});

// @desc    Login to access
// @route   POST /api/v2/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);

  // Make sure user validation is correct
  if (!errors.isEmpty()) {
    // console.log("Valid result: ", validateResult(errors.array()));

    return next(
      new errorResponse(
        `Validation is incorect: ${validateResult(errors.array())}`,
        400
      )
    );
  }

  const user = await User.findOne({ email: req.body.email }).select(
    "+password"
  );

  if (!user) {
    return next(new errorResponse(`Invalid credentials`, 404));
  }

  const isMatchPWD = await user.matchPassword(req.body.password);

  if (!isMatchPWD) {
    return next(new errorResponse(`Password is incorrect`, 404));
  }

  // Create token
  const token = user.getSignJwtToken();
  // console.log(user);

  res.status(200).json({
    success: true,
    data: {
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
});

// @desc    Update profile
// @route   PUT /api/v2/auth/updateprofile
// @access  Public
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: {
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
});

// @desc    Forgot password
// @route   PUT /api/v2/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);

  // Make sure user validation is correct
  if (!errors.isEmpty()) {
    return next(
      new errorResponse(
        `Validation is incorect: ${validateResult(errors.array())}`,
        400
      )
    );
  }

  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new errorResponse(`There is no user with that email`, 404));
  }

  let resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    data: {
      resetToken,
      message:
        "Someone request to reset a password, You can use resettoken for reset password.",
    },
  });
});

// @desc    Reset password
// @route   PUT /api/v2/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);

  // Make sure user validation is correct
  if (!errors.isEmpty()) {
    return next(
      new errorResponse(
        `Validation is incorect: ${validateResult(errors.array())}`,
        400
      )
    );
  }

  // Generate token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new errorResponse(`Token expire`, 403));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save({ new: true, runValidators: true });

  // Sign token
  let token = user.getSignJwtToken();

  res.status(200).json({
    success: true,
    data: {
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
});
