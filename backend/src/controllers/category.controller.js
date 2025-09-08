import Category from "../models/category.model.js";

export const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        const grouped = {};

        categories.forEach((cat) => {
            if (!grouped[cat.categoryType]) grouped[cat.categoryType] = [];
            grouped[cat.categoryType].push(cat);
        });

        res.status(200).json(grouped); // preferred structure: {categoryType1: [...], categoryType2: [...]}
    } catch (err) {
        res.status(500).json({ message: "Error fetching categories", error: err.message });
    }
};

export const createCategory = async (req, res) => {
    try {
        if (req.userRole !== "owner" && req.userRole !== "seller") {
            return res.status(403).json({ message: "You are not authorized to create categories" });
        }
        const category = await Category.create(req.body);
        res.status(201).json(category);
    } catch (err) {
        res.status(400).json({ message: "Category creation failed", error: err.message });
    }
};


// Edit category by ID
export const updateCategory = async (req, res) => {
    try {
        if (req.userRole !== "owner"){
            return res.status(403).json({ message: "You are not authorized to update categories" });
        }
        const { id } = req.params;
        // console.log("Updating category with ID:", id, "Data:", req.body);
        const updatedCategory = await Category.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!updatedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.json({ message: "Category updated", category: updatedCategory });
    } catch (err) {
        res.status(500).json({ message: "Error updating category", error: err.message });
    }
};

// Delete category by ID
export const deleteCategory = async (req, res) => {
    try {
        if (req.userRole !== "owner"){
            res.status(403).json({ message: "You are not authorized to delete categories" });
        }
        const { id } = req.params;
        // console.log("Deleting category with ID:", id);
        const deleted = await Category.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.json({ message: "Category deleted", category: deleted });
    } catch (err) {
        res.status(500).json({ message: "Error deleting category", error: err.message });
    }
};

