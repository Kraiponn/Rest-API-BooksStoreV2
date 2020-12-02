const path = require("path");
const express = require("express");
const colors = require("colors");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const helmet = require("helmet");
const xss = require("xss-clean");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");

// Import error handler resource
const errorHandler = require("./middlewares/errorHandler");

// Config env path
dotenv.config({ path: "./config/config.env" });

// Import MongoDB
const connectDB = require("./config/db");

// Connect Database
connectDB();

const app = express();

// Enable log for development mode
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Enable body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false }));

// Cookie parser
app.use(cookieParser());

// Enable cors
app.use(cors());

// Set initial path
app.use(express.static(path.join(__dirname, "public")));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

//  apply to all requests
app.use(limiter);

// Protect against http parameter pollution attacts
app.use(hpp());

// Prevent security header
app.use(helmet());

// Prevent XSS attact
app.use(xss());

// Prevent mongodb operator injection
app.use(mongoSanitize());

// Route resources

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow
      .underline.bold
  );
});
