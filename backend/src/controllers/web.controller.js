import WebsiteData from "../models/web.model.js ";
// ─── Controllers ────────────────────────────────────────────

// Initialize default document if not present
const getOrCreateWebsiteDoc = async () => {
    let doc = await WebsiteData.findOne();
    if (!doc) doc = await WebsiteData.create({});
    return doc;
};

// ─── Nav Controllers ─
export const getNavBar = async (req, res) => {
    try {
        const data = await getOrCreateWebsiteDoc();
        const { logoImage, logoText, topNavItems, bottomNavItems } = data;
        res.json({ logoImage, logoText, topNavItems, bottomNavItems });
    } catch (err) {
        res.status(500).json({ message: "Failed to get navbar data" });
    }
};

export const updateLogo = async (req, res) => {
    try {
        const doc = await getOrCreateWebsiteDoc();
        const { logoImage, logoText, applicationName } = req.body;
        if (logoImage) doc.logoImage = logoImage;
        if (logoText) doc.logoText = logoText;
        if (applicationName) doc.applicationName = applicationName;
        await doc.save();
        console.log(doc);
        res.json({ logoImage: doc.logoImage, logoText: doc.logoText });
    } catch (err) {
        res.status(500).json({ message: "Failed to update logo" });
    }
};

export const updateTopNav = async (req, res) => {
    try {
        const doc = await getOrCreateWebsiteDoc();
        doc.topNavItems = req.body.topNavItems || [];
        await doc.save();
        res.json({ topNavItems: doc.topNavItems });
    } catch (err) {
        res.status(500).json({ message: "Failed to update top nav" });
    }
};

export const updateBottomNav = async (req, res) => {
    try {
        const doc = await getOrCreateWebsiteDoc();
        doc.bottomNavItems = req.body.bottomNavItems || [];
        await doc.save();
        res.json({ bottomNavItems: doc.bottomNavItems });
    } catch (err) {
        res.status(500).json({ message: "Failed to update bottom nav" });
    }
};

// ─── Home Controllers ─
// ─── GET Home Data ────────────────────────────────────────────────
export const getHomeData = async (req, res) => {
    try {
        // const website = await WebsiteData.findOne().populate("homeData.data.productSlider").populate("homeData.data.trendingCategories.category");
        const website = await WebsiteData.findOne()
        if (!website) return res.status(404).json({ message: "Website data not found" });
        res.json({ homeData: website.homeData });
    } catch (err) {
        res.status(500).json({ message: "Error fetching home data", error: err.message });
    }
};

// ─── INSERT/UPDATE Home Data ─────────────────────────────────────
export const insertHomeData = async (req, res) => {
    try {
        const { homeData } = req.body;
        console.log(req.body);
        let website = await WebsiteData.findOne();

        if (!website) {
            website = new WebsiteData({ homeData });
        } else {
            website.homeData = homeData;
        }

        await website.save();
        res.json({ message: "Home data saved successfully", homeData: website.homeData });
    } catch (err) {
        res.status(500).json({ message: "Error saving home data", error: err.message });
    }
};


