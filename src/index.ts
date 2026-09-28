import { createApp } from "./app.js";
import { createOrderStore } from "./store.js";

function readPort(): number {
  const raw = process.env.PORT;
  if (raw === undefined || raw.trim() === "") {
    return 3000;
  }

  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT: ${raw}`);
  }
  return port;
}

const port = readPort();
const app = createApp(createOrderStore());

app.listen(port, () => {
  console.log(`northwind-api listening on port ${port}`);
});
