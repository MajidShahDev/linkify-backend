import { verifyToken } from "../services/auth.service.js";
import AppError from "../utils/AppError.js";

export function tryAuthenticateUser(req, res, next) {
  req.user = null; // Default to unauthenticated; ensures req.user is always defined
  //               // Initialize default user state for authentication as null(unauthenticated.)
  //               // This ensures that if there is no token or invalid token after, req.user is always defined.
  const userToken = req.cookies?.token; //
  if (!userToken) return next();
  const user = verifyToken(userToken);
  req.user = user;
  // req.locals.user = user;
  return next();
}

export function redirectIfAuthenticated(req, res, next) {
  if (req.user) {
    return res.redirect("/");
  }

  next();
}

export function restrictTo(roles = ["USER", "ADMIN"]) {
  return function (req, res, next) {
    if (!req.user) return res.redirect("/login");

    if (!roles.includes(req.user.role)) {
      return next(new AppError("You are not authorized to access this resource.", 403));
    }

    return next();
  };
}
