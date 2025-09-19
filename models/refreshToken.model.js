import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true }, //hashed token
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    expiredAt: Date,
    revoked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("RefreshToken", refreshTokenSchema);
