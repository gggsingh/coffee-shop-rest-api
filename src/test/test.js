const request = require("supertest");
const app = require("../app");
const server = require("../server");

afterAll((done) => {
  server.close(done);
});

describe("GET /menu", () => {
  it("should return all menu items", async () => {
    const res = await request(app).get("/menu");
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(3);
  });
});

describe("POST /order", () => {
  it("should create a new order", async () => {
    const order = {
      items: ["1", "2"],
      loyaltyNumber: "1234567890",
      name: "John Doe",
    };
    const res = await request(app).post("/order").send(order);
    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Order received");
    expect(res.body.order.items).toEqual(["1", "2"]);
  });

  it("should return an error for invalid items", async () => {
    const order = {
      items: ["99"],
      loyaltyNumber: "1234567890",
      name: "John Doe",
    };
    const res = await request(app).post("/order").send(order);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid menu items");
  });

  it("should return an error for invalid input", async () => {
    const order = {
      items: "invalid",
      loyaltyNumber: 1234567890,
      name: 123,
    };
    const res = await request(app).post("/order").send(order);
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeInstanceOf(Array);
  });
});

describe("PUT /loyalty/:loyaltyNumber", () => {
  it("should update the loyalty account balance", async () => {
    const loyaltyAccount = { loyaltyNumber: "1234567890", balance: 50 };
    app.locals.loyaltyAccounts = [loyaltyAccount]; // Set the initial state

    const updatedBalance = { balance: 100 };
    const res = await request(app)
      .put(`/loyalty/${loyaltyAccount.loyaltyNumber}`)
      .send(updatedBalance);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Loyalty account balance updated");
    expect(res.body.loyaltyAccount.balance).toBe(100);
  });

  it("should return an error if loyalty account not found", async () => {
    const updatedBalance = { balance: 100 };
    const res = await request(app)
      .put("/loyalty/9999999999")
      .send(updatedBalance);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Loyalty account not found");
  });

  it("should return an error for invalid input", async () => {
    const updatedBalance = { balance: -100 };
    const res = await request(app)
      .put("/loyalty/1234567890")
      .send(updatedBalance);
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeInstanceOf(Array);
  });
});
