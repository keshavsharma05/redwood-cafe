import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    cafeId: {
      type: String,
      default: "demo-cafe",
    },
    orderType: {
      type: String,
      enum: ["arrived", "scheduled"],
      required: true,
    },
    tableNumber: {
      type: Number,
      default: null,
    },
    arrivalTime: {
      type: String,
      default: null,
    },
    adminDelayUsed: {
  type: Boolean,
  default: false,
},
userDelayUsed: {
  type: Boolean,
  default: false,
},
    items: [
      {
        itemId: String,
        title: String,
        price: Number,
        image: String,
        qty: Number,
      },
    ],
    total: {
      type: Number,
      required: true,
    },
    accountName: String,
    accountPhone: String,
    pickerName: String,
    pickerPhone: String,
    status: {
      type: String,
      enum: ["Inbox", "Preparing", "Ready", "Completed", "scheduled", "confirmed", "unconfirmed", "late"],
      default: "Inbox",
    },
    scheduledTime: Date,
    prepStartTime: Date,
    isDelayed: {
      type: Boolean,
      default: false,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
