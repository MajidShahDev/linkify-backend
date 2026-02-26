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
      enum: ["NORMAL", "ADMIN"],
      default: "NORMAL",
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
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
