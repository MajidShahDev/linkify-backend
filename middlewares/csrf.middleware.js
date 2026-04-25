import csurf from "csurf";

// cookie-based CSRF
export const csrfProtection = csurf({ cookie: true });

// optional helper to pass token to views
export const attachCsrfToken = (req, res, next) => {
  try {
    const token = req.csrfToken();
    // console.log("CSRF TOKEN:", token);
    res.locals.csrfToken = token; // with res.locals csrfToken is automatically available in EJS
  } catch (err) {
    res.locals.csrfToken = null;
  }
  next();
};
