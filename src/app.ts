import express, { type Express, type NextFunction, type Request, type Response } from "express";
import type { OrderStore } from "./store.js";
import { parseCreateOrder } from "./validate.js";

function isJsonParseError(err: unknown): boolean {
  return err instanceof SyntaxError && "body" in err;
}

export function createApp(store: OrderStore): Express {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json());

  app.get("/orders", (_req, res) => {
    res.json({ orders: store.list() });
  });

  app.get("/orders/:id", (req, res) => {
    const id = req.params.id;
    if (id === undefined || id.length === 0) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    const order = store.get(id);
    if (order === undefined) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.json(order);
  });

  app.post("/orders", (req, res) => {
    const parsed = parseCreateOrder(req.body);
    if (!parsed.ok) {
      res.status(400).json({ error: "Validation failed", details: parsed.details });
      return;
    }

    const order = store.add(parsed.value);
    res.status(201).json(order);
  });

  app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (isJsonParseError(err)) {
      res.status(400).json({
        error: "Validation failed",
        details: ["Request body must be valid JSON"],
      });
      return;
    }
    next(err);
  });

  return app;
}
