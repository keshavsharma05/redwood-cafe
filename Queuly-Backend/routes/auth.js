import express from "express";
import { registerUser, authUser } from "../controllers/authController.js";
import { validateRegister, validateLogin } from "../middleware/validation.js";

const router = express.Router();

router.post("/register", validateRegister, registerUser);
router.post("/login", validateLogin, authUser);

export default router;
