import express from "express";
const router = express.Router();
import {
    getNavBar,
    updateLogo,
    updateTopNav,
    updateBottomNav,
    getHomeData,  /////homeSection
    insertHomeData,
    // updateHomeHeader,
    // insertMaleHeaderData,
    // insertFemaleHeaderData,
    // insertMaleProductSliderData,
    // insertFemaleProductSliderData,
    // insertMaleTrendingCategoriesData,
    // insertFemaleTrendingCategoriesData,
    insertMaleImageSliderData,
    insertFemaleImageSliderData,
    insertMaleAdvertisementPanelData,
    insertFemaleAdvertisementPanelData,
    updateHomeHeader,
    insertProductSliderData,
    insertTrendingCategoriesData,
    insertImageSliderData,
    insertAdvertisementPanelData,
    getSocialMediaLinks,
    updateSocialMediaLinks,
} from '../controllers/web.controller.js'

// Nav Routes
router.get("/navbar", getNavBar);
router.put("/navbar/logo", updateLogo);
router.put("/navbar/top", updateTopNav);
router.put("/navbar/bottom", updateBottomNav);

// Home Routes
router.get("/get/home-data", getHomeData);
router.post("/insert/home-data", insertHomeData);

router.put('/home/header/:gender', updateHomeHeader);
router.put('/home/product-slider/:gender', insertProductSliderData);
router.put('/home/trending-categories/:gender', insertTrendingCategoriesData);
router.put('/home/image-slider/:gender', insertImageSliderData);
router.put('/home/advertisement-panel/:gender', insertAdvertisementPanelData);


// GET social media links
router.get("/social-media", getSocialMediaLinks);

// PUT or POST to update links
router.put("/social-media", updateSocialMediaLinks);


export default router;
