import { create } from "zustand";
import { axiosInstance } from "../../lib/axios.js";
import { toast } from "react-hot-toast";

export const useWebContactUsStore = create((set) => ({

    contactUsData: null,
    isLoading: false,
    aboutUsData: {},

    // ✅ GET contact us data
    getContactUsData: async () => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.get('/contact-us/data');
            // set({ contactUsData: res.data });
            return res.data;
        } catch (err) {
            console.error('Fetch contact us data failed:', err);
            toast.error('Failed to load contact data');
        } finally {
            set({ isLoading: false });
        }
    },

    // ✅ INSERT a new main heading with sub-headings
    insertHelpingDetails: async (payload) => {
        try {
            const res = await axiosInstance.post('/contact-us/insert/help-data', payload);
            toast.success('Helping section added');
            // get().getContactUsData();
            return res.data;
        } catch (err) {
            console.error(err);
            toast.error('Insert failed');
        }
    },

    insertAddressDetails: async (addressDetails) => {
        try {
            const res = await axiosInstance.post('/contact-us/insert/address-details', addressDetails);

            // console.log("res.data", res.data);
            return res.data;
        } catch (error) {
            console.error('Error inserting address details:', error);
        }
    },


    /// AboutUs ///
    getAboutUsData: async () => {
        const res = await axiosInstance.get('/contact-us/about-us');
        return res.data.data
    },

    editAboutUsContent: async (aboutUsContent) => {
        const res = await axiosInstance.put('/contact-us/about-us/content', { aboutUsContent });
        return res.data
    },

    updateAboutUsMiddleData: async (aboutUsMiddleData) => {
        const res = await axiosInstance.put('/contact-us/about-us/middle', { aboutUsMiddleData });
        return res.data
    },

    updateFooterHighlights: async (footerHighlights) => {
        const res = await axiosInstance.put('/contact-us/about-us/footer', { footerHighlights });
        return res.data
    },


    /// PrivacyPolicy ///
    getPrivacyPolicyData: async () => {
        try {
            const res = await axiosInstance.get("/contact-us/privacy-policy/get");
            if (res.data.success) {
                return res.data.data?.sections || [];
            }
        } catch (err) {
            console.error("Error fetching privacy policy:", err);
            return [];
        }
    },

    insertPrivacyPolicyData: async (sections) => {
        try {
            const res = await axiosInstance.post("/contact-us/privacy-policy/insert", { sections });
            if (res.data.success) {
                return res.data.data?.sections || [];
            }
        } catch (err) {
            console.error("Error inserting privacy policy:", err);
            return [];
        }
    },

}));
