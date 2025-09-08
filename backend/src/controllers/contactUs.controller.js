import ContactUs from '../models/contactUs.model.js';
import AboutUs from '../models/aboutUs.model.js';
import PrivacyPolicy from "../models/privacyPolicy.model.js";


////ContactUs////
// GET ContactUs Data
export const getContactUsData = async (req, res) => {
    try {
        const data = await ContactUs.findOne();
        res.status(200).json({
            success: true,
            message: 'Contact Us data fetched successfully',
            helpData: data?.helpData || [],
            addressDetails: data?.addressDetails || {},
        });
    } catch (error) {
        console.error('Error fetching Contact Us data:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching data',
        });
    }
};

// INSERT or UPDATE helpData
export const insertHelpingDetails = async (req, res) => {
    try {
      if (req.userRole !== "owner") {
        return res.status(403).json({ message: "You are not authorized" });
      }
      // console.log(req.body);
        const helpData = req.body;

        if (!helpData || !Array.isArray(helpData)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid helpData format. Expected an array.',
            });
        }

        let data = await ContactUs.findOne();
        if (!data) {
            data = new ContactUs({ helpData, addressDetails: {} });
        } else {
            data.helpData = helpData;
        }

        await data.save();
        // console.log('data',data);

        res.status(200).json({
            success: true,
            message: 'Help details added/updated successfully',
            helpData: data.helpData,
        });
    } catch (error) {
        console.error('Error inserting help details:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while inserting help details',
        });
    }
};

export const insertAddressDetails = async (req, res) => {
    try {
        if (req.userRole !== "owner") {
        return res.status(403).json({ message: "You are not authorized" });
      }
        const addressDetails = req.body;

        if (!addressDetails || typeof addressDetails !== 'object') {
            return res.status(400).json({
                success: false,
                message: 'Invalid addressDetails format. Expected an object.',
            });
        }

        let data = await ContactUs.findOne();
        if (!data) {
            data = new ContactUs({ helpData: [], addressDetails });
        } else {
            data.addressDetails = addressDetails;
        }

        await data.save();
        // console.log("data",data)

        res.status(200).json({
            success: true,
            message: 'Address details added/updated successfully',
            addressDetails: data.addressDetails,
        });
    } catch (error) {
        console.error('Error inserting address details:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while inserting address details',
        });
    }
};


///AboutUs////
// GET complete about us data
export const getAboutUsData = async (req, res) => {
  try {
    // console.log("getting the aboutUsData");
    const data = await AboutUs.findOne();
    // console.log("data=",data);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching data" });
  }
};

// Update aboutUsContent
export const editAboutUsContent = async (req, res) => {
  try {
    if (req.userRole !== "owner") {
      return res.status(403).json({ message: "You are not authorized" });
    }
    const aboutUsContent = req.body.aboutUsContent;
    let data = await AboutUs.findOne();

    if (!data) {
      data = new AboutUs({ aboutUsContent }); // ✅ no need to pass empty required fields
    } else {
      data.aboutUsContent = aboutUsContent;
    }

    await data.save();
    // console.log("data=",data);
    res.status(200).json({ success: true, aboutUsContent: data.aboutUsContent });
  } catch (err) {
    console.error("Error updating AboutUs:", err);
    res.status(500).json({ success: false, message: "Failed to update AboutUs content" });
  }
};


// Update aboutUsMiddleData
export const updateAboutUsMiddleData = async (req, res) => {
  try {
    if (req.userRole !== "owner") {
      return res.status(403).json({ message: "You are not authorized" });
    }
    // console.log("edit middle the aboutUsData",req.body);
    const { aboutUsMiddleData } = req.body;
    let data = await AboutUs.findOne();
    if (!data) data = new AboutUs({ aboutUsMiddleData });
    else data.aboutUsMiddleData = aboutUsMiddleData;
    await data.save();
    // console.log("data=",data);
    res.status(200).json({ success: true, aboutUsMiddleData: data.aboutUsMiddleData });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update middle section" });
  }
};

// Update footer highlights
export const updateFooterHighlights = async (req, res) => {
  try {
    if (req.userRole !== "owner") {
      return res.status(403).json({ message: "You are not authorized" });
    }
    // console.log("edit footer the aboutUsData");
    const { footerHighlights } = req.body;
    let data = await AboutUs.findOne();
    if (!data) data = new AboutUs({ footerHighlights });
    else data.footerHighlights = footerHighlights;
    await data.save();

    // console.log("data.footerHighlights=");
    
    res.status(200).json({ success: true, footerHighlights: data.footerHighlights });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update footer highlights" });
  }
};


// Get privacy policy data
export const getPrivacyPolicyData = async (req, res) => {
  try {
    const data = await PrivacyPolicy.findOne();
    // console.log("data",data);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch", error: err.message });
  }
};

// Insert or update privacy policy
export const insertPrivacyPolicyData = async (req, res) => {
  try {
    if (req.userRole !== "owner") {
      return res.status(403).json({ message: "You are not authorized" });
    }
    const { sections } = req.body;
    // console.log("req.bocy",req.body);
    let updated;

    const existing = await PrivacyPolicy.findOne();
    if (existing) {
      existing.sections = sections;
      updated = await existing.save();
    } else {
      updated = await PrivacyPolicy.create({ sections });
    }

    // console.log("existing",existing);
    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to insert/update", error: err.message });
  }
};

