import "dotenv/config";
import "./cronJobs/updateClicks.js";
import "./cronJobs/flushClicks.js";
import "./config/crashHandlers.js";
import "./config/instrument.js";
import "./config/redis.js";
import express from "express";
import connectMongoDb from "./config/db.js";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "path";
import passport from "./config/passport.js";
import fs from "fs";
import https from "https";
import session from "express-session";
import helmet from "helmet";

import urlRouter from "./routes/url.routes.js";
import redirectRouter from "./routes/redirect.routes.js";
import staticRouter from "./routes/static.routes.js";
import userRouter from "./routes/user.routes.js";
import forgotPasswordRouter from "./routes/forgotPassword.routes.js";
import verifyEmailRouter from "./routes/verifyEmail.routes.js";
import oauthRoutes from "./routes/oauth.routes.js";
import twoFARoutes from "./routes/2fa.routes.js";
import paymentRouter from "./routes/payment.routes.js";

import { handleStripeWebhook } from "./controllers/payment.controller.js";

import { tryAuthenticateUser } from "./middlewares/auth.middleware.js";
import { appLogger } from "./config/logger.js";
import accessMiddleware from "./middlewares/accessLogger.middleware.js";
import notFound from "./middlewares/notFound.middleware.js";
import errorHandler from "./middlewares/error.middleware.js";
import {
  attachCsrfToken,
  csrfProtection,
} from "./middlewares/csrf.middleware.js";

const app = express();
const PORT = process.env.PORT || 3000;

connectMongoDb(process.env.MONGO_URL)
  .then(() => appLogger.info("MongoDb connected"))
  .catch((err) => {
    appLogger.error("MongoDB connection failed:", {
      message: err.message,
      stack: err.stack,
    });
    process.exit(1);
  });

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.disable("x-powered-by");
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      formAction: [
        "'self'",
        "https://checkout.stripe.com",
        "https://billing.stripe.com",
      ],
    },
  })
);

// Global Middlewares
app.use(
  "/payments/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.static("public"));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(tryAuthenticateUser);
app.use(accessMiddleware);

app.use((req, res, next) => {
  if (req.path === "/user/upload-profile-image") {
    return next();
  }
  csrfProtection(req, res, next);
});

app.use(attachCsrfToken);

app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

app.use("/payments", paymentRouter);
app.use("/auth", oauthRoutes);
app.use("/auth", twoFARoutes);
app.use("/user", userRouter);
app.use("/url", urlRouter);
app.use("/", verifyEmailRouter);
app.use("/", forgotPasswordRouter);
app.use("/", staticRouter);
app.use("/", redirectRouter);
app.use(notFound);
app.use(errorHandler);

const options = {
  key: fs.readFileSync("./ssl/key.pem"),
  cert: fs.readFileSync("./ssl/cert.pem"),
};

appLogger.info("Linkify server starting...");
https.createServer(options, app).listen(PORT, () => {
  appLogger.info(`Server running on port ${PORT}`);
});
