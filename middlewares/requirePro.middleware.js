import { hasFeature } from "../services/subscription.service.js";

export function requireFeature(feature) {
  return async function (req, res, next) {
    try {
      const allowed = await hasFeature(req.user._id, feature);

      if (!allowed) {
        return res.status(403).render("payments/upgrade", {
          feature,
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
