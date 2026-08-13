import MenuItem from "../models/MenuItem.js";

// GET MENU (only available items)
export const getMenu = async (req, res, next) => {
  try {
    const items = await MenuItem.find({});

    const normalized = items.map(i => ({
      id: i.itemId,
      title: i.title,
      price: i.price,
      desc: i.desc,
      type: i.type,
      category: i.category,
      section: i.section,
      image: i.image,
    }));

    res.json({
      success: true,
      data: normalized
    });
  } catch (error) {
    next(error);
  }
};
