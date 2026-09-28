import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { createOrderStore } from "../src/store.js";

function testApp() {
  return createApp(createOrderStore());
}

const newOrder = {
  customerName: "Around the Horn",
  items: [
    { sku: "IKURA-08", name: "Ikura", quantity: 3, unitPriceCents: 3100 },
    { sku: "CHAI-01", name: "Chai", quantity: 1, unitPriceCents: 1800 },
  ],
};

describe("GET /orders", () => {
  it("returns the seeded orders", async () => {
    const response = await request(testApp()).get("/orders");

    expect(response.status).toBe(200);
    expect(response.body.orders).toHaveLength(2);
    expect(response.body.orders[0]).toMatchObject({
      id: "ord_1001",
      customerName: "Alfreds Futterkiste",
      status: "shipped",
      totalCents: 18000,
    });
    expect(response.body.orders[1]).toMatchObject({
      id: "ord_1002",
      customerName: "Ana Trujillo Emparedados",
      status: "received",
      totalCents: 12825,
    });
  });
});

describe("GET /orders/:id", () => {
  it("returns the order when it exists", async () => {
    const response = await request(testApp()).get("/orders/ord_1002");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: "ord_1002",
      customerName: "Ana Trujillo Emparedados",
      status: "received",
      totalCents: 12825,
    });
    expect(response.body.items).toEqual([
      { sku: "TOFU-04", name: "Tofu", quantity: 5, unitPriceCents: 2325 },
      { sku: "KONBU-12", name: "Konbu", quantity: 2, unitPriceCents: 600 },
    ]);
  });

  it("returns 404 when the order does not exist", async () => {
    const response = await request(testApp()).get("/orders/ord_missing");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Order not found" });
  });
});

describe("POST /orders", () => {
  it("creates an order and computes the total", async () => {
    const response = await request(testApp()).post("/orders").send(newOrder);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      customerName: "Around the Horn",
      status: "received",
      items: newOrder.items,
      totalCents: 11100,
    });
    expect(response.body.id).toMatch(/^ord_/);
    expect(Number.isNaN(Date.parse(response.body.createdAt))).toBe(false);
  });

  it("returns the created order from GET /orders/:id", async () => {
    const app = testApp();
    const created = await request(app).post("/orders").send(newOrder);

    const fetched = await request(app).get(`/orders/${created.body.id}`);
    const listed = await request(app).get("/orders");

    expect(fetched.status).toBe(200);
    expect(fetched.body).toEqual(created.body);
    expect(listed.body.orders).toHaveLength(3);
    expect(listed.body.orders[2].id).toBe(created.body.id);
  });

  it("rejects a missing customerName", async () => {
    const app = testApp();
    const response = await request(app).post("/orders").send({
      items: [{ sku: "CHAI-01", name: "Chai", quantity: 1, unitPriceCents: 1800 }],
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Validation failed");
    expect(response.body.details).toContain("customerName is required");

    const listed = await request(app).get("/orders");
    expect(listed.body.orders).toHaveLength(2);
  });

  it("rejects an empty items array", async () => {
    const response = await request(testApp()).post("/orders").send({
      customerName: "Around the Horn",
      items: [],
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Validation failed");
    expect(response.body.details).toContain("items must be a non-empty array");
  });
});
