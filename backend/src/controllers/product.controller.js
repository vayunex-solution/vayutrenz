// controllers/product.controller.js
import mongoose from "mongoose";
import Product from "../models/product.model.js";
import { buildFilterQuery, getSortOption } from "../lib/productFilterUtils.js";
import WebsiteData from "../models/web.model.js"
import Category from '../models/category.model.js'

export const getProduct = async (req, res) => {
    try {
        console.log("req.params.id", req.params.id);
        const product = await Product.findById(req.params.id).populate("business", "businessName");
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// controllers/productController.js
export const getMultipleProducts = async (req, res) => {
    try {
        const { productIds } = req.body;

        if (!Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({ message: "Product IDs must be a non-empty array." });
        }

        const products = await Product.find(
            { _id: { $in: productIds } }
        ).select("image offer rating name price originalPrice discount likeNumbers business sizes outOfStockSize lowStockSize colors")
            .populate("business", "businessName") // Fetches business name only
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json(products);
    } catch (err) {
        console.error("Error fetching multiple products:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const getProductsByCategoryId = async (req, res) => {
    try {
        const { categoryId } = req.params;
        console.log("cid=",req.params.categoryId,"req.body=",req.body);
        const {gender} = req.body;
        const genderFilter = gender === "male"
            ? ["male", "unisex", "unigender"]
            : ["female", "unisex", "unigender"];
    
        if (!categoryId) {
            return res.status(400).json({ error: "categoryId is required." });
        }
    
        const products = await Product.find(
            { categories: categoryId, gender: { $in: genderFilter } }
        ).select("image offer rating name price originalPrice discount business")
        .populate("business", "businessName") // Fetches business name only
        .sort({ createdAt: -1 })
        .limit(20)
        .lean()

        res.status(200).json({
            message: "Products fetched successfully",
            products,
        });
    } catch (error) {
        console.error("Error fetching products by categoryId:", error);
        res.status(500).json({ error: "Server error while fetching products." });
    }
};


// Controller: Category
export const getProductsByCategory = async (req, res) => {
    try {
        console.log("req.body",req.body);
        const { categoryId, categoryName, filterItems = {}, skip = 0, limit = 20 } = req.body;
        const filterQuery = filterItems.length? buildFilterQuery(filterItems):[];
        const sort = getSortOption(filterItems?.SortBy?.[0]);

        let category= categoryId;
        if(!category && categoryName){
            const categoryObj = await Category.findOne({ categoryName: categoryName.trim() }).select('_id');
            category = categoryObj._id;
        }
        console.log(category);
        const products = await Product.find({
            categories: category,
            ...filterQuery
        }).select("image offer rating name price originalPrice discount business")
        .populate("business", "businessName") // Fetches business name only
        .sort(sort).skip(skip).limit(limit);

        res.json(products);
    } catch (err) {
        res.status(500).json({ error: 'Failed to filter products by category', details: err.message });
    }
};

// Controller: Offer
export const getProductsByOffer = async (req, res) => {
    try {
        // console.log("req.body",req.body);
        const { offer, filterItems = {}, skip = 0, limit = 20 } = req.body;
        const filterQuery = buildFilterQuery(filterItems);
        const sort = getSortOption(filterItems?.SortBy?.[0]);

        const products = await Product.find({
        offer: offer,
        ...filterQuery
        }).select("image offer rating name price originalPrice discount business")
            .populate("business", "businessName") // Fetches business name only
            .sort(sort).skip(skip).limit(limit);

        res.json(products);
    } catch (err) {
        res.status(500).json({ error: 'Failed to filter products by offer', details: err.message });
    }
};


export const getProductsBySearchKeyword = async (req, res) => {
    try {
        // console.log("req.body",req.body);
        const { keyword = "", filterItems = {}, skip = 0, limit = 20 } = req.body;
        
        if (!keyword && keyword.trim().length === 0) {
            return res.status(400).json({ error: "Search keyword cannot be empty." });
        }
        
        const filterQuery = buildFilterQuery(filterItems);
        const sort = getSortOption(filterItems?.SortBy?.[0]);

        const regex = new RegExp(keyword, 'i'); // original keyword
        const newKeyword = keyword.slice(1, -1); // remove first and last char
        const trimmedRegex = new RegExp(newKeyword, 'i'); // trimmed keyword
        
        const newKeyword2 = newKeyword.slice(1, -1); // remove first and last char
        const trimmedRegex2 = new RegExp(newKeyword2, 'i'); // trimmed keyword

        const keywordQuery = {
            $or: [
                // original keyword
                { name: regex },
                { offer: regex },
                { productDescription: regex },
                { 'keyHighlights.title': regex },
                { 'keyHighlights.value': regex },

                // trimmed keyword
                ...(newKeyword?.length ? [
                    { name: trimmedRegex },
                    { offer: trimmedRegex },
                    { productDescription: trimmedRegex },
                    { 'keyHighlights.title': trimmedRegex },
                    { 'keyHighlights.value': trimmedRegex }
                ] : []),

                // trimmed keyword
                ...(newKeyword2?.length ? [
                    { name: trimmedRegex2 },
                    { offer: trimmedRegex2 },
                    { productDescription: trimmedRegex2 },
                    { 'keyHighlights.title': trimmedRegex2 },
                    { 'keyHighlights.value': trimmedRegex2 }
                ] : [])
            ]
        };

        const products = await Product.find({
            ...keywordQuery,
            ...filterQuery
        })
        .populate({
            path: 'business',
            match: { businessName: regex },
            select: 'businessName',
        })
        .populate({
            path: 'categories',
            match: { categoryName: regex },
            select: 'categoryName',
        }).select("image offer rating name price originalPrice discount business")
            .sort(sort).skip(skip).limit(limit);

        // Filter out products where business or category match was null (populate match didn't hit)
        const filtered = products.filter(
        (p) => p.business !== null || (p.categories && p.categories.length > 0) || regex.test(p.name)
        );

        res.json(filtered);
    } catch (err) {
        res.status(500).json({ error: 'Failed to search products', details: err.message });
    }
};

export const getProductsByCategoryArray = async (req, res) => {
    try {
        const { gender, filterItems = {}, skip = 0, limit = 20 } = req.body;
        const filterQuery = buildFilterQuery(filterItems);
        const sort = getSortOption(filterItems?.SortBy?.[0]);

        const data = await WebsiteData.findOne({}, { "homeData": 1, _id: 0 });
        const selectedGenderData = data.homeData.find(item => item.gender === gender);
        let categoryIds;
        if (selectedGenderData) {
            categoryIds = selectedGenderData.data.trendingCategories.map(element => element.category);
            // console.log(gender);
        } 
        // else {
        //     console.log("Gender not found");
        // }
        const products = await Product.find({
        categories: { $in: categoryIds },
        ...filterQuery
        }).select("image offer rating name price originalPrice discount business")
            .populate("business", "businessName") // Fetches business name only
            .sort(sort).skip(skip).limit(limit);

        res.json(products);
    } catch (err) {
        res.status(500).json({ error: 'Failed to filter by category array', details: err.message });
    }
};

// controllers/productFilterController.js
export const getProductsByAllCategories = async (req, res) => {
    try {
        console.log("req.body",req.body);
        const { filterItems = {}, skip = 0, limit = 20 } = req.body;
        const filterQuery = buildFilterQuery(filterItems);
        const sort = getSortOption(filterItems?.SortBy?.[0]);

        const products = await Product.find({
        ...filterQuery
        }).select("image offer rating name price originalPrice discount business")
            .populate("business", "businessName") // Fetches business name only
            .sort(sort).skip(skip).limit(limit);

        res.json(products);
    } catch (err) {
        res.status(500).json({ error: 'Failed to filter all category products', details: err.message });
    }
};



