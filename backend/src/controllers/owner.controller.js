import Owner from "../models/owner.model.js";
import Category from "../models/category.model.js";


const initialCategories = [
    // 👕 Men's Fashion (categoryType = "men")
    { categoryName: "T-Shirt", categoryType: "men", gender: ["men"] },
    { categoryName: "Jeans", categoryType: "men", gender: ["men"] },
    { categoryName: "Shorts", categoryType: "men", gender: ["men"] },
    { categoryName: "Vest", categoryType: "men", gender: ["men"] },
    { categoryName: "Shirt", categoryType: "men", gender: ["men"] },
    { categoryName: "Boxer", categoryType: "men", gender: ["men"] },
    { categoryName: "Pant", categoryType: "men", gender: ["men"] },
    { categoryName: "Track Pant", categoryType: "men", gender: ["men"] },
    { categoryName: "Joggers", categoryType: "men", gender: ["men"] },

    // 👗 Women's Fashion (categoryType = "women")
    { categoryName: "Dress", categoryType: "women", gender: ["women"] },
    { categoryName: "Sling Bag", categoryType: "Other", gender: ["women"] },
    { categoryName: "Bodysuit", categoryType: "women", gender: ["women"] },
    { categoryName: "Pyjama", categoryType: "women", gender: ["women"] },
    { categoryName: "Top", categoryType: "women", gender: ["women"] },
    { categoryName: "Kurti", categoryType: "women", gender: ["women"] },
    { categoryName: "Saree", categoryType: "women", gender: ["women"] },
    { categoryName: "Lehenga", categoryType: "women", gender: ["women"] },
    { categoryName: "Skirt", categoryType: "women", gender: ["women"] },
    { categoryName: "Jumpsuit", categoryType: "women", gender: ["women"] },
    { categoryName: "Shrug", categoryType: "women", gender: ["women"] },

    // 🧢 Unisex / Gender-Neutral (categoryType = "unisex")
    { categoryName: "Hoodie", categoryType: "unisex", gender: ["unisex"] },
    { categoryName: "Sweatshirt", categoryType: "unisex", gender: ["unisex"] },
    { categoryName: "Denim Jacket", categoryType: "unisex", gender: ["unisex"] },
    { categoryName: "Bomber Jacket", categoryType: "unisex", gender: ["unisex"] },
    { categoryName: "Graphic Tee", categoryType: "unisex", gender: ["unisex"] },
    { categoryName: "Flannel Shirt", categoryType: "unisex", gender: ["unisex"] },
    { categoryName: "Raincoat", categoryType: "unisex", gender: ["unisex"] },
    
    { categoryName: "Cap", categoryType: "Other", gender: ["unisex"] },
    { categoryName: "Beanie", categoryType: "Other", gender: ["unisex"] },
    { categoryName: "Sneakers", categoryType: "Other", gender: ["unisex"] },
    { categoryName: "Sliders", categoryType: "Other", gender: ["unisex"] },
    { categoryName: "Backpack", categoryType: "Other", gender: ["unisex"] },

    // 🌞 Summer Fashion (categoryType = "summer")
    { categoryName: "Tank Top", categoryType: "summer", gender: ["unisex"] },
    { categoryName: "Linen Shirt", categoryType: "summer", gender: ["men", "women"] },
    { categoryName: "Crop Top", categoryType: "summer", gender: ["women"] },
    { categoryName: "Sun Hat", categoryType: "Other", gender: ["unisex"] },

    // ❄️ Winter Fashion (categoryType = "winter")
    { categoryName: "Sweater", categoryType: "winter", gender: ["unisex"] },
    { categoryName: "Overcoat", categoryType: "winter", gender: ["unisex"] },
    { categoryName: "Woolen Cap", categoryType: "Other", gender: ["unisex"] },
    { categoryName: "Gloves", categoryType: "Other", gender: ["unisex"] },
    { categoryName: "Boots", categoryType: "Other", gender: ["unisex"] },
];



