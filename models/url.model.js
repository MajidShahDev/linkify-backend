import mongoose from "mongoose";

const urlSchema = new mongoose.Schema(
  {
    shortId: {
      type: String,
      required: true,
      unique: true,
    },
    redirectURL: {
      type: String,
      required: true,
    },
    clicks: {
      type: Number,
      default: 0,
      index: true, // 🔥 important for sorting
    },
    clicks24h: {
      type: Number,
      default: 0,
      index: true,
    },

    clicks7d: {
      type: Number,
      default: 0,
      index: true,
    },

    clicks30d: {
      type: Number,
      default: 0,
      index: true,
    },
    visitHistory: [
      {
        timestamp: { type: Date },
        ipAddress: { type: String },
        location: { type: String },
        userAgent: { type: String },
        referrer: { type: String },
      },
    ],
    createdBy: {
      type: mongoose.Schema.ObjectId, // Type is Id of User(mean which user generated url);
      ref: "users", // now this id reference to users collection.
    },
  },
  { timestamps: true }
);

const URL = mongoose.model("URL", urlSchema);
export default URL;