const updateSection = async (req, res, gender) => {
    // const { gender } = req.params;
    const payload = req.body;

    console.log("gender =", gender, "updated data =", payload);

    try {
        let siteData = await WebsiteData.findOne();
        if (!siteData) {
            siteData = await WebsiteData.create({ homeData: [] });
        }

        const genderIndex = siteData.homeData.findIndex(d => d.gender === gender);

        if (genderIndex === -1) {
            siteData.homeData.push({ gender, data: payload });
        } else {
            siteData.homeData[genderIndex].data = payload;
        }

        await siteData.save();
        console.log(siteData);
        res.json(siteData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Failed to update home data for ${gender}` });
    }
};

// Export separate handlers if needed
export const insertMaleHeaderData = (req, res) => updateSection(req, res, "male");
export const insertFemaleHeaderData = (req, res) => updateSection(req, res, "female");

export const insertMaleProductSliderData = (req, res) => updateSection(req, res, "male");
export const insertFemaleProductSliderData = (req, res) => updateSection(req, res, "female");

export const insertMaleTrendingCategoriesData = (req, res) => updateSection(req, res, "male");
export const insertFemaleTrendingCategoriesData = (req, res) => updateSection(req, res, "female");

export const insertMaleImageSliderData = (req, res) => updateSection(req, res, "male");
export const insertFemaleImageSliderData = (req, res) => updateSection(req, res, "female");

export const insertMaleAdvertisementPanelData = (req, res) => updateSection(req, res, "male");
export const insertFemaleAdvertisementPanelData = (req, res) => updateSection(req, res, "female");


export const updateHomeHeader = async (req, res) => {
    const { gender } = req.params;
    const { headerText, headerImage } = req.body.data;
    console.log(gender, req.body);

    if (!["male", "female"].includes(gender)) {
        return res.status(400).json({ error: "Invalid gender parameter. Must be 'male' or 'female'." });
    }

    try {
        // Get the existing WebsiteData document
        let website = await WebsiteData.findOne();

        // Create one if it doesn't exist
        if (!website) {
            website = new WebsiteData({
                homeData: [
                    {
                        gender,
                        data: { headerText, headerImage }
                    }
                ]
            })
        } else {
            // Check if gender-specific data exists in homeData
            const index = website.homeData.findIndex(item => item.gender === gender);

            if (index !== -1) {
                // Update existing gender data
                website.homeData[index].data.headerText = headerText;
                website.homeData[index].data.headerImage = headerImage;
            } else {
                // Add new gender data
                website.homeData.push({
                    gender,
                    data: { headerText, headerImage }
                });
            }
        }

        await website.save();
        res.status(200).json({ message: "Home header updated successfully", data: website.homeData });
    } catch (err) {
        console.error("Error updating home header:", err);
        res.status(500).json({ error: "Server error while updating home header" });
    }
};


export const insertProductSliderData = async (req, res) => {
    const { gender } = req.params;
    const productSlider = req.body.data; // expecting an array of ObjectIds

    if (!["male", "female"].includes(gender)) {
        return res.status(400).json({ error: "Invalid gender parameter. Must be 'male' or 'female'." });
    }

    if (!Array.isArray(productSlider) || productSlider.length === 0) {
        return res.status(400).json({ error: "productSlider must be a non-empty array of category IDs." });
    }

    try {
        let website = await WebsiteData.findOne();

        // Step 1: If no WebsiteData exists, create one
        if (!website) {
            website = new WebsiteData({
                homeData: [
                    {
                        gender,
                        data: {
                            productSlider
                        }
                    }
                ]
            });
        } else {
            // Step 2: Check if homeData for the given gender exists
            let genderData = website.homeData.find(item => item.gender === gender);

            if (!genderData) {
                // Step 3: If not, push new gender-specific homeData
                website.homeData.push({
                    gender,
                    data: {
                        productSlider
                    }
                });
            } else {
                // Step 4: If genderData exists, ensure 'data' object is initialized
                if (!genderData.data) {
                    genderData.data = {};
                }

                // Step 5: Replace productSlider with new one
                genderData.data.productSlider = productSlider;
            }
        }

        await website.save();

        const updatedSlider = website.homeData.find(item => item.gender === gender)?.data?.productSlider;

        res.status(200).json({
            message: "Product slider data updated successfully",
            productSlider: updatedSlider,
        });

    } catch (err) {
        console.error("Error updating product slider:", err);
        res.status(500).json({ error: "Server error while updating product slider" });
    }
};

export const insertTrendingCategoriesData = async (req, res) => {
    const { gender } = req.params;
    // console.log("req.body",req.body);
    const trendingCategories = req.body.data; // expecting array of { image, category }

    if (!["male", "female"].includes(gender)) {
        return res.status(400).json({ error: "Invalid gender parameter. Must be 'male' or 'female'." });
    }

    if (!Array.isArray(trendingCategories) || trendingCategories.length === 0) {
        return res.status(400).json({ error: "trendingCategories must be a non-empty array." });
    }

    try {
        let website = await WebsiteData.findOne();

        // Step 1: If no WebsiteData exists, create new with trendingCategories
        if (!website) {
            website = new WebsiteData({
                homeData: [
                    {
                        gender,
                        data: {
                            trendingCategories
                        }
                    }
                ]
            });
        } else {
            // Step 2: Find existing gender-specific homeData
            let genderData = website.homeData.find(item => item.gender === gender);

            if (!genderData) {
                // Step 3: If gender-specific entry not found, create it
                website.homeData.push({
                    gender,
                    data: {
                        trendingCategories
                    }
                });
            } else {
                // Step 4: Ensure data object exists
                if (!genderData.data) {
                    genderData.data = {};
                }

                // Step 5: Replace old trendingCategories with new
                genderData.data.trendingCategories = trendingCategories;
            }
        }

        await website.save();

        const updatedTrending = website.homeData.find(item => item.gender === gender)?.data?.trendingCategories;

        res.status(200).json({
            message: "Trending categories updated successfully",
            trendingCategories: updatedTrending,
        });

    } catch (err) {
        console.error("Error updating trending categories:", err);
        res.status(500).json({ error: "Server error while updating trending categories" });
    }
};

export const insertImageSliderData = async (req, res) => {
    const { gender } = req.params;
    // console.log("req.body",req.body);
    const imageSlider = req.body.data; // expecting an array of { image, route }

    if (!["male", "female"].includes(gender)) {
        return res.status(400).json({ error: "Invalid gender parameter. Must be 'male' or 'female'." });
    }

    if (!Array.isArray(imageSlider) || imageSlider.length === 0) {
        return res.status(400).json({ error: "imageSlider must be a non-empty array." });
    }

    try {
        let website = await WebsiteData.findOne();

        // Step 1: If WebsiteData does not exist, create with imageSlider
        if (!website) {
            website = new WebsiteData({
                homeData: [
                    {
                        gender,
                        data: {
                            imageSlider,
                        }
                    }
                ]
            });
        } else {
            // Step 2: Check for gender-specific homeData
            let genderData = website.homeData.find(item => item.gender === gender);

            if (!genderData) {
                // Step 3: If not found, create gender block with imageSlider
                website.homeData.push({
                    gender,
                    data: {
                        imageSlider,
                    }
                });
            } else {
                // Step 4: Ensure `data` exists
                if (!genderData.data) {
                    genderData.data = {};
                }

                // Step 5: Replace imageSlider with the new one
                genderData.data.imageSlider = imageSlider;
            }
        }

        await website.save();

        const updatedSlider = website.homeData.find(item => item.gender === gender)?.data?.imageSlider;

        res.status(200).json({
            message: "Image slider updated successfully",
            imageSlider: updatedSlider,
        });

    } catch (err) {
        console.error("Error updating image slider:", err);
        res.status(500).json({ error: "Server error while updating image slider" });
    }
};

export const insertAdvertisementPanelData = async (req, res) => {
    const { gender } = req.params;
    // console.log("req.body", req.body);
    const advertisementPanel = req.body.data; // expecting an array of { image, route, offerEndDate }

    if (!["male", "female"].includes(gender)) {
        return res.status(400).json({ error: "Invalid gender parameter. Must be 'male' or 'female'." });
    }

    if (!Array.isArray(advertisementPanel) || advertisementPanel.length === 0) {
        return res.status(400).json({ error: "advertisementPanel must be a non-empty array." });
    }

    try {
        let website = await WebsiteData.findOne();

        // Step 1: Create WebsiteData if it doesn't exist
        if (!website) {
            website = new WebsiteData({
                homeData: [
                    {
                        gender,
                        data: {
                            advertisementPanel,
                        }
                    }
                ]
            });
        } else {
            // Step 2: Find gender-specific data
            let genderData = website.homeData.find(item => item.gender === gender);

            if (!genderData) {
                // Step 3: Add new gender-specific entry
                website.homeData.push({
                    gender,
                    data: {
                        advertisementPanel,
                    }
                });
            } else {
                // Step 4: Ensure data exists
                if (!genderData.data) {
                    genderData.data = {};
                }

                // Step 5: Replace advertisementPanel with new array
                genderData.data.advertisementPanel = advertisementPanel;
            }
        }

        await website.save();

        const updatedAds = website.homeData.find(item => item.gender === gender)?.data?.advertisementPanel;

        res.status(200).json({
            message: "Advertisement panel updated successfully",
            advertisementPanel: updatedAds,
        });

    } catch (err) {
        console.error("Error updating advertisement panel:", err);
        res.status(500).json({ error: "Server error while updating advertisement panel" });
    }
};


export const getSocialMediaLinks = async (req, res) => {
    try {
        const websiteData = await WebsiteData.findOne(); // Assuming single site data
        if (!websiteData) return res.status(404).json({ message: "Website data not found" });

        // console.log("websiteData",websiteData.socialMediaLinks);
        res.status(200).json(websiteData.socialMediaLinks || {});
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── INSERT / UPDATE socialMediaLinks ─────────────────────
export const updateSocialMediaLinks = async (req, res) => {
    try {
        const {
            facebook = "",
            instagram = "",
            twitter = "",
            snapchat = "",
            youtube = ""
        } = req.body;
        // console.log("req.body",req.body);

        let websiteData = await WebsiteData.findOne();

        if (!websiteData) {
            // create new document if it doesn't exist
            websiteData = new WebsiteData({
                socialMediaLinks: { facebook, instagram, twitter, snapchat, youtube }
            });
        } else {
            // update only social media section
            websiteData.socialMediaLinks = { facebook, instagram, twitter, snapchat, youtube };
        }

        const updated = await websiteData.save();
        res.status(200).json(updated.socialMediaLinks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
