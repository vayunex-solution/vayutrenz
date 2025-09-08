import { create } from "zustand";
import { axiosInstance } from "../../lib/axios.js";
// import { toast } from "react-hot-toast";

export const useWebHomeStore = create((set,get) => ({
    isLoading: false,
    homePageData: [],
    
    getHomeData: async () => {
        try {
            const res = await axiosInstance.get("/web/get/home-data");
            set({ homePageData: res.data?.homeData || [] });
            // console.log(res.data);
            return res.data;
        } catch (err) {
            console.error("Error fetching home data:", err);
        }
    },


    
    insertMaleHeaderData: async (payload) => get().insertHomeDataSection(payload, 'male', 'header'),
    insertFemaleHeaderData: async (payload) => get().insertHomeDataSection(payload, 'female', 'header'),
    insertMaleProductSliderData: async (payload) => get().insertHomeDataSection(payload, 'male', 'product-slider'),
    insertFemaleProductSliderData: async (payload) => get().insertHomeDataSection(payload, 'female', 'product-slider'),
    insertMaleTrendingCategoriesData: async (payload) => get().insertHomeDataSection(payload, 'male', 'trending-categories'),
    insertFemaleTrendingCategoriesData: async (payload) => get().insertHomeDataSection(payload, 'female', 'trending-categories'),
    insertMaleImageSliderData: async (payload) => get().insertHomeDataSection(payload, 'male', 'image-slider'),
    insertFemaleImageSliderData: async (payload) => get().insertHomeDataSection(payload, 'female', 'image-slider'),
    insertMaleAdvertisementPanelData: async (payload) => get().insertHomeDataSection(payload, 'male', 'advertisement-panel'),
    insertFemaleAdvertisementPanelData: async (payload) => get().insertHomeDataSection(payload, 'female', 'advertisement-panel'),

    insertHomeDataSection: async (payload, gender, section) => {
        try {
            const res = await axiosInstance.put(`/web/home/${section}/${gender}`, payload);
            // set({ homePageData: res.data });
            // console.log("res=",res);
            return res.data;
        } catch (err) {
            console.error(`Error updating ${section} for ${gender}`, err);
        }
    },

}));
