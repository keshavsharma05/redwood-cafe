import mongoose from "mongoose";
import bcrypt from "bcryptjs";

mongoose.connect("mongodb://127.0.0.1:27017/redwood_cafe").then(async () => {
  const db = mongoose.connection.db;
  const hashedPassword = await bcrypt.hash("admin123", 10);
  
  await db.collection("users").updateOne(
    { email: "admin@towncoffee.com" },
    { 
      $set: { 
        name: "Admin", 
        email: "admin@towncoffee.com", 
        phone: "0000000000", 
        password: hashedPassword, 
        isAdmin: true 
      } 
    },
    { upsert: true }
  );
  
  console.log("Admin user created successfully!");
  process.exit(0);
}).catch(console.error);
