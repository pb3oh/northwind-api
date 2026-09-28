export type OrderStatus = "received" | "processing" | "shipped" | "delivered";

export interface OrderItem {
  sku: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
}

export interface Order {
  id: string;
  customerName: string;
  status: OrderStatus;
  items: OrderItem[];
  totalCents: number;
  createdAt: string;
}

export interface CreateOrderInput {
  customerName: string;
  items: OrderItem[];
}
