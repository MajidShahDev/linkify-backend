// require("dotenv").config();
import "dotenv/config"; // automatically loads .env
import "./cronJobs/updateClicks.js";
import express from "express";
import connectMongoDb from "./config/db.js";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "path";
import passport from "./config/passport.js";
import fs from "fs";
import https from "https";

// import helmet from "helmet"; // security headers

import urlRouter from "./routes/url.routes.js";
import redirectRouter from "./routes/redirect.routes.js";
import staticRouter from "./routes/static.routes.js";
import userRouter from "./routes/user.routes.js";
import uploadRouter from "./routes/upload.routes.js";
import forgotPasswordRouter from "./routes/forgotPassword.routes.js";
import verifyEmailRouter from "./routes/verifyEmail.routes.js";
import oauthRoutes from "./routes/oauth.routes.js";

import { tryAuthenticateUser } from "./middlewares/auth.middleware.js";

const app = express();
const PORT = process.env.PORT || 3000;

connectMongoDb(process.env.MONGO_URL)
  .then(() => console.log("MongoDb connected"))
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1); //process.exit() immediately stops the server.
    //                The number 1 means exit with an error (0 would mean successful exit).
  });

app.set("view engine", "ejs"); // setting template engine to ejs to compile ejs files.
//                               "view engine" is a predefined Express key to set the template engine.
//                               "ejs" is the template engine name used to compile .ejs files.
//                                After this, whenever you call res.render('someFile'), Express uses EJS to compile it.
//                                Express automatically require the EJS library internally; no manual require needed.
app.set("views", path.resolve("./views")); // setting views are in views directory
//                               "views" is a predefined Express key to set the directory where template files live.
//                                This tells Express where to look for files when using res.render().
//                                // render = template file name // redirect = route/url

// Global Middlewares are attached to every route handlers middleware stack, as first middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // parsing form data
app.use(cookieParser());
app.use(morgan("dev"));
app.use(tryAuthenticateUser);
app.use(express.static("public"));
app.use(passport.initialize());
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

app.use("/auth", oauthRoutes);
app.use("/upload", uploadRouter); // route handle user uploadFile(post)
app.use("/user", userRouter); // route handle user login(post) and sign up(post)
app.use("/url", urlRouter); // route handle generate(post) new shorturl and get analytics of short url
app.use("/", verifyEmailRouter);
app.use("/", forgotPasswordRouter);
app.use("/", staticRouter); // route handle static home, signIn, signup page
app.use("/", redirectRouter); // route handle redirect to orignalUrl from shortId.

const options = {
  key: fs.readFileSync("./ssl/key.pem"),
  cert: fs.readFileSync("./ssl/cert.pem"),
};

https.createServer(options, app).listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] HTTPS server running on port: ${PORT}`);
});

// console.log(`[${new Date().toISOString()}] HTTPS running at https://localhost:3000`);
// app.listen(PORT, () => {
  // console.log(`[${new Date().toISOString()}] Server running on port: ${PORT}`);
//   // console.log(`Express app server is started & listening on port: ${PORT}`);
// });

// app.use("/url",restrictToLoggedInUserOnly ,urlRouter); // run restrictToLoggedInUserOnly for this route only
