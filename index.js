require("dotenv").config();
const express = require("express");
const connectMongoDb = require("./connection");
const cookieParser = require("cookie-parser");

const urlRouter = require("./routes/url.routes.js");
const redirectRouter = require("./routes/redirect.routes");
const staticRouter = require("./routes/static.routes.js");
const userRouter = require("./routes/user.routes.js");
const uploadRouter = require("./routes/upload.routes");

const path = require("path");
const {
  tryAuthenticateUser,
  restrictTo,
} = require("./middlewares/auth.middleware");

const app = express();
const PORT = process.env.PORT;

connectMongoDb(process.env.MONGO_URL)
  .then(() => console.log("MongoDb Connected"))
  .catch((err) => console.log("Error Occured", err));

app.set("view engine", "ejs"); // setting template engine to ejs to compile ejs files.
//                               "view engine" is a predefined Express key to set the template engine.
//                               "ejs" is the template engine name used to compile .ejs files.
//                                After this, whenever you call res.render('someFile'), Express uses EJS to compile it.
//                                Express automatically require the EJS library internally; no manual require needed.
app.set("views", path.resolve("./views")); // setting views are in views directory
//                               "views" is a predefined Express key to set the directory where template files live.
//                                This tells Express where to look for files when using res.render().
//                                // render = template file name // redirect = route/url

app.use(express.json());
app.use(express.urlencoded({ extended: false })); // parsing form data
app.use(cookieParser());
app.use(tryAuthenticateUser);

app.use("/upload", uploadRouter); // route handle user uploadFile(post)
app.use("/user", userRouter); // route handle user login(post) and sign up(post)
app.use("/url", urlRouter); // route handle generate(post) new shorturl and get analytics of short url
app.use("/", staticRouter); // route handle static home, signIn, signup page
app.use("/", redirectRouter); // route handle redirect to orignalUrl from shortId.

app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] Server running on port: ${PORT}`);
  // console.log(`Express app server is started & listening on port: ${PORT}`);
});

// app.use("/url",restrictToLoggedInUserOnly ,urlRouter); // run restrictToLoggedInUserOnly for this route only
