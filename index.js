import express from "express";
import { executeMiddleware } from "./lib/middleware.js";
import * as auth from "./lib/auth.js";

import campaignRoutes from "./routes/campaign.route.js";
import authRoutes from "./routes/auth.route.js";
import notificationRoutes from "./routes/notification.routes.js";
import registrationRoutes from "./routes/registration.route.js";
import donationRoutes from "./routes/donation.route.js";
import userRoutes from "./routes/user.route.js";

import User from "./models/user.model.js";
import { connect } from "./config/dbconnection.js";

import dotenv from "dotenv";

import morgan from "morgan";
import { createStream } from "rotating-file-stream";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { redisConnect } from "./lib/redis.js";

dotenv.config(); // Load environment variables from .env file

const app = express();

// Middleware
executeMiddleware(app);

//Check Auth for each API
const allowedURLs = ["/api/v1/auth", "/api/v1"];

const allowedEndpoints = [
  "/login",
  "/verify-code",
  "/resend-code",
  "/forgot-password",
  "/reset-password",
  "/signup",
  "/donation/donate",
];

const isAllowedURL = (req) => {
  return allowedURLs.some((baseURL) =>
    allowedEndpoints.some((endpoint) => req.url === `${baseURL}${endpoint}`)
  );
};

const handleUpdatePassword = (req) => {
  const isUpdatePasswordURL = allowedURLs.some((url) => req.url === `${url}/updatePassword`);
  const isInvalidAuthentication =
    req.hasOwnProperty("body") &&
    req.body.hasOwnProperty("authenticate") &&
    req.body.authenticate === true;

  if (isUpdatePasswordURL && isInvalidAuthentication) {
    return true;
  } else {
    return false;
  }
};

const handleAuthToken = async (req, res, next) => {
  if (req.headers?.authtoken) {
    const result = auth.verifyToken(req.headers?.authtoken);
    
    if (!result?.status) {
      // Clear the authentication cookie
      res.clearCookie("authtoken");
      // Send 401 response with a message instructing the client to redirect
      return res.status(401).json({
        message: result?.message || "Invalid Token. Redirecting to sign-in.",
      });
    }

    if (result?.status === true) {
      try {
        const userData = await User.findById({ _id: result.payload?.userId }).exec();
        if (userData?.tokenStatus) {
          global.user = userData;
          next();
        } else {
          res.status(404).json({ message: "User does not exist or is already logged out" });
        }
      } catch (error) {
        console.log("Error while getting user info", error);
        res.status(500).json({
          message: "Unable to find user information due to technical error",
          error: error.message,
        });
      }
    } else {
      res.status(401).json({ message: result.message ? result.message : "Invalid Token" });
    }
  } else {
    res.status(401).json({ message: "Missing auth token in headers" });
  }
};

app.use(async function (req, res, next) {
  if (req.method === "OPTIONS" || isAllowedURL(req)) {
    next();
  } else if (handleUpdatePassword(req)) {
    next();
  } else {
    handleAuthToken(req, res, next);
  }
});

// Create logs folder if not exists
const logsFolder = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsFolder)) {
  fs.mkdirSync(logsFolder, { recursive: true }); // Ensure that the entire path is created if needed
}

const generateFileName = () => {
  const currentDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD format
  return `access-${currentDate}.log`;
};

// Create a rotating write stream for Morgan to log
const accessLogStream = createStream(generateFileName, {
  interval: "1d", // rotate daily
  path: logsFolder,
});

// Error handling for the log stream
accessLogStream.on("error", (err) => {
  console.error("Failed to create log stream:", err);
});

// Variable to store the response body for each request
let currentResponseBody = {};

// Custom middleware for logging response body
const logResponseBody = (req, res, next) => {
  const originalSend = res.send;

  res.send = function (body) {
    // Store the response body
    currentResponseBody = body;

    // Call the original send method
    originalSend.apply(res, arguments);
  };

  next();
};

morgan
  .token("body", (req) => JSON.stringify(req.body))
  .token("id", () => uuidv4())
  .token("resBody", () => currentResponseBody)
  .token("date", () => new Date())
  .token("user", () => (global.user && global.user.email ? global.user.email : "-"));

app.use(
  morgan(
    '{ "id": ":id", "timestamp": ":date", "user": ":user", "method": ":method", "url": ":url", "status": ":status", "body": :body, "resBody": :resBody }',
    {
      stream: accessLogStream,
      format: (tokens, req, res) => {
        // Parse and format the JSON string for the body
        const body = tokens.body(req, res);
        const parsedBody = body ? JSON.parse(body) : null;

        // Return the formatted log entry
        return JSON.stringify({
          id: tokens.id(req, res),
          date: tokens.date(),
          method: tokens.method(req, res),
          url: tokens.url(req, res),
          status: tokens.status(req, res),
          body: parsedBody,
          resBody: tokens.resBody(),
          user: tokens.user(req, res),
        });
      },
    }
  )
);

// Routes
app.use("/api/v1/auth", logResponseBody, authRoutes);
app.use("/api/v1/campaign", logResponseBody, campaignRoutes);
app.use("/api/v1/notification", logResponseBody, notificationRoutes);
app.use("/api/v1/registration", logResponseBody, registrationRoutes);
app.use("/api/v1/donation", logResponseBody, donationRoutes);
app.use("/api/v1/user", logResponseBody, userRoutes);

//db connection
connect();

//redis connection
redisConnect();

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
