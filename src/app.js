const express = require("express");
const bodyParser = require("body-parser");
const { z } = require("zod");

const createApp = (initialState = {}) => {
  const app = express();
  app.use(bodyParser.json());

  // Initialize state
  app.menuItems = initialState.menuItems || [];
  app.orders = initialState.orders || [];
  app.loyaltyAccounts = initialState.loyaltyAccounts || [];

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
    name: z.string(),
    loyaltyNumber: z.string(),
    balance: z.number().nonnegative(),
  });

  // API endpoints
  app.get("/menu", (req, res) => {
    res.json(app.menuItems);
  });

  app.get("/loyalty/:loyaltyNumber", (req, res) => {
    const { loyaltyNumber } = req.params;

    const loyaltyAccount = app.loyaltyAccounts.find(
      (account) => loyaltyNumber === account.loyaltyNumber
    );

    if (!loyaltyAccount) {
      return res.status(404).json({ message: "Loyalty account not found" });
    }

    res.status(200).json({ balance: loyaltyAccount.balance });
  });

  app.post("/order", (req, res) => {
    const validation = orderSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.errors });
    }

    const { items, loyaltyNumber, name } = req.body;

    // Validate menu items
    const invalidItems = items.filter(
      (itemId) => !app.menuItems.some((menuItem) => menuItem.id === itemId)
    );
    if (invalidItems.length > 0) {
      return res
        .status(400)
        .json({ message: "Invalid menu items", invalidItems });
    }

    // Calculate total price
    const totalPrice = items.reduce((total, itemId) => {
      const item = app.menuItems.find((menuItem) => menuItem.id === itemId);
      return total + item.price;
    }, 0);

    const order = {
      id: app.orders.length + 1,
      items,
      totalPrice,
      loyaltyNumber,
      name,
    };

    app.orders.push(order);
    res.status(201).json({ message: "Order received", order });
  });

  app.post("/loyalty", (req, res) => {
    const validation = loyaltyAccountSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.errors });
    }

    const { name, loyaltyNumber, balance } = req.body;

    // Check if loyalty account already exists
    const existingAccount = app.loyaltyAccounts.find(
      (account) => loyaltyNumber === account.loyaltyNumber
    );
    if (existingAccount) {
      return res
        .status(400)
        .json({ message: "Loyalty account already exists" });
    }

    const loyaltyAccount = { name, loyaltyNumber, balance };
    app.loyaltyAccounts.push(loyaltyAccount);

    res
      .status(201)
      .json({ message: "Loyalty account created", loyaltyAccount });
  });

  app.put("/order/:orderId", (req, res) => {
    const { orderId } = req.params;
    const validation = editOrderSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.errors });
    }

    const { items, loyaltyNumber, name } = req.body;
    const order = app.orders.find((order) => order.id === parseInt(orderId));

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (items) {
      // Validate menu items
      const invalidItems = items.filter(
        (itemId) => !app.menuItems.some((menuItem) => menuItem.id === itemId)
      );
      if (invalidItems.length > 0) {
        return res
          .status(400)
          .json({ message: "Invalid menu items", invalidItems });
      }

      // Calculate total price
      const totalPrice = items.reduce((total, itemId) => {
        const item = app.menuItems.find((menuItem) => menuItem.id === itemId);
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

    const loyaltyAccount = app.loyaltyAccounts.find(
      (account) => loyaltyNumber === account.loyaltyNumber
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

  return app;
};

module.exports = createApp;
