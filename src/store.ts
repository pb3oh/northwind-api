import { randomUUID } from "node:crypto";
import type { CreateOrderInput, Order } from "./types.js";

const SEED_ORDERS: readonly Order[] = [
  {
    id: "ord_1001",
    customerName: "Alfreds Futterkiste",
    status: "shipped",
    items: [{ sku: "CHAI-01", name: "Chai", quantity: 10, unitPriceCents: 1800 }],
    totalCents: 18000,
    createdAt: "2026-01-15T10:00:00.000Z",
  },
  {
    id: "ord_1002",
    customerName: "Ana Trujillo Emparedados",
    status: "received",
    items: [
      { sku: "TOFU-04", name: "Tofu", quantity: 5, unitPriceCents: 2325 },
      { sku: "KONBU-12", name: "Konbu", quantity: 2, unitPriceCents: 600 },
    ],
    totalCents: 12825,
    createdAt: "2026-02-02T14:30:00.000Z",
  },
];

export interface OrderStore {
  list(): Order[];
  get(id: string): Order | undefined;
  add(input: CreateOrderInput): Order;
}

function cloneOrder(order: Order): Order {
  return structuredClone(order);
}

export function createOrderStore(initial: readonly Order[] = SEED_ORDERS): OrderStore {
  const orders = new Map<string, Order>();
  for (const order of initial) {
    orders.set(order.id, cloneOrder(order));
  }

  return {
    list(): Order[] {
      return [...orders.values()].map(cloneOrder);
    },
    get(id: string): Order | undefined {
      const order = orders.get(id);
      return order === undefined ? undefined : cloneOrder(order);
    },
    add(input: CreateOrderInput): Order {
      const items = input.items.map((item) => ({ ...item }));
      const order: Order = {
        id: `ord_${randomUUID()}`,
        customerName: input.customerName,
        status: "received",
        items,
        totalCents: items.reduce((sum, item) => sum + item.quantity * item.unitPriceCents, 0),
        createdAt: new Date().toISOString(),
      };
      orders.set(order.id, order);
      return cloneOrder(order);
    },
  };
}
