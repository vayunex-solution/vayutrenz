// routes/seller.routes.js
import express from "express";
import {
    getOrdersDetails,
    getBusiness,
    createBusiness,
    getSeller,
    // insertFakeProducts,
    getSellerProducts,
    createOneProduct,
    createMultipleProduct,
    updateProduct,
    deleteProduct,
} from "../controllers/seller.controller.js";
import {protectRoute} from "../middleware/auth.middleware.js"
const router = express.Router();



router.get("/orders/:sellerId", getOrdersDetails);
router.get("/business/:sellerId", getBusiness);
router.post("/business/create",protectRoute ,createBusiness);
// router.put("/insert/fake/product", insertFakeProducts);
// insertFakeProducts();



// get seller products
router.get("/get/products",protectRoute, getSellerProducts);

// create products
router.post("/create/one-product", protectRoute, createOneProduct);
router.post("/create/multiple-product", protectRoute, createMultipleProduct);

// Route: PUT /api/product/:id
router.put("/product/:id",protectRoute, updateProduct);

// Route: DELETE /api/product/:id
router.delete("/product/:id", protectRoute, deleteProduct);


// moved from the top
router.get("/:userId", getSeller);

export default router;
