import Order from "../models/Order.js";
import MenuItem from "../models/MenuItem.js";

/* =========================
   CREATE ORDER
========================= */
export const createOrder = async (req, res, next) => {
  try {
    const { 
      orderType, 
      tableNumber, 
      arrivalTime, 
      items, 
      pickerName,
      pickerPhone
    } = req.body;

    const accountName = req.user.name;
    const accountPhone = req.user.phone;

    if (!items || items.length === 0) {
      res.status(400);
      throw new Error("No items in order");
    }

    // Fetch menu once
    const menuItems = await MenuItem.find();
    const menuMap = {};
    menuItems.forEach(m => {
      menuMap[m.itemId] = m;
    });

    // Calculate real total and preparation time
    let totalPrepTime = 0;
    const itemsSnapshot = items.map(item => {
      if (typeof item.qty !== 'number' || item.qty <= 0 || !Number.isInteger(item.qty)) {
        res.status(400);
        throw new Error("Invalid quantity");
      }
      const menuItem = menuMap[item.itemId];
      if (!menuItem) {
        res.status(400);
        throw new Error(`Menu item not found: ${item.itemId}`);
      }
      totalPrepTime = Math.max(totalPrepTime, menuItem.prepTime || 5);
      return {
        itemId: item.itemId,
        title: menuItem.title,
        price: menuItem.price,
        image: menuItem.image || "",
        qty: item.qty
      };
    });

    const total = itemsSnapshot.reduce((sum, item) => sum + (item.price * item.qty), 0);

    let scheduledTime = null;
    let prepStartTime = null;
    let status = "Inbox";

    // HARD SEPARATION: Only 'scheduled' type gets scheduled/prep times and 'scheduled' status
    if (orderType === "scheduled" && arrivalTime) {
      const [hours, minutes] = arrivalTime.split(":").map(Number);
      const now = new Date();
      scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);
      
      if (scheduledTime < now) {
        res.status(400);
        throw new Error("Cannot schedule for a time that has already passed today.");
      }
      
      const minGapMinutes = 45;
      const minAllowedTime = new Date(now.getTime() + minGapMinutes * 60000);

      if (scheduledTime < minAllowedTime) {
        res.status(400);
        throw new Error(`Orders must be scheduled at least ${minGapMinutes} minutes in advance.`);
      }

      prepStartTime = new Date(scheduledTime.getTime() - totalPrepTime * 60000);
      if (prepStartTime <= now) {
        prepStartTime = new Date(now.getTime() + 2 * 60000);
      }
      status = "scheduled";
    } else {
      // Arrived (Dine-in) flow
      status = "Inbox";
      // Explicitly ensure these are null
      scheduledTime = null;
      prepStartTime = null;
    }

    const order = await Order.create({
      orderType,
      tableNumber,
      arrivalTime,
      items: itemsSnapshot,
      accountName,
      accountPhone,
      pickerName: pickerName || accountName,
      pickerPhone: pickerPhone || accountPhone,
      total,
      status,
      scheduledTime,
      prepStartTime,
    });

    res.status(201).json({ 
      success: true, 
      data: { orderId: order._id } 
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   CONFIRM ORDER (User)
========================= */
export const confirmOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    if (order.accountPhone !== req.user.phone && !req.user.isAdmin) {
      res.status(403);
      throw new Error("Not authorized to confirm this order");
    }

    if (order.status !== "scheduled") {
      res.status(400);
      throw new Error("Only scheduled orders can be confirmed");
    }

    order.status = "confirmed";
    await order.save();

    res.json({ success: true, message: "Order confirmed" });
  } catch (error) {
    next(error);
  }
};

/* =========================
   DELAY ORDER (User/Admin)
========================= */
export const delayOrder = async (req, res, next) => {
  try {
    const { newTime } = req.body; // "HH:MM"
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    if (order.accountPhone !== req.user.phone && !req.user.isAdmin) {
      res.status(403);
      throw new Error("Not authorized to delay this order");
    }

    // Only scheduled/inbox allowed
    const now = new Date();

if (order.prepStartTime <= now) {
  res.status(400);
  throw new Error("Cannot delay after preparation started");
}

    // Only once
    if (order.adminDelayUsed) {
      res.status(400);
      throw new Error("Admin delay already used");
    }

    if (!order.scheduledTime) {
      res.status(400);
      throw new Error("Only scheduled orders can be delayed");
    }

    // Parse new time
    const [hours, minutes] = newTime.split(":").map(Number);
    const newScheduledTime = new Date(order.scheduledTime);
    newScheduledTime.setHours(hours, minutes, 0, 0);

    // Same day validation
    if (newScheduledTime.toDateString() !== order.scheduledTime.toDateString()) {
      res.status(400);
      throw new Error("Delay must be within same day");
    }

    // Future time validation
    if (newScheduledTime <= now) {
      res.status(400);
      throw new Error("New time must be in the future");
    }

    // Calculate prep duration
    const prepDuration =
      (order.scheduledTime.getTime() - order.prepStartTime.getTime()) / 60000;

    const newPrepStartTime = new Date(
      newScheduledTime.getTime() - prepDuration * 60000
    );

    // Apply update
    order.scheduledTime = newScheduledTime;
    order.prepStartTime = newPrepStartTime;
    order.arrivalTime = newTime;
    order.adminDelayUsed = true;

    // Reset to scheduled (goes back to queue)
    order.status = "scheduled";

    await order.save();

    res.json({
      success: true,
      message: "Order delayed successfully",
      data: {
        scheduledTime: order.scheduledTime,
        prepStartTime: order.prepStartTime,
      },
    });
  } catch (error) {
    next(error);
  }
};
/* =========================
   START PREPARATION (Admin Manual Override)
========================= */
export const adminStartPrep = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    order.status = "Preparing";
    await order.save();

    res.json({ success: true, message: "Preparation started", data: order });
  } catch (error) {
    next(error);
  }
};
export const userDelayOrder = async (req, res, next) => {
  try {
    const { newTime } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    if (order.accountPhone !== req.user.phone && !req.user.isAdmin) {
      res.status(403);
      throw new Error("Not authorized to modify this order");
    }

    // ❗ User delay only once
    if (order.userDelayUsed) {
      res.status(400);
      throw new Error("You can only delay once");
    }

    const now = new Date();

    // ❗ Cannot delay after prep started
    if (order.prepStartTime <= now) {
      res.status(400);
      throw new Error("Too late to delay");
    }

    // Parse time
    const [hours, minutes] = newTime.split(":").map(Number);

    const newScheduledTime = new Date(order.scheduledTime);
    newScheduledTime.setHours(hours, minutes, 0, 0);

    // Same day check
    if (newScheduledTime.toDateString() !== order.scheduledTime.toDateString()) {
      res.status(400);
      throw new Error("Must be same day");
    }

    // Future check
    if (newScheduledTime <= now) {
      res.status(400);
      throw new Error("Time must be in future");
    }

    // Recalculate prep
    const prepDuration =
      (order.scheduledTime - order.prepStartTime) / 60000;

    const newPrepStartTime = new Date(
      newScheduledTime.getTime() - prepDuration * 60000
    );

    // Apply
    order.scheduledTime = newScheduledTime;
    order.prepStartTime = newPrepStartTime;
    order.arrivalTime = newTime;
    order.userDelayUsed = true;

    // ❗ DO NOT force status change like admin
    // user shouldn't mess kitchen flow

    await order.save();

    res.json({
      success: true,
      message: "Delay applied",
    });
  } catch (err) {
    next(err);
  }
};
/* =========================
   UPDATE ORDER STATUS (ADMIN)
========================= */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    // Don't allow changing status back from Completed unless it's an intentional admin override
    if (order.status === "Completed" && status !== "Completed") {
       console.log(`[AUTH] Admin overriding Completed status for order ${order._id}`);
    }

    order.status = status;
    await order.save();

    res.json({ 
      success: true, 
      message: `Status updated to ${status}`, 
      data: order 
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   GET SINGLE ORDER (OrderStatus)
========================= */
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    if (order.accountPhone !== req.user.phone && !req.user.isAdmin) {
      res.status(403);
      throw new Error("Not authorized to view this order");
    }

    const menuItems = await MenuItem.find();
    const menuMap = {};
    menuItems.forEach(m => {
      menuMap[m.itemId] = m;
    });

    const orderObj = order.toObject();
    orderObj.items = orderObj.items.map(i => ({
      ...i,
      title: i.title || menuMap[i.itemId]?.title || "Unknown Item",
      price: i.price !== undefined ? i.price : (menuMap[i.itemId]?.price || 0),
      image: i.image || menuMap[i.itemId]?.image || "",
    }));

    res.json({
      success: true,
      data: orderObj
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   GET ALL ORDERS (Admin)
========================= */
export const getAllOrders = async (req, res, next) => {
  try {
    const { date, phone } = req.query;
    let filter = {};

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    if (phone) {
      filter.accountPhone = phone;
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });

    const menuItems = await MenuItem.find();
    const menuMap = {};
    menuItems.forEach(m => {
      menuMap[m.itemId] = m;
    });

    const enrichedOrders = orders.map(order => {
      const orderObj = order.toObject();
      return {
        ...orderObj,
        items: orderObj.items.map(i => ({
          ...i,
          title: i.title || menuMap[i.itemId]?.title || "Unknown Item",
          price: i.price !== undefined ? i.price : (menuMap[i.itemId]?.price || 0),
          image: i.image || menuMap[i.itemId]?.image || "",
        })),
      };
    });

    res.json({
      success: true,
      data: enrichedOrders
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   GET HISTORY DATES
========================= */
export const getHistoryDays = async (req, res, next) => {
  try {
    const dates = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
        }
      },
      { $sort: { _id: -1 } }
    ]);
    res.json({
      success: true,
      data: dates.map(d => d._id)
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   GET ORDERS BY PHONE (User)
========================= */
export const getOrdersByPhone = async (req, res, next) => {
  try {
    const { phone } = req.params;
    if (phone !== req.user.phone && !req.user.isAdmin) {
      res.status(403);
      throw new Error("Not authorized to view orders for this phone");
    }

    const orders = await Order.find({ accountPhone: phone })
      .sort({ createdAt: -1 });

    const menuItems = await MenuItem.find();
    const menuMap = {};
    menuItems.forEach(m => {
      menuMap[m.itemId] = m;
    });

    const enrichedOrders = orders.map(order => {
      const orderObj = order.toObject();
      return {
        ...orderObj,
        items: orderObj.items.map(i => ({
          ...i,
          title: i.title || menuMap[i.itemId]?.title || "Unknown Item",
          price: i.price !== undefined ? i.price : (menuMap[i.itemId]?.price || 0),
          image: i.image || menuMap[i.itemId]?.image || "",
        })),
      };
    });

    res.json({
      success: true,
      data: enrichedOrders
    });
  } catch (error) {
    next(error);
  }
};