// POST /login
export const loginOwner = async (req, res) => {
    try {
        const { email, fullName, picture, loginProvider, role, phoneNumber, gender, dateOfBirth } = req.body;

        let owner = await Owner.findOne({ email });

        if (!owner) {
            owner = new Owner({
                email,
                fullName,
                picture,
                loginProvider,
                role,
                phoneNumber,
                gender,
                dateOfBirth,
            });
            await owner.save();
        }

        res.status(200).json(owner);
    } catch (error) {
        res.status(500).json({ message: "Login failed", error: error.message });
    }
};

// DELETE /:id
export const deleteOwner = async (req, res) => {
    try {
        const { id } = req.params;
        const owner = await Owner.findByIdAndDelete(id);

        if (!owner) return res.status(404).json({ message: "Owner not found" });

        res.status(200).json({ message: "Owner deleted", owner });
    } catch (error) {
        res.status(500).json({ message: "Error deleting owner", error: error.message });
    }
};

// DELETE /
export const deleteAllOwners = async (req, res) => {
    try {
        await Owner.deleteMany({});
        res.status(200).json({ message: "All owners deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting all owners", error: error.message });
    }
};

// GET /:id
export const getOwner = async (req, res) => {
    try {
        const { id } = req.params;
        const owner = await Owner.findById(id);

        if (!owner) return res.status(404).json({ message: "Owner not found" });

        res.status(200).json(owner);
    } catch (error) {
        res.status(500).json({ message: "Error fetching owner", error: error.message });
    }
};

// GET /
export const getAllOwners = async (req, res) => {
    try {
        const owners = await Owner.find();
        res.status(200).json(owners);
    } catch (error) {
        res.status(500).json({ message: "Error fetching owners", error: error.message });
    }
};

// PUT /:id
export const updateOwnerDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedOwner = await Owner.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        });

        if (!updatedOwner) return res.status(404).json({ message: "Owner not found" });

        res.status(200).json(updatedOwner);
    } catch (error) {
        res.status(500).json({ message: "Error updating owner", error: error.message });
    }
};


////////// Category /////////
export const deleteCategoryById = async (req, res) => {
    try {
        const { categoryId } = req.body;
        const deleted = await Category.findByIdAndDelete(categoryId);
        if (!deleted) return res.status(404).json({ message: "Category not found" });
        res.json({ message: "Deleted successfully", data: deleted });
    } catch (error) {
        res.status(500).json({ message: "Delete failed", error: error.message });
    }
};

export const deleteCategoryByName = async (req, res) => {
    try {
        const { categoryName } = req.body;
        const deleted = await Category.findOneAndDelete({ categoryName });
        if (!deleted) return res.status(404).json({ message: "Category not found" });
        res.json({ message: "Deleted successfully", data: deleted });
    } catch (error) {
        res.status(500).json({ message: "Delete failed", error: error.message });
    }
};

export const insertCategories = async (req, res) => {
    try {
        const categoriesToInsert = [];
        
        for (const category of initialCategories) {
            const exists = await Category.findOne({ categoryName: category.categoryName });
            if (!exists) {
                categoriesToInsert.push(category);
            }
        }
        
        if (categoriesToInsert.length === 0) {
            return res.status(200).json({ message: "All categories already exist" });
        }
        
        const inserted = await Category.insertMany(categoriesToInsert);
        console.log("insertMany");
        res.status(201).json({ message: "New categories inserted", data: inserted });
        
    } catch (error) {
        res.status(500).json({ message: "Insertion failed", error: error.message });
    }
};



export const createCategory = async (req, res) => {
    try {
        const {
            categoryName,
            categoryType,
            gender,
            categoryImage,
            description,
            isActive
        } = req.body;

        if (!categoryName || !gender) {
            return res.status(400).json({ message: "categoryName and gender are required." });
        }

        const existingCategory = await Category.findOne({ categoryName });

        if (existingCategory) {
            const updated = await Category.findOneAndUpdate(
                { categoryName },
                {
                    categoryType,
                    gender,
                    categoryImage,
                    description,
                    isActive
                },
                { new: true } // return the updated document
            );
            return res.status(200).json({ message: "Category updated", data: updated });
        }

        const newCategory = new Category({
            categoryName,
            categoryType,
            gender,
            categoryImage,
            description,
            isActive
        });

        const saved = await newCategory.save();
        res.status(201).json({ message: "Category created", data: saved });

    } catch (error) {
        res.status(500).json({ message: "Creation/Update failed", error: error.message });
    }
};



