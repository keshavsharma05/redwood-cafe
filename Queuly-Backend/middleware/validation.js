export const validateRegister = (req, res, next) => {
  const { name, email, phone, password } = req.body;
  const errors = [];

  if (!name) errors.push("Name is required");
  if (!email || !email.includes("@")) errors.push("Valid email is required");
  if (!phone || phone.length < 10) errors.push("Valid phone number is required");
  if (!password || password.length < 6) errors.push("Password must be at least 6 characters");

  if (errors.length > 0) {
    res.status(400);
    return next(new Error(errors.join(", ")));
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) errors.push("Email is required");
  if (!password) errors.push("Password is required");

  if (errors.length > 0) {
    res.status(400);
    return next(new Error(errors.join(", ")));
  }

  next();
};

export const validateOrder = (req, res, next) => {
  const { orderType, items } = req.body;
  const errors = [];

  if (!orderType || !["arrived", "scheduled"].includes(orderType)) {
    errors.push("Valid orderType ('arrived' or 'scheduled') is required");
  }
  if (!items || !Array.isArray(items) || items.length === 0) {
    errors.push("At least one item is required");
  }

  if (errors.length > 0) {
    res.status(400);
    return next(new Error(errors.join(", ")));
  }

  next();
};
