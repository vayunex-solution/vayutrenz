// routes/product.routes.js
import express from "express";
import {
    getProduct,
    getMultipleProducts,
    getProductsByCategoryId,
    getProductsByCategoryArray,
    getProductsByAllCategories,
    getProductsByOffer,
    getProductsByCategory,
    getProductsBySearchKeyword,
} from "../controllers/product.controller.js";

const router = express.Router();


router.post("/multiple", getMultipleProducts); // POST is better for sending array in body
router.post("/category/:categoryId", getProductsByCategoryId);


router.post('/filter/search', getProductsBySearchKeyword);
router.post('/filter/category', getProductsByCategory);
router.post('/filter/offer', getProductsByOffer);
router.post('/filter/all-categories', getProductsByAllCategories);
router.post('/filter/category-array', getProductsByCategoryArray);

router.get("/:id", getProduct);


// insertCategoriesInProducts();

export default router;

