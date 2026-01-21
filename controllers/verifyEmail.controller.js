const User = require("../models/user.model");

// controllers/verifyEmail.controller.js
const {
  generateEmailVerificationToken,
  sendVerificationEmail,
  verifyEmail,
} = require("../services/verifyEmail.service");

// send verification email
// async function handleSendVerificationEmail(req, res) {
//   try {
//     const user = req.user; // assuming user is authenticated
//     const token = await generateEmailVerificationToken(user._id);
//     await sendVerificationEmail(user.email, token);

//     return res.render("verify-email", {
//       message: "Verification email sent!",
//       error: null,
//     });
//   } catch (err) {
//     return res.render("verify-email", {
//       message: null,
//       error: err.message,
//     });
//   }
// }
async function handleSendVerificationEmail(reqOrUser, res = null) {
  try {
    // Determine if called from signup (user object) or route (req)
    let user;
    if (reqOrUser && reqOrUser._id) {
      // Called internally with user object
      user = reqOrUser;
    } else if (reqOrUser && reqOrUser.user) {
      // Called as route handler with req
      user = reqOrUser.user;
    } else {
      throw new Error("User not found");
    }

    // Generate token and send email
    const token = await generateEmailVerificationToken(user._id);
    await sendVerificationEmail(user.email, token);

    // If res exists, render the page (route call)
    if (res) {
      return res.render("verify-email", {
        message: "Verification email sent!",
        error: null,
        info: "We’ve sent a verification link to your email. Please check your inbox and click on the link to verify your account.",
      });
    }

    // If called internally, just return success
    return { success: true, message: "Verification email sent!" };
  } catch (err) {
    // If res exists, render page with error
    if (res) {
      return res.render("auth/verify-email", {
        message: null,
        error: err.message,
        info: null,
      });
    }

    // Internal call, throw error to handle it in caller
    throw err;
  }
}

// async function handleResendVerificationEmail(req, res) {
//   try {
//     const userId = req.user._id;
//     const email = req.user.email;

//     if (req.user.isVerified) {
//       return res.render("verify-email", {
//         message: null,
//         error: null,
//         info: "Your email is already verified. Login here.",
//       });
//     }

//     const token = await generateEmailVerificationToken(userId);
//     await sendVerificationEmail(email, token);

//     return res.render("verify-email", {
//       message: "Verification email sent!",
//       error: null,
//       info: null,
//     });
//   } catch (err) {
//     return res.render("verify-email", {
//       message: null,
//       error: err.message,
//       info: null,
//     });
//   }
// }

// verify email via link

async function handleResendVerificationEmail(req, res) {
  try {
    // ✅ Fetch latest user from DB
    const user = await User.findById(req.user._id);

    if (!user) throw new Error("User not found");

    if (user.isEmailVerified) {
      return res.render("auth/verify-email", {
        message: "Your email is already verified. Login here.",
        error: null,
        info: null,
      });
    }

    const token = await generateEmailVerificationToken(user._id);
    await sendVerificationEmail(user.email, token);

    return res.render("verify-email", {
      message: "Verification email resent!",
      error: null,
      info: "We’ve sent a verification link to your email. Please check your inbox and click on the link to verify your account.",
    });
  } catch (err) {
    return res.render("auth/verify-email", {
      message: null,
      error: err.message,
      info: null,
    });
  }
}

async function handleVerifyEmail(req, res) {
  try {
    const { token } = req.params;
    await verifyEmail(token);

    return res.render("auth/verify-email-success");
  } catch (err) {
    return res.render("auth/verify-email-success", {
      message: null,
      error: err.message,
      info: null,
    });
  }
}

module.exports = {
  handleSendVerificationEmail,
  handleResendVerificationEmail,
  handleVerifyEmail,
};
