import User from "../models/User.js";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const otpStore = new Map();

// @desc    Request Demo OTP
export const requestOtp = async (req, res, next) => {
  const { phone } = req.body;
  if (!phone || phone.length < 10) {
    res.status(400);
    return next(new Error("Valid phone number is required"));
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store OTP with 5 min expiration
  otpStore.set(phone, {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000
  });

  // Return the OTP in the response for demo purposes
  res.json({
    success: true,
    message: "OTP generated",
    data: {
      phone,
      demoOtp: otp
    }
  });
};

// @desc    Verify OTP & Login/Signup
export const verifyOtp = async (req, res, next) => {
  const { phone, otp, name } = req.body;

  if (!phone || !otp) {
    res.status(400);
    return next(new Error("Phone and OTP are required"));
  }

  const storedData = otpStore.get(phone);
  
  if (!storedData) {
    res.status(400);
    return next(new Error("OTP expired or not requested"));
  }

  if (storedData.otp !== otp || Date.now() > storedData.expiresAt) {
    res.status(401);
    return next(new Error("Invalid or expired OTP"));
  }

  // Valid OTP, remove it
  otpStore.delete(phone);

  try {
    let user = await User.findOne({ phone });

    if (!user) {
      // Create user with dummy email/password to satisfy schema
      const generatedEmail = `${phone}@redwood.local`;
      const generatedPassword = `Auth_${phone}_${Date.now()}`;
      
      user = await User.create({
        name: name || "Guest User",
        email: generatedEmail,
        phone,
        password: generatedPassword,
      });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
export const authUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          isAdmin: user.isAdmin,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(401);
      throw new Error("Invalid email or password");
    }
  } catch (error) {
    next(error);
  }
};
