const express = require("express");
const bodyParser = require("body-parser");
const { z } = require("zod");

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Mock data
const menuItems = [
  { id: "1", name: "Espresso", price: 3.0 },
  { id: "2", name: "Latte", price: 4.0 },
  { id: "3", name: "Cappuccino", price: 4.5 },
];

const orders = [];
const loyaltyAccounts = [];

// Zod schemas
const orderSchema = z.object({
  items: z.array(z.string()),
  loyaltyNumber: z.string(),
  name: z.string(),
});

const editOrderSchema = z.object({
  items: z.array(z.string()).optional(),
  loyaltyNumber: z.string().optional(),
  name: z.string().optional(),
});

const loyaltyAccountSchema = z.object({
  loyaltyNumber: z.string(),
  balance: z.number().nonnegative(),
});

// API endpoints
app.get("/menu", (req, res) => {
  res.json(menuItems);
});

app.post("/order", (req, res) => {
  const validation = orderSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({ errors: validation.error.errors });
  }

  const { items, loyaltyNumber, name } = req.body;

  // Validate menu items
  const invalidItems = items.filter(
    (itemId) => !menuItems.some((menuItem) => menuItem.id === itemId)
  );
  if (invalidItems.length > 0) {
    return res
      .status(400)
      .json({ message: "Invalid menu items", invalidItems });
  }

  // Calculate total price
  const totalPrice = items.reduce((total, itemId) => {
    const item = menuItems.find((menuItem) => menuItem.id === itemId);
    return total + item.price;
  }, 0);

  // Create order
  const newOrder = {
    id: (orders.length + 1).toString(),
    items,
    loyaltyNumber,
    name,
    totalPrice,
    status: "received",
  };

  orders.push(newOrder);

  // Update loyalty account balance
  let loyaltyAccount = loyaltyAccounts.find(
    (account) => account.loyaltyNumber === loyaltyNumber
  );
  if (!loyaltyAccount) {
    loyaltyAccount = { loyaltyNumber, balance: 0 };
    loyaltyAccounts.push(loyaltyAccount);
  }
  loyaltyAccount.balance += totalPrice;

  res.status(201).json({ message: "Order received", order: newOrder });
});

app.put("/order/:id", (req, res) => {
  const orderId = req.params.id;
  const validation = editOrderSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({ errors: validation.error.errors });
  }

  const order = orders.find((o) => o.id === orderId);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  const { items, loyaltyNumber, name } = req.body;

  if (items) {
    // Validate menu items
    const invalidItems = items.filter(
      (itemId) => !menuItems.some((menuItem) => menuItem.id === itemId)
    );
    if (invalidItems.length > 0) {
      return res
        .status(400)
        .json({ message: "Invalid menu items", invalidItems });
    }

    // Calculate total price
    const totalPrice = items.reduce((total, itemId) => {
      const item = menuItems.find((menuItem) => menuItem.id === itemId);
      return total + item.price;
    }, 0);

    order.items = items;
    order.totalPrice = totalPrice;
  }

  if (loyaltyNumber) {
    order.loyaltyNumber = loyaltyNumber;
  }

  if (name) {
    order.name = name;
  }

  res.status(200).json({ message: "Order updated", order });
});

app.put("/loyalty/:loyaltyNumber", (req, res) => {
  const { loyaltyNumber } = req.params;
  const { balance } = req.body;

  const loyaltyAccount = app.locals.loyaltyAccounts.find(
    (account) => account.loyaltyNumber === loyaltyNumber
  );

  if (!loyaltyAccount) {
    return res.status(404).json({ message: "Loyalty account not found" });
  }

  if (balance < 0) {
    return res.status(400).json({ errors: ["Balance cannot be negative"] });
  }

  loyaltyAccount.balance = balance;
  res
    .status(200)
    .json({ message: "Loyalty account balance updated", loyaltyAccount });
});

module.exports = app;
