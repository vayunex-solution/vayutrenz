import mongoose from "mongoose";

const keyHighlightSchema = new mongoose.Schema({
    title: { type: String, required: true },
    value: { type: String, required: true },
}, { _id: false });

const productRatingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
    },
    comment: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
}, {timestamps: true,}, { _id: false });

const productSchema = new mongoose.Schema({
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business", // From BusinessSchema
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    originalPrice: {
        type: Number,
        required: true,
    },
    image:{
        type:String,
        required: false,
    },
    moreImages: {
        type: [String], // Array of image URLs or filenames
    },
    gender: {
        type: String,
        enum: ["male", "female", "unisex"],
    },
    discount: {
        type: Number,
        required: true,
    },
    rating: {
        type: Number,
        default: 0,
    },
    reviews: {
        type: Number,
        default: 0,
    },
    colors: [
        {
            type: String, // hex color or name
        },
    ],
    selectedColor: {
        type: String,
        default: "Color",
    },
    sizes: [
        {
            type: String,
        },
    ],
    outOfStockSize: {
        type: String,
    },
    lowStockSize: {
        type: String,
    },
    offer: {type: String},
    offerDetails:{
        productNumber:{type:Number},
        comboPrice:{type:Number},
    },
    keyHighlights: [
        {
            title:{type:String},
            value: {type:String}
        }
    ],
    likes: [{
        type:mongoose.Schema.Types.ObjectId, // user IDs who liked the product
        ref:'User'
    }],
    likeNumbers:{
        type:Number,
        default:0,
    },
    productDescription: {
        type: String,
    },
    categories: [{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
    }],
    productRatings: [productRatingSchema],
}, {
    timestamps: true,
});

const Product = mongoose.model("Product", productSchema);

export default Product;