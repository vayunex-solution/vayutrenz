import express from "express";
import mongoose from "mongoose";

// ─── Schema ────────────────────────────────────────────────
const websiteSchema = new mongoose.Schema({
    // NAVBAR DATA
    logoImage: String,
    logoText: String,
    applicationName: String,
    topNavItems: [
        {
            name: { type: String, required: true },
            route: { type: String, }
        }
    ],
    bottomNavItems: [
        {
            name: { type: String, required: true },
            route: { type: String, required: true }
        }
    ],

    // HOME PAGE DATA
    homeData: [{
        gender: {
            type: String,
            enum: ["male", "female"],
        },
        data: {
            headerImage: String,
            headerText: String,
            productSlider: [{         // array of categories
                type: mongoose.Schema.Types.ObjectId,
                ref: "Category",
            }],
            trendingCategories: [{
                image: String,
                category: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Category",
                },
            }],
            imageSlider: [
                {
                    image: String,
                    route: String,
                }
            ],
            advertisementPanel: [
                {
                    image: String,
                    route: String,
                    offerEndDate: Date,
                },
            ],
        },
    }],
    socialMediaLinks: {
        type: {
            facebook: { type: String, default: "" },
            instagram: { type: String, default: "" },
            twitter: { type: String, default: "" },
            snapchat: { type: String, default: "" },
            youtube: { type: String, default: "" },
        },
    },
}, { timestamps: true });

const WebsiteData = mongoose.model("WebsiteData", websiteSchema);

export default WebsiteData;