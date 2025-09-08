import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    country: String,
    state: String,
    city: String,
    street: String,
    buildingNumber: String,
    houseNumber: String,
    zipCode: String,
}, { _id: false });

const paymentGatewaySchema = new mongoose.Schema({
    razorpayMerchantId: String,
    razorpayKeyId: String,
    razorpayKeySecret: String,
    accountVerified: {
        type: Boolean,
        default: false,
    },
}, { _id: false });

const sellerSchema = new mongoose.Schema({
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
        type:String,
    },
    role: {
        type: String,
        default: "seller",
    },
    gender: {
        type: String,
        enum: ["male", "female", "other"],
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

    orders: [
        {
            order: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Order",
            },
            paymentReceived: {
                type: Boolean,
                default: false,
            },
        },
    ],

    paymentGatewayDetails: paymentGatewaySchema,

    business:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business",
    },
}, { timestamps: true });

const Seller = mongoose.model("Seller", sellerSchema);
export default Seller;
