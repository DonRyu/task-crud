import { Router } from "express";
import AppError from "../errors/AppError.js";

const router = Router();

router.get("/tasks", async (req, res, next) => {
  try {
    res.json([]);
  } catch (err) {
    next(err);
  }
});

router.get("/tasks/:id", async (req, res, next) => {
  try {
    throw new AppError("Task no found", 404);
  } catch (err) {
    next(err);
  }
});

router.post("/tasks", async (req, res, next) => {
  try {
    res.status(201).json({});
  } catch (err) {
    next(err);
  }
});

router.patch("/tasks/:id", async (req, res, next) => {
  try {
    res.json({});
  } catch (err) {
    next(err);
  }
});

router.delete("/tasks/:id", async (req, res, next) => {
  try {
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
