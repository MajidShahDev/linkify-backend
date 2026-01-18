const { validationResult } = require("express-validator");
const { signup, login } = require("../services/user.service"); // adjust path
const { handleSendVerificationEmail } = require("../controllers/verifyEmail.controller");

// async function handleUserSignup(req, res) {
//   const errors = validationResult(req);
//   // console.log(errors.array());

//   if (!errors.isEmpty()) {
//     const fieldErrors = {};

//     errors.array().forEach((err) => {
//       if (!fieldErrors[err.path]) {
//         fieldErrors[err.path] = [];
//       }
//       fieldErrors[err.path].push(err.msg);
//     });

//     return res.status(400).render("signup", {
//       errors: fieldErrors,
//       oldInput: {
//         name: req.body.name || "",
//         email: req.body.email || "",
//       },
//     });
//   }

//   try {
//     const { name, email, password } = req.body;
//     await signup({ name, email, password });
//     return res.redirect("/login");
//   } catch (err) {
//     return res.status(400).render("signup", {
//       errors: {
//         email: [err.message], // <-- always an array
//       },
//       oldInput: {
//         name: req.body.name || "",
//         email: req.body.email || "",
//       },
//     });
//   }
// }

// async function handleUserSignup(req, res) {
//   try {
//     const { name, email, password } = req.body;
//     await signup({ name, email, password });
//     return res.redirect("/login");
//   } catch (err) {
//     console.error(err.message);
//     return res.status(400).render("signup", { error: err.message });
//   }
// }

// async function handleUserLogin(req, res) {
//   try {
//     const { email, password } = req.body;
//     const { token } = await login({ email, password });

//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
//     });

//     return res.redirect("/");
//   } catch (err) {
//     console.error(err.message);
//     return res.status(400).render("login", { error: err.message });
//   }
// }

async function handleUserSignup(req, res) {
  const errors = validationResult(req);
  // console.log(errors.array());

  if (!errors.isEmpty()) {
    const fieldErrors = {};

    errors.array().forEach((err) => {
      if (!fieldErrors[err.path]) {
        fieldErrors[err.path] = [];
      }
      fieldErrors[err.path].push(err.msg);
    });

    return res.status(400).render("signup", {
      errors: fieldErrors,
      oldInput: {
        name: req.body.name || "",
        email: req.body.email || "",
      },
    });
  }

  try {
    const { name, email, password } = req.body;
    const user = await signup({ name, email, password });
    await handleSendVerificationEmail(user);
    return res.render("verify-email", {
    message: "Signup successful!",
    error: null,
    info: "We’ve sent a verification link to your email. Please check your inbox and click on the link to verify your account.",
  });
  } catch (err) {
    return res.status(400).render("signup", {
      errors: {
        email: [err.message], // <-- always an array
      },
      oldInput: {
        name: req.body.name || "",
        email: req.body.email || "",
      },
    });
  }
}

async function handleUserLogin(req, res) {
  const errors = validationResult(req);

  // 1️⃣ Validation errors
  if (!errors.isEmpty()) {
    const fieldErrors = {};
    errors.array().forEach((err) => {
      if (!fieldErrors[err.path]) {
        fieldErrors[err.path] = [];
      }
      fieldErrors[err.path].push(err.msg);
    });

    return res.status(400).render("login", {
      errors: fieldErrors,
      oldInput: { email: req.body.email || "" },
    });
  }

  // 2️⃣ Proceed with login
  try {
    const { email, password } = req.body;
    const { token } = await login({ email, password }); // your login service

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    });

    return res.redirect("/");
  } catch (err) {
    // wrong credentials or other errors
    return res.status(400).render("login", {
      errors: { general: [err.message] },
      oldInput: { email: req.body.email || "" },
    });
  }
}

function handleUserLogout(req, res) {
  res.clearCookie("token");
  return res.redirect("/login");
}

module.exports = {
  handleUserSignup,
  handleUserLogin,
  handleUserLogout,
};

// const bcrypt = require("bcrypt");
// const User = require("../models/user.model");
// const { setUser } = require("../service/auth.service");

// async function handleUserSignup(req, res) {
//   try {
//     const { name, email, password } = req.body;
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).send("User with this email already exists");
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     await User.create({
//       name,
//       email,
//       password: hashedPassword,
//     });
//     return res.redirect("/login");
//   } catch (err) {
//     return res.status(500).send("Server error");
//   }
// }

// async function handleUserLogin(req, res) {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.render("login", { error: "Invalid email or password" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.render("login", { error: "Invalid email or password" });
//     }

//     const token = setUser(user);
//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
//     });

//     return res.redirect("/");
//   } catch (err) {
//     console.error(err);
//     return res.status(500).send("Server error");
//   }
// }

// async function handleUserLogout(req, res) {
//   res.clearCookie("token");

//   return res.redirect("/login"); //
// }

// module.exports = {
//   handleUserSignup,
//   handleUserLogin,
//   handleUserLogout,
// };
