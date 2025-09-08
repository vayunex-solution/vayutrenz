import express from "express";
import {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} from "../controllers/category.controller.js";
const router = express.Router();
import {protectRoute} from "../middleware/auth.middleware.js"

router.get("/", getAllCategories);          // GET all categories grouped by type
router.post("/",protectRoute, createCategory);           // CREATE a new category

// PUT /api/category/:id
router.put("/:id", protectRoute, updateCategory);

// DELETE /api/category/:id
router.delete("/:id", protectRoute, deleteCategory);

export default router;
