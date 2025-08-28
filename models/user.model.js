import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    // User Information
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "first name cannot exceed 50 characters"],
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      unique: true,
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [
        /^(?:\\+234|0)(?:70|80|81|90|91)\\d{8}$/,
        "Please enter a valid Nigerian phone number",
      ],
    },

    //   Business Information
    businessName: {
      type: String,
      required: [true, "Business name is required"],
      trim: true,
      maxlength: [155, "Business name cannot exceed 155 characters"],
    },

    businessType: {
      type: String,
      required: [true, "Business type is required"],
      enum: [
        "Freelancer",
        "Small Business",
        "Online Store",
        "Startup",
        "Consultant",
        "Other",
      ],
    },

    password: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },

    //   User x Service  Agreements
    agreeToTerms: {
      type: Boolean,
      required: [true, `You must agree to teh terms of service`],
    },

    subscribeToNewsLetter: {
      type: Boolean,
      default: false,
    },

    //   System fields
    emailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String, // To store the unique token sent to the user's email for activation. // -> Sent to user via email with the verification link.

    verificationTokenExpires: Date, // Sets expiration date and time for the token to expire.

    isActive: {
      type: Boolean,
      default: false,
    },

    lastLogin: Date,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true }
);
// Password encryption middleware
userSchema.pre("save", async function (next) {
  // Check if the password field was changed
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 15);
  next();
});

// Update passwordChangedAt when password is modified
userSchema.pre("save", function (next) {
  // this.isNew: it also checks if the document is being created for the first time.
  // The timestamp should only be set when a password is updated, not when a user is first registered
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000; //Ensure token is created after
  next();
});

// Instance method to check password - when the user logs in
userSchema.methods.correctPassword = async function (candidatePassword) {
  // compares the plain password to the hashed password to determine if the passwords match each other. vvvvvvv
  return await bcrypt.compare(candidatePassword, this.password);
};
/*
-> (1) Verify if token was issued before a password changed
-> (2) if true, force the user to login again (as a security measure)
-> (3) Prevent use of old tokens after password changes.
*/

// To check if the user changed their password after a specific JWT was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    //vvvvv- convert the password changed time to seconds
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Instance method to create password reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 + 60 * 1000; //10 minutes

  return resetToken;
};

// Instance method to create email verification token
userSchema.methods.createVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');

  this.verificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  this.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return verificationToken;
};

const User = mongoose.model("User", userSchema);

export default User;
