import express from "express";
import {
    loginOwner,
    deleteOwner,
    deleteAllOwners,
    getOwner,
    getAllOwners,
    updateOwnerDetails,
    insertCategories,
    createCategory,
    deleteCategoryById,
    deleteCategoryByName,
    
} from "../controllers/owner.controller.js";

const router = express.Router();

// Routes
router.post("/login", loginOwner);
router.delete("/:id", deleteOwner);
router.delete("/", deleteAllOwners);
router.get("/:id", getOwner);
router.get("/", getAllOwners);
router.put("/:id", updateOwnerDetails);

/////// categories ///////
router.post("/insert/categories", insertCategories);
router.post("/category", createCategory);
router.delete("/category/id/:id", deleteCategoryById);
router.delete("/category/name/:name", deleteCategoryByName);




export default router;
