# northwind-api

Small TypeScript REST API for tracking customer orders. Orders live in memory and reset when the process restarts.

## Requirements

- Node.js 20 or newer

## Setup

```bash
npm install
```

## Run

```bash
npm run dev
```

The server listens on port 3000. Set `PORT` to use a different port.

## Scripts

- `npm run dev` — start the API with reload
- `npm run build` — compile TypeScript to `dist/`
- `npm start` — run the compiled server
- `npm run lint` — run ESLint
- `npm run typecheck` — run the TypeScript compiler
- `npm test` — run the Vitest suite

## Endpoints

### `GET /orders`

Returns the in-memory orders:

```json
{ "orders": [] }
```

### `GET /orders/:id`

Returns one order. Unknown ids respond with `404` and `{ "error": "Order not found" }`.

### `POST /orders`

Creates an order. `status` is set to `received`, and `totalCents` is the sum of `quantity * unitPriceCents`.

```json
{
  "customerName": "Around the Horn",
  "items": [
    { "sku": "IKURA-08", "name": "Ikura", "quantity": 3, "unitPriceCents": 3100 }
  ]
}
```

A missing or invalid body responds with `400` and `{ "error": "Validation failed", "details": [] }`.
