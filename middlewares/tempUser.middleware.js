export function requireTempUser(req, res, next) {
  if (!req.session.tempUserId) {
    return res.redirect("/login");
  }

  next();
}