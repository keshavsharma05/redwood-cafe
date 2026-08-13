import express from "express";
import Order from "../models/Order.js";

const router = express.Router();

// FAKE PAYMENT CONFIRMATION
router.post("/fake/confirm", async (req, res, next) => {
  try {
    const { orderId, status } = req.body;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (status === "paid") {
      // Arrived (Dine-in) orders stay in Inbox, Scheduled orders move to confirmed
      order.status = order.orderType === "scheduled" ? "confirmed" : "Inbox";
      await order.save();
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
