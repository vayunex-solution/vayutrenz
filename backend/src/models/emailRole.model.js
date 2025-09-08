import mongoose from "mongoose";

const emailRoleSchema = new mongoose.Schema({
    emails: [
        {
            email: {
                type: String,
                required: true,
                lowercase: true,
                trim: true,
            },
            role: {
                type: String,
                enum: ["owner", "seller"],
                required: true,
            },
        }
    ]
}, { timestamps: true });

const EmailRole = mongoose.model("EmailRole", emailRoleSchema);

export default EmailRole;
