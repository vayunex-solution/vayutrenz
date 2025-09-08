import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        categoryImage: {
            type: String,
        },
        categoryName: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        categoryType:{
            type:String,
            required:true,
        },
        gender: {
            type: String,
            enum: ["men", "women", "unisex"],
            required: true,
        },
        description: {
            type: String,
            default: "",
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt
    }
);

const Category = mongoose.model("Category", categorySchema);

export default Category;
