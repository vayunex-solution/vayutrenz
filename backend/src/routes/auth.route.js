import express from "express";
import {
    loginUser,
    loginBusinessAccount,
    checkAuthUser,
    checkAuthBusiness,
    logoutUser,
    logoutBusiness,
    updateAuth,
    getAddress,
    createAddress,
    editAddress,
    deleteAddress,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Login Routes
router.post("/login/user", loginUser);
router.post("/login/business-account", loginBusinessAccount);

// Auth Check Routes
router.get("/check/user", protectRoute, checkAuthUser);
router.get("/check/business-account", protectRoute, checkAuthBusiness);

// Logout Routes
router.post("/logout/user", protectRoute, logoutUser);
router.post("/logout/business-account", protectRoute, logoutBusiness);

// Update routes
router.put("/update-auth", protectRoute, updateAuth);


// addresses routes
router.get("/get/address", protectRoute, getAddress);
router.post("/create/address", protectRoute, createAddress);
router.put("/edit/address", protectRoute, editAddress);
router.delete("/delete/address", protectRoute, deleteAddress);

export default router;
