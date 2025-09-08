import express from "express";
import {
  getEmailRoles,
  insertEmailRole,
  deleteEmailRole
} from "../controllers/EmailRole.controller.js";
import {protectRoute} from "../middleware/auth.middleware.js"

const router = express.Router();

router.get("/get", protectRoute, getEmailRoles);
router.post("/insert", protectRoute, insertEmailRole);
router.delete("/:email", protectRoute, deleteEmailRole);

export default router;
