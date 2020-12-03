const express = require("express");
const { body } = require("express-validator");

const {
  register,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth");
const { isAuth, isRole } = require("../middlewares/auth");

const router = express.Router();

/*******
 * Get profile
 */
router.get("/profile", isAuth, getProfile);

/**
 * Register new member
 */
router.post(
  "/register",
  [
    body("name").not().isEmpty().withMessage("Name is required"),
    body("email")
      .not()
      .isEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid type of email"),
    body("password")
      .not()
      .isEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6, max: 16 })
      .withMessage("Password must be between 6-16 characters"),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        const error = new Error(
          "Password confirmation does not match password"
        );
        error.statusCode = 400;
        throw error;
      }

      return true;
    }),
  ],
  register
);

/*******
 * Login for access
 */
router.post(
  "/login",
  [
    body("email")
      .not()
      .isEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid type of email"),
    body("password")
      .not()
      .isEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6, max: 16 })
      .withMessage("Password must be between 6-16 characters"),
  ],
  login
);

/*********
 * Update profile
 */
router.put("/updateprofile", isAuth, updateProfile);

/*********
 * Forgot password
 */
router.post(
  "/forgotpassword",
  [
    body("email")
      .not()
      .isEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid type of email"),
  ],
  forgotPassword
);

/**********
 * Reset password with resettoken id
 */
router.put(
  "/resetpassword/:resettoken",
  [
    body("password")
      .not()
      .isEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6, max: 16 })
      .withMessage("Password must be between 6-16 characters"),
  ],
  resetPassword
);

module.exports = router;
