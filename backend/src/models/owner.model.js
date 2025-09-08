import mongoose from "mongoose";

const ownerSchema = new mongoose.Schema({
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
    role: {
        type: String,
        default: "owner",
    },
    phoneNumber: {
        type: String,
    },
    gender: {
        type: String,
        enum: ["male", "female", "other"],
    },
    dateOfBirth: {
        day: Number,
        month: Number,
        year: Number,
    },
    createdAt: {
        type: Date,
        default: Date.now,
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
}, { timestamps: true });

const Owner = mongoose.model("Owner", ownerSchema);
export default Owner;
