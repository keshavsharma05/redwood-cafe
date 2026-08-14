import express from "express";
import Order from "../models/Order.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// FAKE PAYMENT CONFIRMATION
router.post("/fake/confirm", protect, async (req, res, next) => {
  try {
    const { orderId, status } = req.body;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Enforce Ownership
    if (order.accountPhone !== req.user.phone && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized to confirm this order" });
    }

    // State Machine Protection & Replay Prevention
    const validInitialStates = ["scheduled", "Inbox", "confirmed"];
    if (!validInitialStates.includes(order.status)) {
      return res.status(400).json({ success: false, message: "Order is already processed or in an invalid state for confirmation" });
    }

    if (status === "paid") {
      if (order.orderType === "scheduled" && order.status === "scheduled") {
        order.status = "confirmed";
        await order.save();
      } else if (order.orderType !== "scheduled" && order.status === "Inbox") {
        // Dine-in order already in Inbox, no status change needed, just acknowledge
        // (If we had an isPaid boolean, we'd set it here, but Redwood uses status)
      }
    }

    res.json({
      success: true,
      message: "Payment confirmed",
      data: { orderId: order._id, status: order.status }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
