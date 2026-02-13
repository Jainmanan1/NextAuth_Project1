import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },

  isVerified: {
    type: Boolean,
    default: false,
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  forgotPasswordToken: {
    type: String,
    index: true,
  },
  forgotPasswordExpiry: Date,
  
  verifyToken: {
    type: String,
    index: true,
  },
  verifyTokenExpiry: Date,
});

const User = mongoose.models.users || mongoose.model("users", userSchema);
export default User;
