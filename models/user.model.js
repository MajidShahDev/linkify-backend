import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () {
        // Password is required only for local users
        return this.provider === "local";
      },
    },
    role: {
      type: String,
      required: true,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },

    // Fields for forgot-password functionality
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,

    // Google OAuth fields
    googleId: {
      type: String,
      unique: true, // no two documents can have the same value
      sparse: true, //sparse: true = ignore null/undefined values when checking uniqueness
      //                  // because by default Mongo treats null as a value.
      //
    },
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    profileImage: {
      type: String,
      default: "/images/default.svg", // default image from server
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorCode: String,
    twoFactorExpires: Date,
    subscription: {
      plan: {
        type: String,
        enum: ["FREE", "PRO"],
        default: "FREE",
      },

      status: {
        type: String,
        enum: ["inactive", "active", "cancelled"],
        default: "inactive",
      },

      stripeCustomerId: {
        type: String,
        sparse: true,
      },

      stripeSubscriptionId: {
        type: String,
        sparse: true,
      },

      currentPeriodEnd: {
        type: Date,
      },
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
