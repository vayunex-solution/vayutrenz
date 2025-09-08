import mongoose from "mongoose";

const aboutUsContentSchema = new mongoose.Schema({
    mainHeading: { type: String, required: true },
    subHeading: { type: String, required: true },
    image: { type: String, required: true }, // Store image URL or path
    details: { type: String, required: true },
});

const aboutUsMiddleSchema = new mongoose.Schema({
    mainHeading: { type: String, required: true },
    bannerImage: { type: String, required: true },
    subHeading: { type: String, required: true },
    details: { type: String, required: true },
});

const footerHighlightSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
});

const aboutUsSchema = new mongoose.Schema(
    {
        aboutUsContent: [aboutUsContentSchema],
        aboutUsMiddleData: aboutUsMiddleSchema,
        footerHighlights: {
            footerHeading: String,
            details: [footerHighlightSchema],
        }
    },
    { timestamps: true } // ✅ Move timestamps here
);

const AboutUs = mongoose.model("AboutUs", aboutUsSchema);

export default AboutUs;
