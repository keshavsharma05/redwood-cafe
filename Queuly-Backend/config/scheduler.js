import cron from "node-cron";
import Order from "../models/Order.js";

const initScheduler = () => {
  console.log("[SCHEDULER] Initializing background jobs...");

  // Run every minute
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      
      // 1. Handle Reminders (~10 mins before prepStartTime)
      const reminderThreshold = new Date(now.getTime() + 10 * 60000);
      const ordersToRemind = await Order.find({
        status: "scheduled",
        reminderSent: false,
        prepStartTime: { $lte: reminderThreshold },
      });

      for (const order of ordersToRemind) {
        console.log(`[SCHEDULER] Triggering reminder for Order ${order._id}`);
        order.reminderSent = true;
        // In a real app, send push notification/SMS here
        await order.save();
      }

      // 2. Handle Auto-Preparation Start
      // ✅ ONLY MOVE PAID (CONFIRMED) SCHEDULED ORDERS AT PREP TIME
      const toInbox = await Order.find({
        orderType: "scheduled",
        status: "confirmed",
        prepStartTime: { $lte: now },
      });

for (const order of toInbox) {
  console.log(`[SCHEDULER] Moving Order ${order._id} to INBOX`);
  order.status = "Inbox";
  await order.save();
}
      // 3. Handle Lateness
      const lateOrders = await Order.find({
        status: { $in: ["Inbox", "Preparing", "confirmed", "scheduled", "unconfirmed"] },
        scheduledTime: { $lt: now },
      });

      for (const order of lateOrders) {
        if (order.scheduledTime) {
          console.log(`[SCHEDULER] Marking Order ${order._id} as LATE`);
          order.status = "late";
          await order.save();
        }
      }

    } catch (error) {
      console.error("[SCHEDULER] Error in background job:", error.message);
    }
  });

  console.log("[SCHEDULER] Cron job scheduled (1 min interval)");
};

export default initScheduler;
