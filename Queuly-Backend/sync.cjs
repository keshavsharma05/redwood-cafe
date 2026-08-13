const fs = require('fs');

const raw = fs.readFileSync('../Queuly/src/data/menuData.js', 'utf8');
const jsCode = raw.replace('export const MENU_DATA =', 'return');

const getMenuData = new Function(jsCode);
const menuData = getMenuData();

const converted = menuData.map(item => {
  const newItem = { ...item, itemId: item.id };
  delete newItem.id;
  return newItem;
});

const content = `import mongoose from "mongoose";
import dotenv from "dotenv";
import MenuItem from "./models/MenuItem.js";

dotenv.config();

const MENU_DATA = ${JSON.stringify(converted, null, 2)};

const seedMenu = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await MenuItem.deleteMany();
    await MenuItem.insertMany(MENU_DATA);
    console.log("✅ Menu seeded successfully");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding failed", err);
    process.exit(1);
  }
};

seedMenu();
`;

fs.writeFileSync('seedMenu.js', content);
