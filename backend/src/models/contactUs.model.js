import mongoose from 'mongoose';

const ContactUsSchema = new mongoose.Schema({
    helpData: [
        {
            mainHeading: { type: String, required: true },
            subHeadings: [
                {
                    title: { type: String, required: true },
                    details: [String], // List of strings per sub-heading
                },
            ],
        },
    ],
    addressDetails: {
        companyName: { type: String },
        country: { type: String, },
        pinCode: { type: String },
        city: { type: String },
        state: { type: String },
        street: { type: String },   // building/street name
        area: { type: String },     // locality
        landmark: { type: String },
        contactLines: [
            {
                startingLine: String,
                highlightLine: String,
                endingLine: String,
            },
        ],
        
    },
    });

const ContactUs = mongoose.model('ContactUs', ContactUsSchema);
export default ContactUs;
