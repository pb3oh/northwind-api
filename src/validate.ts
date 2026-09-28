import type { CreateOrderInput, OrderItem } from "./types.js";

export type ParseResult =
  | { ok: true; value: CreateOrderInput }
  | { ok: false; details: string[] };

const MAX_CUSTOMER_NAME = 120;
const MAX_ITEM_TEXT = 80;
const MAX_ITEMS = 20;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredText(value: unknown, field: string, maxLength: number, details: string[]): string | undefined {
  if (value === undefined || value === null) {
    details.push(`${field} is required`);
    return undefined;
  }
  if (typeof value !== "string") {
    details.push(`${field} must be a string`);
    return undefined;
  }
  const trimmed = value.trim();
  if (trimmed.length < 1 || trimmed.length > maxLength) {
    details.push(`${field} must be between 1 and ${maxLength} characters`);
    return undefined;
  }
  return trimmed;
}

function requiredInt(
  value: unknown,
  field: string,
  min: number,
  details: string[],
): number | undefined {
  if (value === undefined || value === null) {
    details.push(`${field} is required`);
    return undefined;
  }
  if (typeof value !== "number" || !Number.isInteger(value)) {
    details.push(`${field} must be an integer`);
    return undefined;
  }
  if (value < min) {
    details.push(`${field} must be at least ${min}`);
    return undefined;
  }
  return value;
}

function parseItem(value: unknown, index: number, details: string[]): OrderItem | undefined {
  const prefix = `items[${index}]`;
  if (!isRecord(value)) {
    details.push(`${prefix} must be an object`);
    return undefined;
  }

  const sku = requiredText(value.sku, `${prefix}.sku`, MAX_ITEM_TEXT, details);
  const name = requiredText(value.name, `${prefix}.name`, MAX_ITEM_TEXT, details);
  const quantity = requiredInt(value.quantity, `${prefix}.quantity`, 1, details);
  const unitPriceCents = requiredInt(value.unitPriceCents, `${prefix}.unitPriceCents`, 0, details);

  if (sku === undefined || name === undefined || quantity === undefined || unitPriceCents === undefined) {
    return undefined;
  }

  return { sku, name, quantity, unitPriceCents };
}

export function parseCreateOrder(body: unknown): ParseResult {
  if (!isRecord(body)) {
    return { ok: false, details: ["Request body must be a JSON object"] };
  }

  const details: string[] = [];
  const customerName = requiredText(body.customerName, "customerName", MAX_CUSTOMER_NAME, details);

  let items: OrderItem[] | undefined;
  if (body.items === undefined || body.items === null) {
    details.push("items is required");
  } else if (!Array.isArray(body.items)) {
    details.push("items must be an array");
  } else if (body.items.length < 1) {
    details.push("items must be a non-empty array");
  } else if (body.items.length > MAX_ITEMS) {
    details.push(`items must contain at most ${MAX_ITEMS} entries`);
  } else {
    const parsed: OrderItem[] = [];
    for (let index = 0; index < body.items.length; index += 1) {
      const item = parseItem(body.items[index], index, details);
      if (item !== undefined) {
        parsed.push(item);
      }
    }
    if (parsed.length === body.items.length) {
      items = parsed;
    }
  }

  if (customerName === undefined || items === undefined || details.length > 0) {
    return { ok: false, details };
  }

  return { ok: true, value: { customerName, items } };
}
