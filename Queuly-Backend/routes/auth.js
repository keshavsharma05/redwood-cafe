import express from "express";
import { requestOtp, verifyOtp, authUser } from "../controllers/authController.js";
import { validateLogin } from "../middleware/validation.js";

const router = express.Router();

router.post("/request-otp", requestOtp);
router.post("/verify-otp", verifyOtp);
router.post("/login", validateLogin, authUser);

export default router;
