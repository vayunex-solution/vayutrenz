import express from 'express';
import {
    editAboutUsContent,
    getAboutUsData,
    getContactUsData,
    insertAddressDetails,
    insertHelpingDetails,
    updateAboutUsMiddleData,
    updateFooterHighlights,
    getPrivacyPolicyData,
    insertPrivacyPolicyData,
} from '../controllers/contactUs.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

//// contactUs routes ////
router.get('/data', getContactUsData);
router.post('/insert/help-data', protectRoute, insertHelpingDetails);
router.post('/insert/address-details', protectRoute, insertAddressDetails);

//// aboutUs routes ////
router.get('/about-us', getAboutUsData);
router.put('/about-us/content', protectRoute, editAboutUsContent);
router.put('/about-us/middle', protectRoute, updateAboutUsMiddleData);
router.put('/about-us/footer', protectRoute, updateFooterHighlights);

//// PrivacyPolicy ////
router.get("/privacy-policy/get", getPrivacyPolicyData);
router.post("/privacy-policy/insert", protectRoute, insertPrivacyPolicyData);



export default router;
