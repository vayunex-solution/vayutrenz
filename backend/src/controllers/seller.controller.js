// controllers/seller.controller.js
import Seller from "../models/seller.model.js";
// import Order from "../models/order.model.js";
import Business from "../models/business.model.js";
import Product from "../models/product.model.js";
import Category from "../models/category.model.js";


export const getSeller = async (req, res) => {
    try {
        const seller = await Seller.findById(req.params.sellerId);
        res.status(200).json({ success: true, seller });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getOrdersDetails = async (req, res) => {
    try {
        const seller = await Seller.findById(req.params.sellerId).populate({
            path: "orders.order",
            populate: { path: "products.product" }
        });
        if (!seller) return res.status(404).json({ success: false, message: "Seller not found" });
        res.status(200).json({ success: true, orders: seller.orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};



// Get Business for a Seller
export const getBusiness = async (req, res) => {
    try {
        const seller = await Seller.findById(req.params.sellerId).populate("business");
        if (!seller) return res.status(404).json({ success: false, message: "Seller not found" });

        res.status(200).json({ success: true, business: seller.business });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Create Business
export const createBusiness = async (req, res) => {
    const {
        businessName,
        businessLogo,
        businessBanner,
        description,
        email,
        name,
        socialLinks,
        status,
        sellerId,
    } = req.body;

    try {

        let newBusiness = await Business.findOneAndUpdate(
            { sellerId }, // Find by sellerId
            {
                sellerId,
                email,
                name,
                businessName,
                businessLogo,
                businessBanner,
                description,
                socialLinks,
                status,
            },
            {
                new: true,      // return the updated document
                upsert: true,   // create if not exists
                setDefaultsOnInsert: true, // use schema defaults if inserting
            }
        );
        console.log("newBusiness.find", newBusiness);

        if (!newBusiness) {
            const newBusiness = new Business({
                sellerId,
                email,
                name,
                businessName,
                businessLogo,
                businessBanner,
                description,
                socialLinks,
                status
            });
            await newBusiness.save();
            console.log("newBusiness.save", newBusiness)

            // Link business to seller (assuming 1:1 mapping)
            let seller = await Seller.findByIdAndUpdate(newBusiness.sellerId, { business: newBusiness._id });

            // console.log("seller",seller);

        }

        res.status(201).json({ success: true, business: newBusiness });
    } catch (err) {
        console.log("error", err);
        res.status(500).json({ success: false, message: err.message });
    }
};


export const updatePaymentGatewayDetails = async (req, res) => {
    try {
        const updatedSeller = await Seller.findByIdAndUpdate(
            req.params.sellerId,
            { paymentGatewayDetails: req.body },
            { new: true }
        );
        res.status(200).json({ success: true, paymentGatewayDetails: updatedSeller.paymentGatewayDetails });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};








////// Fake Data /////
export const insertFakeProducts = async (req, res) => {
    console.log("insertFakeStart\n1\n1\n1\n1\n");
    try {
        const sellerId = "686c0bbdcea1beeabddbae02";
        const businessId = "686c317e96c0feed845bc85a";

        const categoryMap = {
            men: await Category.findOne({ categoryName: "T-Shirt" }),
            women: await Category.findOne({ categoryName: "Top" }),
            unisex: await Category.findOne({ categoryName: "Hoodie" }),
            summer: {
                tankTop: await Category.findOneAndUpdate({ categoryName: "Tank Top" }, { isActive: true }),
                linenShirt: await Category.findOneAndUpdate({ categoryName: "Linen Shirt" }, { isActive: true }),
                cropTop: await Category.findOneAndUpdate({ categoryName: "Crop Top" }, { isActive: true }),
                sunHat: await Category.findOneAndUpdate({ categoryName: "Sun Hat" }, { isActive: true })
            },
            winter: {
                sweater: await Category.findOneAndUpdate({ categoryName: "Sweater" }, { isActive: true }),
                overcoat: await Category.findOneAndUpdate({ categoryName: "Overcoat" }, { isActive: true }),
                woolenCap: await Category.findOneAndUpdate({ categoryName: "Woolen Cap" }, { isActive: true }),
                gloves: await Category.findOneAndUpdate({ categoryName: "Gloves" }, { isActive: true }),
                boots: await Category.findOneAndUpdate({ categoryName: "Boots" }, { isActive: true })
            }
        };

        const sharedImages = {
            main: "https://images.bewakoof.com/t1080/men-s-brown-beast-within-graphic-printed-oversized-t-shirt-620155-1741259239-1.jpg",
            others: [
                "https://images.bewakoof.com/t1080/men-s-brown-beast-within-graphic-printed-oversized-t-shirt-620155-1741259243-2.jpg",
                "https://images.bewakoof.com/t1080/men-s-brown-beast-within-graphic-printed-oversized-t-shirt-620155-1741259251-4.jpg",
                "https://images.bewakoof.com/t1080/men-s-brown-beast-within-graphic-printed-oversized-t-shirt-620155-1741259255-5.jpg"
            ]
        };

        const summerCats = Object.entries(categoryMap.summer);
        const winterCats = Object.entries(categoryMap.winter);
        const combinedCats = [...summerCats, ...winterCats];

        const products = Array.from({ length: 30 }, (_, i) => {
            const [key, categoryObj] = combinedCats[i % combinedCats.length];
            const name = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            const genderOptions = ["male", "female", "unisex"];
            const gender = genderOptions[i % 3];

            return {
                brand: businessId,
                name: `${name} Product ${i + 1}`,
                price: 599 + (i % 5) * 40,
                originalPrice: 1199 + (i % 3) * 100,
                discount: 40 + (i % 10),
                image: sharedImages.main,
                moreImages: sharedImages.others,
                gender,
                category: categoryObj?._id,
                colors: ["Maroon", "Grey", "Black"][i % 3],
                selectedColor: ["Maroon", "Grey", "Black"][i % 3],
                sizes: ["S", "M", "L", "XL"],
                outOfStockSize: ["L", "XL", "M"][i % 3],
                lowStockSize: ["S", "M", "L"][i % 3],
                offer: ["Summer Sale", "Winter Deal", "Flat 60% Off"][i % 3],
                keyHighlights: [
                    { title: "Fit", value: ["Slim", "Regular", "Loose"][i % 3] },
                    { title: "Season", value: i % 2 === 0 ? "Summer" : "Winter" }
                ],
                productDescription: `${name} - perfect for ${i % 2 === 0 ? "warm" : "cold"} weather with great comfort.`
            };
        });

        const inserted = await Product.insertMany(products);
        console.log("insertFakeEnd\n1\n1\n1\n1\n");
        res.status(201).json({ message: "30 seasonal products inserted", data: inserted });
    } catch (error) {
        res.status(500).json({ message: "Product insertion failed", error: error.message });
    }
};



// 📁 controllers/sellerProductController.js

export const getSellerProducts = async (req, res) => {
    try {
        const businessId = req.user.business;

        const products = await Product.find({ business: businessId })
            .select("image offer rating name price originalPrice discount likeNumbers business")
            .populate("business", "businessName") // Fetches business name only
            .sort({ createdAt: -1 })
            .lean();


        res.status(200).json(products);
    } catch (error) {
        console.error("Error in getSellerProducts:", error);
        res.status(500).json({ success: false, message: "Failed to fetch products" });
    }
};


/////Create Products/////
export const createOneProduct = async (req, res) => {
    try {
        const businessId = req.user.business;
        console.log("create-many");
        const product = new Product({ ...req.body, business: businessId });
        const saved = await product.save();
        console.log("create-one=", saved);
        res.status(201).json(saved);
    } catch (err) {
        console.log("err", err);
        res.status(500).json({ message: "Error creating product", error: err.message });
    }
};


export const createMultipleProduct = async (req, res) => {
    try {
        const businessId = req.user.business;
        const products = req.body;

        const processedProducts = [];

        for (const product of products) {
            const categoryNames = product.categories || []; // array of category names
            const categoryIds = [];

            for (const categoryName of categoryNames) {
                // Try to find category by name
                let category = await Category.findOne({ categoryName });

                if (!category) {
                    // If not found, create it
                    category = await Category.create({
                        categoryName,
                        categoryType: "default", // You can update default type logic
                        gender: product.gender || "unisex",
                        description: "",
                        isActive: true,
                    });
                }

                categoryIds.push(category._id);
            }

            processedProducts.push({
                ...product,
                business: businessId,
                categories: categoryIds,
            });
        }

        const created = await Product.insertMany(processedProducts);
        res.status(201).json(created);
    } catch (err) {
        console.error("Error uploading products:", err);
        res.status(500).json({ message: "Error uploading products", error: err.message });
    }
};


// Edit a Product
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Product.findByIdAndUpdate(id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: "Product not found" });
        res.status(200).json(updated);
    } catch (err) {
        res.status(500).json({ message: "Error updating product", error: err.message });
    }
};

// Delete a Product
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("deleteProduct", id);
        if (!id) return res.status(400).json({ message: "Product ID is required" });
        
        const deleted = await Product.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: "Product not found" });
        
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting product", error: err.message });
    }
};




