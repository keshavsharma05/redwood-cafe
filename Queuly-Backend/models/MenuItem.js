import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    itemId: {
      type: String,
      required: true,
      unique: true, // matches frontend id "1", "2", etc
    },
    title: String,
    desc: String,
      image: String,     
    price: Number,
    type: {
      type: String,
      enum: ["veg", "non-veg"],
    },
    category: String,
    section: {
      type: String,
      enum: ["food", "drinks"],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    prepTime: {
      type: Number,
      default: 5, // Default preparation time in minutes
    },
  },
  { timestamps: true }
);

export default mongoose.model("MenuItem", menuItemSchema, "menuitem");