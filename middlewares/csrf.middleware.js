import csurf from "csurf";

// cookie-based CSRF
export const csrfProtection = csurf({ cookie: true }); // create secret and store in cookie, also reads from cookie

// optional helper to pass token to views
export const attachCsrfToken = (req, res, next) => {
  try {
    const token = req.csrfToken(); // generate csrf token
    // console.log("CSRF TOKEN:", token);
    res.locals.csrfToken = token; // with res.locals csrfToken is automatically available in every EJS page
  } catch (err) {
    res.locals.csrfToken = null;
  }
  next();
};
