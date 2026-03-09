import express from "express";
import router from "./routes/index.js";

const app = express();

app.use(express.json());
app.use("/api", router);

app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || "internal Server Error";
  res.status(status).json({ error: message });
});

export default app;
