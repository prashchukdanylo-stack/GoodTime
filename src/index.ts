import { createServer } from "node:http";

const port = Number(process.env.PORT ?? 3000);

createServer().listen(port, "0.0.0.0", () => {
  console.log(`Server running at http://localhost:${port}`);
});
