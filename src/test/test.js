const request = require("supertest");
const startServer = require("../server");

describe("Coffee Shop API", () => {
  let testApp;
  let testServer;

  afterAll((done) => {
    testServer.close(done);
  });

  beforeAll(() => {
    const { app, server } = startServer({
      menuItems: [
        {
          id: "1",
          name: "Espresso",
          price: 3.0,
          imageFileName: "espresso.jpg",
        },
        { id: "2", name: "Latte", price: 4.0, imageFileName: "latte.jpg" },
        {
          id: "3",
          name: "Cappuccino",
          price: 4.5,
          imageFileName: "cappuccino.jpg",
        },
      ],
      menuItemDescriptionMap: {
        1: "Espresso is not merely a drink; it is a cultural phenomenon woven into the very fabric of daily life.",
        2: "At its core, the latte is a celebration of craftsmanship. It starts with a shot—or two—of robust espresso, extracted with precision to ensure that every drop is imbued with deep, complex flavors. This concentrated coffee serves as the foundation upon which the magic unfolds. Steamed milk is then introduced, transformed into a silky texture that envelops the espresso in a warm embrace. The final touch—a delicate layer of frothy milk foam—adds an ethereal quality, inviting both visual and tactile delight.",
        3: "In the grand theater of coffee culture, where aromas swirl and flavors collide, there exists a beverage that stands as a paragon of balance and artistry—the cappuccino. This enchanting concoction, a triumphant blend of robust espresso, creamy steamed milk, and a crown of velvety foam, is not merely a drink; it is an experience that encapsulates the very essence of coffee craftsmanship and cultural heritage.",
      },
      orders: [
        {
          id: "1",
          items: ["1"],
          totalPrice: 3,
          loyaltyNumber: "123456789",
          name: "John",
          status: "pending",
        },
        {
          id: "2",
          items: ["2"],
          totalPrice: 2,
          loyaltyNumber: "987654321",
          name: "Jane",
          status: "completed",
        },
      ],
      loyaltyAccounts: [
        { name: "John", loyaltyNumber: "123456789", balance: 10 },
        { name: "Jane", loyaltyNumber: "987654321", balance: 20 },
      ],
    });
    testServer = server;
    testApp = app;
  });

  describe("GET /menu", () => {
    it("should return all menu items", async () => {
      const res = await request(testApp).get("/menu");
      expect(res.status).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBe(3);
    });

    it("should return menu item details for the specific item", async () => {
      const res = await request(testApp).get("/menu/1");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        id: "1",
        name: "Espresso",
        price: 3.0,
        imageFileName: "espresso.jpg",
        description: "Espresso is not merely a drink; it is a cultural phenomenon woven into the very fabric of daily life.",
      });
    });
  });

  describe("GET /order/search", () => {
    it("should return orders by name", async () => {
      const res = await request(testApp)
        .get("/order/search")
        .query({ name: "John" });
      expect(res.status).toBe(200);
      expect(res.body).toEqual([
        {
          id: "1",
          items: ["1"],
          totalPrice: 3,
          loyaltyNumber: "123456789",
          name: "John",
          status: "pending",
        },
      ]);
    });

    it("should return orders by orderId", async () => {
      const res = await request(testApp)
        .get("/order/search")
        .query({ orderId: "2" });
      expect(res.status).toBe(200);
      expect(res.body).toEqual([
        {
          id: "2",
          items: ["2"],
          totalPrice: 2,
          loyaltyNumber: "987654321",
          name: "Jane",
          status: "completed",
        },
      ]);
    });

    it("should return orders by loyaltyNumber", async () => {
      const res = await request(testApp)
        .get("/order/search")
        .query({ loyaltyNumber: "123456789" });
      expect(res.status).toBe(200);
      expect(res.body).toEqual([
        {
          id: "1",
          items: ["1"],
          totalPrice: 3,
          loyaltyNumber: "123456789",
          name: "John",
          status: "pending",
        },
      ]);
    });

    it("should return 404 if no orders found", async () => {
      const res = await request(testApp)
        .get("/order/search")
        .query({ name: "Nonexistent" });
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: "Order not found" });
    });
  });

  describe("POST /order", () => {
    it("should create a new order", async () => {
      const order = {
        items: ["1", "2"],
        loyaltyNumber: "1234567890",
        name: "John Doe",
      };
      const res = await request(testApp).post("/order").send(order);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Order placed");
      expect(res.body.order.items).toEqual(["1", "2"]);
    });

    it("should return an error for invalid items", async () => {
      const order = {
        items: ["99"],
        loyaltyNumber: "1234567890",
        name: "John Doe",
      };
      const res = await request(testApp).post("/order").send(order);
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid menu items");
    });

    it("should return an error for invalid input", async () => {
      const order = {
        items: "invalid",
        loyaltyNumber: 1234567890,
        name: 123,
      };
      const res = await request(testApp).post("/order").send(order);
      expect(res.status).toBe(400);
      expect(res.body.errors).toBeInstanceOf(Array);
    });
  });

  describe("POST /loyalty", () => {
    it("should create a new loyalty account", async () => {
      const newAccount = {
        name: "Jane Doe",
        loyaltyNumber: "9876543210",
        balance: 50,
      };

      const response = await request(testApp)
        .post("/loyalty")
        .send(newAccount)
        .expect(201);

      expect(response.body.message).toBe("Loyalty account created");
      expect(response.body.loyaltyAccount).toEqual(newAccount);
    });

    it("should not create a loyalty account with an existing loyalty number", async () => {
      const existingAccount = {
        name: "John Doe",
        loyaltyNumber: "1234567890",
        balance: 100,
      };
      testApp.loyaltyAccounts.push(existingAccount); // Set the initial state

      const response = await request(testApp)
        .post("/loyalty")
        .send(existingAccount)
        .expect(400);

      expect(response.body.message).toBe("Loyalty account already exists");
    });

    it("should not create a loyalty account with invalid data", async () => {
      const invalidAccount = {
        name: "Invalid Account",
        loyaltyNumber: "invalid",
        balance: -10,
      };

      const response = await request(testApp)
        .post("/loyalty")
        .send(invalidAccount)
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });
  });

  describe("Put /order/:orderId", () => {
    it("should update the status of an existing order to 'completed'", async () => {
      const order = {
        items: ["1", "2"],
        loyaltyNumber: "1234567890",
        name: "John Doe",
      };
      const orderRes = await request(testApp).post("/order").send(order);

      expect(orderRes.status).toBe(200);
      expect(orderRes.body.message).toBe("Order placed");
      const orderId = orderRes.body.order.id;

      const statusUpdatedOrder = { ...order, status: "completed" };
      const statusUpdatedOrderRes = await request(testApp)
        .put(`/order/${orderId}`)
        .send(statusUpdatedOrder);

      expect(statusUpdatedOrderRes.status).toBe(200);
      expect(statusUpdatedOrderRes.body.message).toBe("Order updated");
      expect(statusUpdatedOrderRes.body.order.status).toBe("completed");
    });
  });

  describe("PUT /loyalty/:loyaltyNumber", () => {
    it("should update the loyalty account balance", async () => {
      const loyaltyAccount = { loyaltyNumber: "1234567890", balance: 50 };
      testApp.loyaltyAccounts = [loyaltyAccount]; // Set the initial state

      const updatedBalance = { balance: 100 };
      const res = await request(testApp)
        .put(`/loyalty/${loyaltyAccount.loyaltyNumber}`)
        .send(updatedBalance);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Loyalty account balance updated");
      expect(res.body.loyaltyAccount.balance).toBe(100);
    });

    it("should return an error if loyalty account not found", async () => {
      const updatedBalance = { balance: 100 };
      const res = await request(testApp)
        .put("/loyalty/9999999999")
        .send(updatedBalance);
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Loyalty account not found");
    });

    it("should return an error for invalid input", async () => {
      const updatedBalance = { balance: -100 };
      const res = await request(testApp)
        .put("/loyalty/1234567890")
        .send(updatedBalance);
      expect(res.status).toBe(400);
      expect(res.body.errors).toBeInstanceOf(Array);
    });
  });

  describe("GET /loyalty/:loyaltyNumber", () => {
    it("should return the balance of an existing loyalty account", async () => {
      const loyaltyAccount = {
        name: "John Doe",
        loyaltyNumber: "1234567890",
        balance: 100,
      };
      testApp.loyaltyAccounts.push(loyaltyAccount); // Set the initial state

      const res = await request(testApp)
        .get(`/loyalty/${loyaltyAccount.loyaltyNumber}`)
        .expect(200);

      expect(res.body.balance).toBe(loyaltyAccount.balance);
    });

    it("should return an error if loyalty account not found", async () => {
      const res = await request(testApp).get("/loyalty/9999999999").expect(404);

      expect(res.body.message).toBe("Loyalty account not found");
    });
  });
});
