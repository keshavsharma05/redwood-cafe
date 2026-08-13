import express from "express";
import {
  createOrder,
  getOrderById,
  getAllOrders,
  getHistoryDays,
  updateOrderStatus,
  getOrdersByPhone,
  confirmOrder,
  delayOrder,
  adminStartPrep,
  userDelayOrder,
} from "../controllers/orderController.js";
import { protect, admin } from "../middleware/auth.js";
import { validateOrder } from "../middleware/validation.js";

const router = express.Router();

router.get("/history-days", protect, admin, getHistoryDays);
router.post("/create", validateOrder, createOrder); // Public for customers
router.get("/", protect, admin, getAllOrders);
router.get("/user/:phone", getOrdersByPhone);
router.get("/:id", getOrderById);
router.patch("/:id/status", protect, admin, updateOrderStatus);
router.patch("/:id/confirm", confirmOrder);
router.patch("/:id/delay", delayOrder);
router.patch("/:id/start-prep", protect, admin, adminStartPrep);
router.patch("/:id/user-delay", userDelayOrder);

export default router;
