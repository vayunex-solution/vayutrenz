import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema({
    subHeading: { type: String },
    paragraphs: [{ type: String }],
    points: [{ type: String }],
});

const privacyPolicySchema = new mongoose.Schema({
    sections: [sectionSchema],
}, { timestamps: true });

export default mongoose.model("PrivacyPolicy", privacyPolicySchema);
