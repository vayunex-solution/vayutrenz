import mongoose from "mongoose";

const creditSchema = new mongoose.Schema({
    creditType: String,
    expireDate: String,
    receivedDate: String,
}, { _id: false });

const cashSchema = new mongoose.Schema({
    cashReceivedType: String,
    receivedDate: String,
}, { _id: false });

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: true,
        },
        picture: {
            type: String,
        },
        loginProvider: {
            type: String,
            enum: ["google-oauth2", "facebook", "apple", "windowslive", "email", "unknown"],
            default: "unknown",
        },
        phoneNumber: {
            type: String,
        },
        gender: {
            type: String,
            enum: ["male", "female", "other"],
        },
        role: {
            type: String,
            default: "user",
        },
        dateOfBirth: {
            day: Number,
            month: Number,
            year: Number, // Format: dd-mm-yyyy
        },
        addresses: [
            {
                firstName: { type: String },
                lastName: { type: String },
                mobile: { type: String },
                country: { type: String, },
                pinCode: { type: String },
                city: { type: String },
                state: { type: String },
                street: { type: String },   // building/street name
                area: { type: String },     // locality
                landmark: { type: String },
                addressType: {
                type: String,
                enum: ["Home", "Office", "Other"],
                default: "Other",
                },
            }
            ],
        wishlist: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
        ],
        cart: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                quantity: {
                    type: Number,
                    default: 1,
                },
                selectedSize: String,
                selectedColor: String,
            },
        ],
        orders: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Order",
            }
        ],
        payment: [
            {
                paymentDate: String,
                paymentAmount: Number,
            },
        ],
        wallet: {
            credit: {
                totalCredit: Number,
                description: String,
                transactions: [creditSchema],
            },
            cash: {
                totalCash: Number,
                description: String,
                transactions: [cashSchema],
            },
        },
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
