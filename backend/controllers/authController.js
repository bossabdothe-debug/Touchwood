import mongoose from "mongoose";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import createNotification from "../utils/createNotification.js";

const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])\S{8,}$/;

const nameRegex =
  /^[A-Za-zÀ-ÖØ-öø-ÿ\u0600-\u06FF\s'-]{2,50}$/;

const phoneRegex = /^\d{11}$/;

const sanitizeString = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
});

const isValidUserId = (userId) => {
  return mongoose.Types.ObjectId.isValid(userId);
};

export const register = async (req, res) => {
  try {
    const name = sanitizeString(req.body.name);
    const email = sanitizeString(req.body.email);
    const password =
      typeof req.body.password === "string"
        ? req.body.password
        : "";
    const phone = sanitizeString(req.body.phone);

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }
if (email === password ) {
      return res.status(400).json({
        message: "Email and password match",
      });
    }
    if (!nameRegex.test(name)) {
      return res.status(400).json({
        message: "Please enter a valid name",
      });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }
   

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and contain uppercase, lowercase, number and special character",
      });
    }

    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        message: "Phone Number must be 11 numbers",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(409).json({
        message:
          "An account already exists with this email or phone number",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
    });

    try {
      await createNotification({
        type: "new_user",
        title: "New User Registered",
        message: `${user.name} has created a new account.`,
        user: user._id,
      });
    } catch (notificationError) {
      console.error(
        "Create user notification error:",
        notificationError
      );
    }

    return res.status(201).json({
      message: `Welcome ${user.name}, your account has been created successfully`,
    });
  } catch (error) {
    console.error("Register error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "An account already exists with this email or phone number",
      });
    }

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const login = async (req, res) => {
  try {
    const email = sanitizeString(
      req.body.email
    ).toLowerCase();

    const password =
      typeof req.body.password === "string"
        ? req.body.password
        : "";

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    if (!emailRegex.test(email)) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const user = await User.findOne({ email, }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!process.env.SECRET_KEY) {
      console.error("SECRET_KEY is not configured");

      return res.status(500).json({
        message: "Internal Server Error",
      });
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );

    return res.status(200).json({
      message: `Welcome back ${user.name}`,
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!isValidUserId(userId)) {
      return res.status(400).json({
        message: "Invalid user",
      });
    }

    const name = sanitizeString(req.body.name);
    const email = sanitizeString(
      req.body.email
    ).toLowerCase();
    const phone = sanitizeString(req.body.phone);

    if (!name || !email || !phone) {
      return res.status(400).json({
        message: "Name, email and phone are required",
      });
    }

    if (!nameRegex.test(name)) {
      return res.status(400).json({
        message: "Please enter a valid name",
      });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        message: "Please enter a valid phone number",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
      _id: {
        $ne: userId,
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(409).json({
          message: "Unable to use this email address",
        });
      }

      return res.status(409).json({
        message: "Unable to use this phone number",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        email,
        phone,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      user: publicUser(updatedUser),
    });
  } catch (error) {
    console.error(
      "Update profile error:",
      error
    );

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "Email or phone number is already in use",
      });
    }

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!isValidUserId(userId)) {
      return res.status(400).json({
        message: "Invalid user",
      });
    }

    const currentPassword =
      typeof req.body.currentPassword === "string"
        ? req.body.currentPassword
        : "";

    const newPassword =
      typeof req.body.newPassword === "string"
        ? req.body.newPassword
        : "";

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message:
          "Current password and new password are required",
      });
    }

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "New password must be at least 8 characters and contain uppercase, lowercase, number and special character",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        message:
          "New password must be different from current password",
      });
    }

const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isCurrentPasswordValid =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      12
    );

    user.password = hashedPassword;

    await user.save();

    return res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error(
      "Change password error:",
      error
    );

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};